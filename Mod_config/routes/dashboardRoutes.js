import express from "express";
import axios from "axios";
import { VISITA_URL } from '../config/db.config.js';
import { CLIENTE_URL } from '../config/db.config.js';
import { EMPLEADO_URL } from '../config/db.config.js';
import { CONFIG_URL } from '../config/db.config.js';

const router = express.Router();

// ------------------------
// 📌 FUNCIONES COMPARTIDAS
// ------------------------

async function getVisitas() {
    const res = await axios.get(`${VISITA_URL}/visita`);
    return res.data.data;
}

async function getCliente(id) {
    try {
        // Traer todos los clientes con su ubicación
        const res = await axios.get(`${CLIENTE_URL}/cliente`);
        const clientes = res.data.data || [];

        // Buscar el cliente exacto
        const cliente = clientes.find(c => c.id === id);
        return cliente || null;

    } catch (error) {
        console.error("Error obteniendo cliente:", error);
        return null;
    }
}


async function getEmpleados() {
    const res = await axios.get(`${EMPLEADO_URL}/usuarios/empleado`);
    return res.data.data;
}

async function getDepartamento(id) {
    const res = await axios.get(`${CONFIG_URL}/config/departamento/${id}`);
    return res.data.data?.nombre || null;
}

async function getMunicipio(id) {
    const res = await axios.get(`${CONFIG_URL}/config/municipio/${id}`);
    return res.data.data?.nombre || null;
}

async function getClientes() {               // <---- AGREGA ESTA
    const res = await axios.get(`${CLIENTE_URL}/cliente`);
    return res.data.data;
}


// ------------------------
// 🟥 1) DASHBOARD ADMIN
// ------------------------

router.get("/admin", async (req, res) => {
    try {

        // 🔹 Obtener datos de microservicios
        const [visitas, clientes, empleados] = await Promise.all([
            getVisitas(),
            getClientes(),
            getEmpleados(),
        ]);

        // -------------------------------------------------------------------
        // 🟦 1) KPIs Generales
        // -------------------------------------------------------------------

        const totalVisitas = visitas.length;

        const visitasPorEstado = {
            registradas: visitas.filter(v => v.idEstado === 1).length,
            finalizadas: visitas.filter(v => v.idEstado === 2).length,
            canceladas: visitas.filter(v => v.idEstado === 3).length,
            reprogramadas: visitas.filter(v => v.idEstado === 4).length,
        };

        const totalClientes = clientes.length;
        const totalEmpleados = empleados.length;

        // -------------------------------------------------------------------
        // 🟩 2) Visitas por técnico
        // -------------------------------------------------------------------
        const visitasPorTecnico = {};
        visitas.forEach(v => {
            const tecnico = empleados.find(e => e.id === v.idTecnico);
            const nombre = tecnico ? `${tecnico.nombre} ${tecnico.apellido}` : `${v.idTecnico}`;
            visitasPorTecnico[nombre] = (visitasPorTecnico[nombre] || 0) + 1;
        });

        // -------------------------------------------------------------------
        // 🟨 3) Servicios más solicitados
        // -------------------------------------------------------------------
        const servicios = {};
        visitas.forEach(v => {
            const nombreServicio = v.tipoServicio?.tipo || `Servicio ${v.idTipoServicio}`;
            servicios[nombreServicio] = (servicios[nombreServicio] || 0) + 1;
        });

        // -------------------------------------------------------------------
        // 🟪 4) Departamentos más visitados
        // -------------------------------------------------------------------
        const departamentosConteo = {};

        clientes.forEach(c => {
            const idDepto = c.ubicacion?.idDepartamento;
            if (idDepto) {
                departamentosConteo[idDepto] =
                    (departamentosConteo[idDepto] || 0) + 1;
            }
        });

        // Ordena las visitas por fecha descendente y toma las últimas 10 (por ejemplo)
        const ultimasVisitas = visitas
            .sort((a, b) => new Date(b.fechaProgramada) - new Date(a.fechaProgramada))
            .slice(0, 10);

        // -------------------------------------------------------------------
        // 🟧 RESPUESTA FINAL
        // -------------------------------------------------------------------

        res.json({
            success: true,
            data: {
                totalVisitas,
                visitasPorEstado,
                totalClientes,
                totalEmpleados,
                visitasPorTecnico,
                servicios,
                departamentosConteo,
                ultimasVisitas
            },
        });

    } catch (error) {
        console.error("Dashboard Admin error:", error);
        res.status(500).json({ success: false, error: "Error en dashboard admin" });
    }
});



// ------------------------
// 🟧 2) DASHBOARD SUPERVISOR
// ------------------------

router.get("/supervisor/:id", async (req, res) => {
    try {
        const supervisorId = req.params.id;

        // Obtener visitas
        const visitas = await getVisitas();
        const propias = visitas.filter(v => Number(v.idSupervisor) === Number(supervisorId));

        // Obtener clientes con ubicación
        const resClientes = await axios.get(`${CLIENTE_URL}/cliente`);
        const clientes = resClientes.data.data || [];

        // Procesar cada visita con cliente + ubicación
        const detalladas = await Promise.all(
            propias.map(async (v) => {
                const cliente = clientes.find(c => Number(c.id) === Number(v.idCliente));

                let departamento = "N/A";
                let municipio = "N/A";

                if (cliente?.ubicacion) {
                    const { idDepartamento, idMunicipio } = cliente.ubicacion;

                    if (idDepartamento) {
                        const depRes = await axios.get(`${CONFIG_URL}/config/departamento/${idDepartamento}`);
                        departamento = depRes.data.data?.nombre || "N/A";
                    }

                    if (idMunicipio) {
                        const munRes = await axios.get(`${CONFIG_URL}/config/municipio/${idMunicipio}`);
                        municipio = munRes.data.data?.nombre || "N/A";
                    }
                }

                return {
                    ...v,
                    clienteNombre: cliente ? `${cliente.nombre} ${cliente.apellido}` : "N/A",
                    ubicacion: `${departamento}, ${municipio}`,
                    estado: v.estado || { nombre: "Sin estado" },
                    tipoServicio: v.tipoServicio || { nombre: "Sin tipo" }
                };
            })
        );

        const tecnicos = [...new Set(propias.map(v => v.idTecnico))];

        res.json({
            success: true,
            data: {
                totalVisitas: propias.length,
                finalizadas: propias.filter(v => v.idEstado === 2).length,
                canceladas: propias.filter(v => v.idEstado === 3).length,
                tecnicosSupervisados: tecnicos.length,

                // 🔥 AHORA SÍ CON CLIENTE + UBICACIÓN
                ultimasVisitas: detalladas
                    .sort((a, b) => new Date(b.fechaProgramada) - new Date(a.fechaProgramada))
            },
        });

    } catch (error) {
        console.error("Dashboard Supervisor error:", error);
        res.status(500).json({ success: false, error: "Error en dashboard supervisor" });
    }
});




// ------------------------
// 🟩 3) DASHBOARD TÉCNICO
// ------------------------

router.get("/tecnico/:id", async (req, res) => {
    try {
        const tecnicoId = req.params.id;

        // Obtener visitas
        const visitas = await getVisitas();
        const propias = visitas.filter(v => Number(v.idTecnico) === Number(tecnicoId));

        // Obtener clientes con ubicación
        const resClientes = await axios.get(`${CLIENTE_URL}/cliente`);
        const clientes = resClientes.data.data;

        const detalladas = await Promise.all(
            propias.map(async (v) => {
                const cliente = clientes.find(c =>
                    Number(c.id) === Number(v.idCliente)
                );

                let departamento = "N/A";
                let municipio = "N/A";

                if (cliente?.ubicacion) {
                    const { idDepartamento, idMunicipio } = cliente.ubicacion;

                    if (idDepartamento) {
                        const depRes = await axios.get(`${CONFIG_URL}/config/departamento/${idDepartamento}`);
                        departamento = depRes.data.data?.nombre || "N/A";
                    }

                    if (idMunicipio) {
                        const munRes = await axios.get(`${CONFIG_URL}/config/municipio/${idMunicipio}`);
                        municipio = munRes.data.data?.nombre || "N/A";
                    }
                }

                return {
                    ...v,
                    clienteNombre: cliente ? `${cliente.nombre} ${cliente.apellido}` : "N/A",
                    ubicacion: `${departamento}, ${municipio}`,
                    estado: v.estado || { nombre: "Sin estado" },
                    tipoServicio: v.tipoServicio || { nombre: "Sin tipo" }
                };
            })
        );


        res.json({
            success: true,
            data: {
                totalVisitas: propias.length,
                finalizadas: propias.filter(v => v.idEstado === 2).length,
                reprogramadas: propias.filter(v => v.idEstado === 4).length,
                canceladas: propias.filter(v => v.idEstado === 3).length,
                ultimasVisitas: detalladas
                    .sort((a, b) => new Date(b.fechaProgramada) - new Date(a.fechaProgramada))
                    .slice(0, 20),
            },
        });

    } catch (error) {
        console.error("Dashboard Técnico error:", error);
        res.status(500).json({ success: false, error: "Error en dashboard técnico" });
    }
});



export default router;
