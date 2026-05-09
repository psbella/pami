export function construirIndice(medicamentos) {
    // Usar requestIdleCallback para no bloquear
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => construirIndiceAsync(medicamentos));
    } else {
        setTimeout(() => construirIndiceAsync(medicamentos), 100);
    }
}

function construirIndiceAsync(medicamentos) {
    medicamentosGlobales = medicamentos;
    indiceBusqueda = {};
    
    // Procesar en lotes de 500 para no bloquear
    const batchSize = 500;
    let index = 0;
    
    function processBatch() {
        const end = Math.min(index + batchSize, medicamentos.length);
        for (let i = index; i < end; i++) {
            const med = medicamentos[i];
            const textoCompleto = med.DROGA_buscar + ' ' + med.MARCA_buscar + ' ' + med.LABORATORIO_buscar;
            const palabras = textoCompleto.split(/\s+/);
            
            palabras.forEach(palabra => {
                if (palabra.length < 2) return;
                if (!indiceBusqueda[palabra]) indiceBusqueda[palabra] = new Set();
                indiceBusqueda[palabra].add(i);
                
                for (let j = 2; j <= palabra.length; j++) {
                    const fragmento = palabra.substring(0, j);
                    if (!indiceBusqueda[fragmento]) indiceBusqueda[fragmento] = new Set();
                    indiceBusqueda[fragmento].add(i);
                }
            });
        }
        index = end;
        if (index < medicamentos.length) {
            setTimeout(processBatch, 50);
        } else {
            console.log('Índice construido con', medicamentos.length, 'medicamentos');
        }
    }
    
    processBatch();
}
