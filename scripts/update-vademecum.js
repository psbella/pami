const https = require('https');
const fs = require('fs');
const XLSX = require('xlsx');

const API_URL = 'https://datos.pami.org.ar/api/3/action/package_show?id=medicamentos-para-afiliados';

function buscarURLXLSX() {
    return new Promise((resolve, reject) => {
        console.log('🔍 Buscando URL del archivo XLSX en el portal de datos...');
        
        https.get(API_URL, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (!json.success) {
                        reject('Error en la API: ' + (json.error || 'Unknown error'));
                        return;
                    }
                    
                    const recursos = json.result.resources;
                    const xlsx = recursos.find(r => r.format === 'XLSX');
                    
                    if (xlsx) {
                        console.log(`✅ URL encontrada: ${xlsx.url}`);
                        console.log(`📅 Última modificación: ${xlsx.last_modified || 'No especificada'}`);
                        resolve(xlsx.url);
                    } else {
                        reject('No se encontró ningún archivo XLSX en el dataset');
                    }
                } catch (e) {
                    reject('Error al parsear JSON: ' + e.message);
                }
            });
        }).on('error', (err) => {
            reject('Error de conexión: ' + err.message);
        });
    });
}

function descargarYProcesar(url) {
    return new Promise((resolve, reject) => {
        console.log('📥 Descargando base de datos...');
        
        https.get(url, (response) => {
            const chunks = [];
            response.on('data', (chunk) => chunks.push(chunk));
            response.on('end', () => {
                const buffer = Buffer.concat(chunks);
                const workbook = XLSX.read(buffer, { type: 'buffer' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const data = XLSX.utils.sheet_to_json(sheet);
                resolve(data);
            });
        }).on('error', (err) => {
            reject('Error de descarga: ' + err.message);
        });
    });
}

function procesarDatos(data) {
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
}

async function main() {
    try {
        const url = await buscarURLXLSX();
        const data = await descargarYProcesar(url);
        procesarDatos(data);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

main();
