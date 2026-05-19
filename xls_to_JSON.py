import json
import re
import os
import sys
import unicodedata
from datetime import datetime
from openpyxl import load_workbook

# Forzar UTF-8 en la salida
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

def limpiar_texto(texto):
    """Limpia y normaliza texto, corrige acentos mal codificados"""
    if not texto:
        return ''
    texto = str(texto)
    # Reemplazar caracteres mal codificados comunes
    reemplazos = {
        'Ã¡': 'á', 'Ã©': 'é', 'Ã­': 'í', 'Ã³': 'ó', 'Ãº': 'ú',
        'Ã±': 'ñ', 'Ã¼': 'ü', 'Ã‘': 'Ñ', 'Ã': 'í',
        'Â¡': '¡', 'Â¿': '¿', 'Â°': '°',
        'BagÃ³': 'Bagó', 'CassarÃŸ': 'Cassará',
        'Temis-LostalÃ¿': 'Temis-Lostaló',
        'GÃ¿minis FarmacÃ¿': 'Géminis Farmacéutica',
        'AndrÃ¿maco': 'Andrómaco',
        'Microsules Arg.': 'Microsules Argentina',
    }
    for mal, bien in reemplazos.items():
        texto = texto.replace(mal, bien)
    # Normalizar Unicode (convertir caracteres a su forma base)
    texto = unicodedata.normalize('NFC', texto)
    return texto.strip()

# Buscar el archivo XLSX
archivo_xls = None
for archivo in os.listdir('.'):
    if archivo.endswith('.xlsx'):
        archivo_xls = archivo
        break

if not archivo_xls:
    print("❌ No hay archivo .xlsx en esta carpeta")
    exit(1)

print(f"📄 Leyendo: {archivo_xls}")
wb = load_workbook(archivo_xls, data_only=True)
ws = wb.active

medicamentos = []

for row in ws.iter_rows(min_row=2, values_only=True):
    if not row[0]:
        continue
    
    droga = limpiar_texto(row[0])
    marca = limpiar_texto(row[1])
    presentacion = limpiar_texto(row[2])
    laboratorio = limpiar_texto(row[3])
    cobertura = str(row[4]).replace('%', '').strip() if row[4] else '0'
    
    precio_raw = str(row[5]) if row[5] else '0'
    precio_limpio = re.sub(r'[^\d.,-]', '', precio_raw).replace(',', '.')
    try:
        copago = float(precio_limpio)
    except:
        copago = 0
    
    medicamentos.append({
        "DROGA": droga,
        "MARCA": marca,
        "PRESENTACION": presentacion,
        "LABORATORIO": laboratorio,
        "COBERTURA": cobertura,
        "COPAGO": copago
    })

fecha = datetime.now().strftime("%d/%m/%Y %H:%M")
datos = {"fecha": fecha, "medicamentos": medicamentos}

# Guardar JSON con UTF-8
with open('medicamentos.json', 'w', encoding='utf-8') as f:
    json.dump(datos, f, ensure_ascii=False, indent=2)

print(f"✅ {len(medicamentos)} medicamentos guardados")
print(f"📅 Fecha: {fecha}")

# Mostrar algunos laboratorios para verificar
laboratorios_unicos = {}
for med in medicamentos[:50]:
    lab = med['LABORATORIO']
    if lab and lab not in laboratorios_unicos:
        laboratorios_unicos[lab] = True
print(f"🔤 Muestra de laboratorios: {list(laboratorios_unicos.keys())[:5]}")