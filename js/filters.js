// Filtros y ordenamiento

export function aplicarFiltros(lista, presentacion, laboratorio, orden) {
    let resultado = [...lista];
    
    if (presentacion) {
        resultado = resultado.filter(med => med.PRESENTACION === presentacion);
    }
    
    if (laboratorio) {
        resultado = resultado.filter(med => med.LABORATORIO === laboratorio);
    }
    
    if (orden === 'asc') {
        resultado.sort((a, b) => a.COPAGO - b.COPAGO);
    } else if (orden === 'desc') {
        resultado.sort((a, b) => b.COPAGO - a.COPAGO);
    }
    
    return resultado;
}

export function extraerOpcionesFiltros(medicamentos) {
    const presentaciones = new Set();
    const laboratorios = new Set();
    
    for (let i = 0; i < medicamentos.length; i++) {
        const med = medicamentos[i];
        if (med.PRESENTACION && med.PRESENTACION !== 'N/A') {
            presentaciones.add(med.PRESENTACION);
        }
        if (med.LABORATORIO && med.LABORATORIO !== 'N/A') {
            laboratorios.add(med.LABORATORIO);
        }
    }
    
    return {
        presentaciones: Array.from(presentaciones).sort(),
        laboratorios: Array.from(laboratorios).sort()
    };
}
