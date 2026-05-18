const https = require('https');
const fs = require('fs');
const XLSX = require('xlsx');

const XLSX_URL = 'http://datos.pami.org.ar/dataset/b40f7569-3a23-46bf-8a45-dd7cff41e725/resource/92ad6862-af8e-4047-b2cb-4bfef705feb3/download/afiliados20260504_100332.xlsx';

console.log('📥 Descargando base de datos...');

https.get(XLSX_URL, (response) => {
    const chunks = [];
    response.on('data', (chunk) => chunks.push(chunk));
    response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet);

        console.log(`📦 Procesando ${data.length} registros...`);

        const fecha = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });
        const medicamentos = data.map(row => ({
            DROGA: row.DROGA || '',
            MARCA: row.MARCA || '',
            PRESENTACION: row.PRESENTACION || '',
            LABORATORIO: row.LABORATORIO || '',
            COBERTURA: String(row.COBERTURA || '0').replace('%', ''),
            COPAGO: parseFloat(String(row.COPAGO || '0').replace('$', '').replace(/\./g, '').replace(',', '.')) || 0
        }));

        const output = {
            fecha: fecha,
            medicamentos: medicamentos
        };

        fs.writeFileSync('medicamentos.json', JSON.stringify(output, null, 2));
        console.log(`✅ medicamentos.json actualizado con ${medicamentos.length} medicamentos`);
        console.log(`📅 Fecha: ${fecha}`);
    });
}).on('error', (err) => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
