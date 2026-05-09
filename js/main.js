// Punto de entrada principal

import { cargarDatos, getMedicamentos, getFechaActualizacion } from './dataLoader.js';
import { construirIndice, buscarMedicamentos, getMedicamentosGlobales } from './searchEngine.js';
import { aplicarFiltros, extraerOpcionesFiltros } from './filters.js';
import { 
    actualizarContadorTotal, 
    cargarOpcionesFiltros, 
    mostrarResultados, 
    actualizarFechaEnFooter 
} from './uiRenderer.js';
import { mapearMedicamento } from './mapeador.js';

let timeoutBuscador;
let resultadosUltimaBusqueda = [];

function mapearLista(medicamentosRaw) {
    return medicamentosRaw.map((item, idx) => mapearMedicamento(item, idx));
}

function actualizarTodo() {
    const textoBusqueda = document.getElementById('buscador').value.trim();
    let resultados;
    
    if (textoBusqueda && textoBusqueda.length >= 3) {
        resultados = buscarMedicamentos(textoBusqueda);
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
                timeoutBuscador = setTimeout(() => actualizarTodo(), 100);
                return;
            }
            
            if (texto.length < 3) {
                document.getElementById('resultados').innerHTML = '<div class="mensaje-inicial"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#5f6368" stroke-width="1.5"><circle cx="10" cy="10" r="7"/><line x1="15" y1="15" x2="21" y2="21"/></svg><p>Ingresá al menos 3 caracteres</p></div>';
                document.getElementById('contador').innerHTML = '';
                return;
            }
            
            document.getElementById('resultados').innerHTML = '<div class="mensaje-inicial"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#5f6368" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><p>Buscando...</p></div>';
            timeoutBuscador = setTimeout(() => actualizarTodo(), 200);
        });
    }
    
    if (btnBuscar) {
        btnBuscar.addEventListener('click', () => {
            clearTimeout(timeoutBuscador);
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
    actualizarTodo();
}

async function init() {
    try {
        const { medicamentos, fecha } = await cargarDatos();
        const medicamentosMapeados = mapearLista(medicamentos);
        
        construirIndice(medicamentosMapeados);
        actualizarContadorTotal(medicamentosMapeados.length);
        actualizarFechaEnFooter(fecha);
        
        const opciones = extraerOpcionesFiltros(medicamentosMapeados);
        cargarOpcionesFiltros(opciones.presentaciones, opciones.laboratorios);
        
        resultadosUltimaBusqueda = [...medicamentosMapeados];
        mostrarResultados(medicamentosMapeados);
        
        setupEventListeners();
        
        document.getElementById('resultados').innerHTML = '<div class="mensaje-inicial"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#5f6368" stroke-width="1.5"><circle cx="10" cy="10" r="7"/><line x1="15" y1="15" x2="21" y2="21"/></svg><p>Buscá un medicamento para ver los resultados</p></div>';
        document.getElementById('contador').innerHTML = '';
        
    } catch (error) {
        console.error(error);
        document.getElementById('resultados').innerHTML = '<p>Error al cargar los datos: ' + error.message + '</p>';
    }
}

init();
