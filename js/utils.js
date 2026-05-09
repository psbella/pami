// Utilidades generales

export function normalizarTexto(texto) {
    if (!texto) return '';
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

export function formatearPrecio(precio) {
    if (typeof precio !== 'number' || isNaN(precio)) return '$0';
    return '$' + precio.toLocaleString();
}

export function formatearCobertura(cobertura) {
    if (!cobertura) return '?%';
    return cobertura + '%';
}
