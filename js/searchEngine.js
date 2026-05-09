// Índice de búsqueda

import { normalizarTexto } from './utils.js';

let indiceBusqueda = {};
let medicamentosGlobales = [];

export function construirIndice(medicamentos) {
    medicamentosGlobales = medicamentos;
    indiceBusqueda = {};
    
    for (let i = 0; i < medicamentos.length; i++) {
        const med = medicamentos[i];
        const textoCompleto = med.DROGA_buscar + ' ' + med.MARCA_buscar + ' ' + med.LABORATORIO_buscar;
        const palabras = textoCompleto.split(/\s+/);
        
        for (let j = 0; j < palabras.length; j++) {
            const palabra = palabras[j];
            if (palabra.length < 2) continue;
            
            if (!indiceBusqueda[palabra]) {
                indiceBusqueda[palabra] = new Set();
            }
            indiceBusqueda[palabra].add(i);
            
            for (let k = 2; k <= palabra.length; k++) {
                const fragmento = palabra.substring(0, k);
                if (!indiceBusqueda[fragmento]) {
                    indiceBusqueda[fragmento] = new Set();
                }
                indiceBusqueda[fragmento].add(i);
            }
        }
    }
    
    if (window.location.hostname === 'localhost') console.log('...');
}

export function buscarMedicamentos(texto) {
    if (!texto || texto.length < 2) {
        return [...medicamentosGlobales];
    }
    
    const textoNormalizado = normalizarTexto(texto);
    const resultadosSet = indiceBusqueda[textoNormalizado] || new Set();
    const resultados = [];
    
    for (let idx of resultadosSet) {
        resultados.push(medicamentosGlobales[idx]);
    }
    
    return resultados;
}

export function getMedicamentosGlobales() {
    return medicamentosGlobales;
}
