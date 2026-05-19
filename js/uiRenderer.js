// Renderizado de UI

import { formatearPrecio, formatearCobertura } from './utils.js';

export function mostrarSkeleton() {
    const contenedor = document.getElementById('resultados');
    if (!contenedor) return;
    
    if (contenedor.children.length > 0 && !contenedor.querySelector('.skeleton-card')) {
        return;
    }
    
    const skeletons = [];
    for (let i = 0; i < 5; i++) {
        skeletons.push(`
            <div class="skeleton-card">
                <div class="skeleton-title"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line short"></div>
            </div>
        `);
    }
    contenedor.innerHTML = skeletons.join('');
}

export function mostrarMensajeInicial() {
    const contenedor = document.getElementById('resultados');
    if (!contenedor) return;
    
    contenedor.innerHTML = `
        <div class="mensaje-inicial">
            <svg width="32" height="32"><use href="#icon-search"/></svg>
            <p>Buscá un medicamento para ver los resultados</p>
        </div>
    `;
}

export function actualizarContadorTotal(cantidad) {
    const span = document.getElementById('totalMedicamentos');
    if (!span) return;
    
    let inicio = 0;
    const duracion = 800;
    const paso = 16;
    const incremento = cantidad / (duracion / paso);
    
    const intervalo = setInterval(() => {
        inicio += incremento;
        if (inicio >= cantidad) {
            span.innerText = cantidad.toLocaleString();
            clearInterval(intervalo);
        } else {
            span.innerText = Math.floor(inicio).toLocaleString();
        }
    }, paso);
}

export function cargarOpcionesFiltros(presentaciones, laboratorios, selectedPres = '', selectedLab = '') {
    const selectPresentacion = document.getElementById('filtroPresentacion');
    const selectLaboratorio = document.getElementById('filtroLaboratorio');
    
    if (selectPresentacion) {
        selectPresentacion.innerHTML = '<option value="">Todas</option>';
        for (let i = 0; i < presentaciones.length; i++) {
            const p = presentaciones[i];
            const option = document.createElement('option');
            option.value = p;
            option.textContent = p.length > 50 ? p.substring(0, 50) + '...' : p;
            selectPresentacion.appendChild(option);
        }
        if (presentaciones.includes(selectedPres)) selectPresentacion.value = selectedPres;
        else selectPresentacion.value = '';
    }
    
    if (selectLaboratorio) {
        selectLaboratorio.innerHTML = '<option value="">Todos</option>';
        for (let i = 0; i < laboratorios.length; i++) {
            const l = laboratorios[i];
            const option = document.createElement('option');
            option.value = l;
            option.textContent = l;
            selectLaboratorio.appendChild(option);
        }
        if (laboratorios.includes(selectedLab)) selectLaboratorio.value = selectedLab;
        else selectLaboratorio.value = '';
    }
}

export function mostrarResultados(lista) {
    const contenedor = document.getElementById('resultados');
    const contadorDiv = document.getElementById('contador');
    
    if (!lista || lista.length === 0) {
        contenedor.innerHTML = '<div class="mensaje-inicial"><svg width="32" height="32"><use href="#icon-search"/></svg><p>No se encontraron medicamentos.</p></div>';
        contadorDiv.innerHTML = '0 resultados';
        return;
    }
    
    contadorDiv.innerHTML = lista.length + ' resultado' + (lista.length !== 1 ? 's' : '');
    
    const listaMostrar = lista.slice(0, 200);
    if (lista.length > 200) {
        contadorDiv.innerHTML += ' (mostrando 200 de ' + lista.length + ')';
    }
    
    let html = '';
    for (let i = 0; i < listaMostrar.length; i++) {
        const med = listaMostrar[i];
        html += `
            <div class="tarjeta">
                <div class="tarjeta-header">
                    <h3 class="marca-tarjeta">${med.MARCA || 'N/A'}</h3>
                    <span class="laboratorio-badge">${med.LABORATORIO || 'N/A'}</span>
                </div>
                <div class="tabla-interna">
                    <div class="fila-tabla">
                        <div class="celda etiqueta">Droga</div>
                        <div class="celda valor">${med.DROGA || 'N/A'}</div>
                    </div>
                    <div class="fila-tabla">
                        <div class="celda etiqueta">Presentación</div>
                        <div class="celda valor">${med.PRESENTACION || 'N/A'}</div>
                    </div>
                    <div class="fila-tabla">
                        <div class="celda etiqueta">Cobertura</div>
                        <div class="celda valor"><span class="cobertura-tag">${formatearCobertura(med.COBERTURA)}</span></div>
                    </div>
                    <div class="fila-tabla">
                        <div class="celda etiqueta">Precio final</div>
                        <div class="celda valor precio-destacado">${formatearPrecio(med.COPAGO)}</div>
                    </div>
                </div>
            </div>
        `;
    }
    contenedor.innerHTML = html;
}

export function actualizarFechaEnFooter(fecha) {
    const fechaElem = document.getElementById('fecha-actualizacion');
    if (fechaElem) {
        fechaElem.textContent = fecha || 'No disponible';
    }
}