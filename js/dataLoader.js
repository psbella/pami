// Carga de datos y fecha

let medicamentosCache = [];
let fechaActualizacion = null;

export async function cargarDatos() {
    try {
        const response = await fetch('medicamentos.json');
        const data = await response.json();
        
        let datosMedicamentos;
        
        if (data.medicamentos && Array.isArray(data.medicamentos)) {
            fechaActualizacion = data.fecha;
            datosMedicamentos = data.medicamentos;
        } else if (Array.isArray(data)) {
            datosMedicamentos = data;
        } else {
            throw new Error('Formato de datos inválido');
        }
        
        medicamentosCache = datosMedicamentos;
        return { medicamentos: medicamentosCache, fecha: fechaActualizacion };
    } catch (error) {
        console.error('Error al cargar datos:', error);
        throw error;
    }
}

export function getMedicamentos() {
    return medicamentosCache;
}

export function getFechaActualizacion() {
    return fechaActualizacion;
}
