// Punto de entrada principal

import { cargarDatos } from './dataLoader.js';
import { construirIndice, buscarMedicamentos, getMedicamentosGlobales } from './searchEngine.js';
import { aplicarFiltros, extraerOpcionesFiltros } from './filters.js';
import { 
    mostrarSkeleton,
    actualizarContadorTotal, 
    cargarOpcionesFiltros, 
    mostrarResultados, 
    actualizarFechaEnFooter,
    mostrarMensajeInicial
} from './uiRenderer.js';
import { mapearMedicamento } from './mapeador.js';

let timeoutBuscador;
let resultadosUltimaBusqueda = [];

function mapearLista(medicamentosRaw) {
    const resultado = [];
    for (let i = 0; i < medicamentosRaw.length; i++) {
        resultado.push(mapearMedicamento(medicamentosRaw[i], i));
    }
    return resultado;
}

function actualizarTodo() {
    const textoBusqueda = document.getElementById('buscador').value.trim();
    let resultados;
    
    if (textoBusqueda && textoBusqueda.length >= 3) {
        resultados = buscarMedicamentos(textoBusqueda);
    } else if (textoBusqueda === '') {
        // Si el buscador está vacío, no mostrar resultados
        mostrarMensajeInicial();
        document.getElementById('contador').innerHTML = '';
        return;
    } else {
        resultados = [...getMedicamentosGlobales()];
    }
    
    resultadosUltimaBusqueda = resultados;
    
    const opciones = extraerOpcionesFiltros(resultados);
    const presentacionSeleccionada = document.getElementById('filtroPresentacion').value;
    const laboratorioSeleccionado = document.getElementById('filtroLaboratorio').value;
    const ordenSeleccionado = document.getElementById('ordenPrecio').value;
    
    const resultadosFiltrados = aplicarFiltros(resultados, presentacionSeleccionada, laboratorioSeleccionado, ordenSeleccionado);
    
    cargarOpcionesFiltros(opciones.presentaciones, opciones.laboratorios, presentacionSeleccionada, laboratorioSeleccionado);
    mostrarResultados(resultadosFiltrados);
}

function setupEventListeners() {
    const buscador = document.getElementById('buscador');
    const btnBuscar = document.getElementById('btnBuscar');
    const btnLimpiar = document.getElementById('btnLimpiarFiltros');
    const filtroPresentacion = document.getElementById('filtroPresentacion');
    const filtroLaboratorio = document.getElementById('filtroLaboratorio');
    const ordenPrecio = document.getElementById('ordenPrecio');
    
    if (buscador) {
        buscador.addEventListener('input', (e) => {
            clearTimeout(timeoutBuscador);
            const texto = e.target.value.trim();
            
            if (texto === '') {
                // Si se borra el texto, mostrar mensaje inicial
                mostrarMensajeInicial();
                document.getElementById('contador').innerHTML = '';
                return;
            }
            
            if (texto.length < 3) {
                document.getElementById('resultados').innerHTML = '<div class="mensaje-inicial"><svg width="32" height="32"><use href="#icon-search"/></svg><p>Ingresá al menos 3 caracteres</p></div>';
                document.getElementById('contador').innerHTML = '';
                return;
            }
            
            mostrarSkeleton();
            timeoutBuscador = setTimeout(() => actualizarTodo(), 200);
        });
    }
    
    if (btnBuscar) {
        btnBuscar.addEventListener('click', () => {
            const texto = document.getElementById('buscador').value.trim();
            if (texto.length < 3) {
                document.getElementById('resultados').innerHTML = '<div class="mensaje-inicial"><svg width="32" height="32"><use href="#icon-search"/></svg><p>Ingresá al menos 3 caracteres</p></div>';
                return;
            }
            clearTimeout(timeoutBuscador);
            mostrarSkeleton();
            actualizarTodo();
        });
    }
    
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', limpiarFiltros);
    }
    
    if (filtroPresentacion) filtroPresentacion.addEventListener('change', () => filtrarResultados());
    if (filtroLaboratorio) filtroLaboratorio.addEventListener('change', () => filtrarResultados());
    if (ordenPrecio) ordenPrecio.addEventListener('change', () => ordenarResultados());
}

function filtrarResultados() {
    const presentacion = document.getElementById('filtroPresentacion').value;
    const laboratorio = document.getElementById('filtroLaboratorio').value;
    const orden = document.getElementById('ordenPrecio').value;
    const resultadosFiltrados = aplicarFiltros(resultadosUltimaBusqueda, presentacion, laboratorio, orden);
    mostrarResultados(resultadosFiltrados);
}

function ordenarResultados() {
    const presentacion = document.getElementById('filtroPresentacion').value;
    const laboratorio = document.getElementById('filtroLaboratorio').value;
    const orden = document.getElementById('ordenPrecio').value;
    const resultadosFiltrados = aplicarFiltros(resultadosUltimaBusqueda, presentacion, laboratorio, orden);
    mostrarResultados(resultadosFiltrados);
}

function limpiarFiltros() {
    document.getElementById('filtroPresentacion').value = '';
    document.getElementById('filtroLaboratorio').value = '';
    document.getElementById('ordenPrecio').value = '';
    
    const textoBusqueda = document.getElementById('buscador').value.trim();
    if (textoBusqueda === '') {
        mostrarMensajeInicial();
        document.getElementById('contador').innerHTML = '';
    } else {
        mostrarSkeleton();
        actualizarTodo();
    }
}

async function init() {
    mostrarSkeleton();
    
    try {
        const { medicamentos, fecha } = await cargarDatos();
        const medicamentosMapeados = mapearLista(medicamentos);
        
        construirIndice(medicamentosMapeados);
        actualizarContadorTotal(medicamentosMapeados.length);
        actualizarFechaEnFooter(fecha);
        
        const opciones = extraerOpcionesFiltros(medicamentosMapeados);
        cargarOpcionesFiltros(opciones.presentaciones, opciones.laboratorios);
        
        resultadosUltimaBusqueda = [...medicamentosMapeados];
        
        // No mostrar resultados al cargar, solo el mensaje inicial
        mostrarMensajeInicial();
        
        setupEventListeners();
        
    } catch (error) {
        console.error(error);
        document.getElementById('resultados').innerHTML = '<div class="mensaje-inicial"><svg width="32" height="32"><use href="#icon-search"/></svg><p>Error al cargar los datos: ' + error.message + '</p></div>';
        document.getElementById('contador').innerHTML = '';
    }
}

init();
