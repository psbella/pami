// Transformación del JSON al objeto interno

import { normalizarTexto } from './utils.js';

export function mapearMedicamento(item, idx) {
    // Formato nuevo (con DROGA, MARCA, etc.)
    if (item.DROGA !== undefined) {
        return {
            id: idx,
            DROGA: item.DROGA || '',
            MARCA: item.MARCA || '',
            PRESENTACION: item.PRESENTACION || '',
            LABORATORIO: item.LABORATORIO || '',
            COBERTURA: (item.COBERTURA || '').replace('%', ''),
            COPAGO: parseFloat(String(item.COPAGO || 0).replace('$', '').replace(/\s/g, '').replace(',', '')) || 0,
            DROGA_buscar: normalizarTexto(item.DROGA || ''),
            MARCA_buscar: normalizarTexto(item.MARCA || ''),
            LABORATORIO_buscar: normalizarTexto(item.LABORATORIO || '')
        };
    }
    
    // Formato viejo (con A, B, C, D, E, F)
    const cobertura = (item.E || '').replace('%', '');
    const precio = (item.F || '0').replace('$', '').replace(/\s/g, '').replace(',', '');
    
    return {
        id: idx,
        DROGA: item.A || '',
        MARCA: item.B || '',
        PRESENTACION: item.C || '',
        LABORATORIO: item.D || '',
        COBERTURA: cobertura,
        COPAGO: parseFloat(precio) || 0,
        DROGA_buscar: normalizarTexto(item.A || ''),
        MARCA_buscar: normalizarTexto(item.B || ''),
        LABORATORIO_buscar: normalizarTexto(item.D || '')
    };
}
