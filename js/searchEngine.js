Skip to content
psbella
pami
Repository navigation
Code
Issues
Pull requests
Agents
Actions
Projects
Wiki
Security and quality
Insights
Settings
pami/js
/
searchEngine.js
in
main

Edit

Preview
Indent mode

Spaces
Indent size

4
Line wrap mode

No wrap
Editing searchEngine.js file contents
  1
  2
  3
  4
  5
  6
  7
  8
  9
 10
 11
 12
 13
 14
 15
 16
 17
 18
 19
 20
 21
 22
 23
 24
 25
 26
 27
 28
 29
 30
 31
 32
 33
 34
 35
 36
 37
 38
 39
 40
 41
 42
 43
 44
 45
 46
 47
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

Use Control + Shift + m to toggle the tab key moving focus. Alternatively, use esc then tab to move to the next interactive element on the page.
