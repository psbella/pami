const axios = require('axios');
const cheerio = require('cheerio');
const XLSX = require('xlsx');
const fs = require('fs');

async function run() {
    try {
        console.log("🔍 Buscando enlace de descarga en PAMI...");
        const portalUrl = 'https://datos.pami.org.ar/dataset/medicamentos-para-afiliados';
        const { data: html } = await axios.get(portalUrl);
        const $ = cheerio.load(html);
        
        // Buscamos el link al .xlsx
        const downloadUrl = $('a[href$=".xlsx"]').first().attr('href');
        if (!downloadUrl) throw new Error("No se encontró el archivo .xlsx");
        
        console.log(`📥 Descargando: ${downloadUrl}`);
        const response = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
        
        // Leemos el Excel
        const workbook = XLSX.read(response.data);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(sheet);
        
        console.log(`📦 Procesando ${rawData.length} registros...`);

        // Mapeo a tu estructura actual (Ajustá los nombres de columnas si cambian)
        const medicamentos = rawData.map(item => ({
            MARCA: (item['Nombre Comercial'] || item['MARCA'] || 'N/A').trim(),
            DROGA: (item['Monodroga'] || item['DROGA'] || 'N/A').trim(),
            PRESENTACION: (item['Presentación'] || 'N/A').trim(),
            COBERTURA: item['Porcentaje Cobertura'] || 0,
            COPAGO: item['Precio Afiliado'] || item['PVP'] || 0,
            LABORATORIO: (item['Laboratorio'] || 'N/A').trim()
        }));

        // Guardamos el JSON minificado
        fs.writeFileSync('./medicamentos.json', JSON.stringify(medicamentos));
        console.log("✅ medicamentos.json actualizado y normalizado.");

    } catch (error) {
        console.error("❌ Error en la actualización:", error.message);
        process.exit(1);
    }
}

run();
