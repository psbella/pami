const cheerio = require('cheerio');
const XLSX = require('xlsx');
const fs = require('fs');

async function run() {
    try {
        console.log("🔍 Iniciando rastreo en el portal de PAMI...");
        const portalUrl = 'https://datos.pami.org.ar/dataset/medicamentos-para-afiliados';
        
        // 1. Obtener el HTML del portal
        const portalRes = await fetch(portalUrl);
        if (!portalRes.ok) throw new Error(`Error al acceder al portal: ${portalRes.statusText}`);
        const html = await portalRes.text();
        
        // 2. Buscar el enlace al archivo .xlsx
        const $ = cheerio.load(html);
        const downloadUrl = $('a[href$=".xlsx"]').first().attr('href');
        
        if (!downloadUrl) {
            throw new Error("No se pudo encontrar ningún enlace de descarga .xlsx en la página.");
        }
        
        console.log(`📥 Descargando base de datos desde: ${downloadUrl}`);
        
        // 3. Descargar el archivo
        const fileRes = await fetch(downloadUrl);
        if (!fileRes.ok) throw new Error(`Error al descargar el archivo: ${fileRes.statusText}`);
        const arrayBuffer = await fileRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // 4. Leer y procesar el Excel
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        
        console.log(`📦 Procesando ${rawData.length} registros...`);

        // 5. Mapear a tu estructura JSON (Normalización automática)
        const medicamentos = rawData.map(item => {
            // Limpieza de datos y valores por defecto
            return {
                MARCA: String(item['Nombre Comercial'] || item['MARCA'] || 'N/A').trim(),
                DROGA: String(item['Monodroga'] || item['DROGA'] || 'N/A').trim(),
                PRESENTACION: String(item['Presentación'] || 'N/A').trim(),
                COBERTURA: parseInt(item['Porcentaje Cobertura']) || 0,
                COPAGO: parseFloat(item['Precio Afiliado'] || item['PVP'] || 0),
                LABORATORIO: String(item['Laboratorio'] || 'N/A').trim()
            };
        });

        // 6. Guardar el resultado final
        // Esto sobreescribe tu medicamentos.json con datos frescos y UTF-8 limpio
        fs.writeFileSync('./medicamentos.json', JSON.stringify(medicamentos, null, 2));
        
        console.log("✅ Proceso finalizado. medicamentos.json actualizado con éxito.");

    } catch (error) {
        console.error("❌ Error crítico en el proceso:");
        console.error(error.message);
        process.exit(1);
    }
}

run();
