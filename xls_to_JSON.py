import json
import re
import os
from datetime import datetime
from openpyxl import load_workbook

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
    
    droga = str(row[0]).strip() if row[0] else ''
    marca = str(row[1]).strip() if row[1] else ''
    presentacion = str(row[2]).strip() if row[2] else ''
    laboratorio = str(row[3]).strip() if row[3] else ''
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

with open('medicamentos.json', 'w', encoding='utf-8') as f:
    json.dump(datos, f, ensure_ascii=False, indent=2)

print(f"✅ {len(medicamentos)} medicamentos guardados")
print(f"📅 Fecha: {fecha}")