// Índice de búsqueda

import { normalizarTexto } from './utils.js';

let indiceBusqueda = {};
let medicamentosGlobales = [];

export function construirIndice(medicamentos) {
    medicamentosGlobales = medicamentos;
    indiceBusqueda = {};
    
    medicamentos.forEach((med, idx) => {
        const textoCompleto = med.DROGA_buscar + ' ' + med.MARCA_buscar + ' ' + med.LABORATORIO_buscar;
        const palabras = textoCompleto.split(/\s+/);
        
        palabras.forEach(palabra => {
            if (palabra.length < 2) return;
            
            if (!indiceBusqueda[palabra]) {
                indiceBusqueda[palabra] = new Set();
            }
            indiceBusqueda[palabra].add(idx);
            
            for (let i = 2; i <= palabra.length; i++) {
                const fragmento = palabra.substring(0, i);
                if (!indiceBusqueda[fragmento]) {
                    indiceBusqueda[fragmento] = new Set();
                }
                indiceBusqueda[fragmento].add(idx);
            }
        });
    });
    
    console.log('Índice construido con', medicamentos.length, 'medicamentos');
}

export function buscarMedicamentos(texto) {
    if (!texto || texto.length < 2) return [...medicamentosGlobales];
    
    const textoNormalizado = normalizarTexto(texto);
    const resultadosSet = indiceBusqueda[textoNormalizado] || new Set();
    
    return [...resultadosSet].map(idx => medicamentosGlobales[idx]);
}

export function getMedicamentosGlobales() {
    return medicamentosGlobales;
}
