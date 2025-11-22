// routes/visitasRoutes.js
import express from 'express';
import axios from 'axios';
import User from '../db/models/visitas.js';
import Estado from "../db/models/estado.js";
import TipoServicio from "../db/models/tipoServicio.js";

const router = express.Router();
const CLIENTE_URL = process.env.CLIENTE || "http://localhost:3000";
const EMPLEADO_URL = process.env.EMPLEADO || "http://localhost:5000";


async function getEmpleado(id) {
    try {
        const res = await axios.get(`${EMPLEADO_URL}/usuarios/empleado/${id}`);
        return res.data.data;
    } catch {
        return null;
    }
}


router.put('/estados/visit/:id', async (req, res) => {
    try {
        const visita = await User.findByPk(req.params.id);
        if (!visita)
            return res.status(404).json({ success: false, error: 'Visita no encontrada.' });

        const { idEstado, observaciones, motivo } = req.body;

        const cliente = await getCliente(visita.idCliente);
        const tecnico = await getEmpleado(visita.idTecnico);
        const supervisor = await getEmpleado(visita.idSupervisor);

        visita.idEstado = idEstado;
        visita.observaciones = observaciones || visita.observaciones;
        visita.motivo = motivo || visita.motivo;

        // FINALIZADA
        if (idEstado === 2) {
            await visita.save();

        } else if (idEstado === 3 || idEstado === 4) {
            visita.reprogramacion = true;
            await visita.save();

        } else {
            await visita.save();
        }

        // 🔥 Obtener estado y tipoServicio
        const estado = await Estado.findByPk(visita.idEstado);
        const tipoServicio = await TipoServicio.findByPk(visita.idTipoServicio);

        return res.json({
            success: true,
            data: {
                ...visita.dataValues,
                estado,
                tipoServicio
            },
            message: 'Visita registrada correctamente.'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});



router.put('/reprogramar/:id', async (req, res) => {
    try {
        const visita = await User.findByPk(req.params.id);
        if (!visita) return res.status(404).json({ success: false, error: 'Visita no encontrada.' });

        const { fechaProgramada } = req.body;

        visita.fechaProgramada = fechaProgramada;
        visita.reprogramacion = false;
        await visita.save();

        const cliente = await getCliente(visita.idCliente);
        const supervisor = await getEmpleado(visita.idSupervisor);

        return res.json({ success: true, message: 'Visita reprogramada y correos enviados.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.get('/', async (req, res) => {
    try {
        const visitas = await User.findAll({
            where: { status: 1 }
        });

        // resolver estado y tipoServicio manualmente
        const resultado = await Promise.all(
            visitas.map(async (v) => {
                const estado = v.dataValues.idEstado
                    ? await Estado.findByPk(v.dataValues.idEstado)
                    : null;

                const tipoServicio = v.dataValues.idTipoServicio
                    ? await TipoServicio.findByPk(v.dataValues.idTipoServicio)
                    : null;

                return {
                    ...v.dataValues,
                    estado,
                    tipoServicio,
                };
            })
        );

        res.status(200).json({
            success: true,
            data: resultado,
            message: 'Visitas obtenidas correctamente.'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});


router.get('/:id', async (req, res) => {
    const Id = req.params.id;

    try {
        const data = await User.findByPk(Id);

        if (!data) {
            return res.status(404).json({ success: false, error: 'Visita no encontrada.' });
        }

        res.status(200).json({ success: true, data, message: 'Visitas obtenida correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.post('/', async (req, res) => {
    const {
        idCliente,
        idSupervisor,
        idTecnico,
        fechaProgramada,
        descripcion,
        idTipoServicio,
        idEstado,
        creadoPor,
        actualizadoPor
    } = req.body;

    try {
        const existe = await User.findOne({
            where: { idTecnico, fechaProgramada },
        });

        if (existe) {
            return res.status(400).json({
                success: false,
                message: 'El técnico ya tiene una visita asignada en esa hora.',
            });
        }

        const newVisita = await User.create({
            idCliente,
            idSupervisor,
            idTecnico,
            fechaProgramada,
            idTipoServicio,
            descripcion,
            idEstado: idEstado || 1, // valor por defecto
            status: 1,
            creadoPor,
            actualizadoPor,
        });

        res.status(201).json({
            success: true,
            data: newVisita,
            message: 'Visita creada correctamente.',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.put('/:id', async (req, res) => {
    const Id = req.params.id;
    const {
        idCliente,
        idSupervisor,
        idTecnico,
        fechaProgramada,
        descripcion,
        idTipoServicio,
        idEstado,
        actualizadoPor,
    } = req.body;

    try {
        const existing = await User.findByPk(Id);

        if (!existing) {
            return res.status(404).json({
                success: false,
                error: 'Visita no encontrada.',
            });
        }

        await existing.update({
            idCliente,
            idSupervisor,
            idTecnico,
            fechaProgramada,
            idTipoServicio,
            descripcion,
            idEstado,
            actualizadoPor,
        });

        res.status(200).json({
            success: true,
            data: existing,
            message: 'Visita actualizada correctamente.',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});


router.delete('/:id', async (req, res) => {
    const Id = req.params.id;

    try {
        const rol = await User.findByPk(Id);

        if (!rol) {
            return res.status(404).json({ success: false, error: 'Visita no encontrada.' });
        }

        await rol.update({ status: 0 });

        res.status(200).json({ success: true, data: rol, message: 'Visita desactivada correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.get('/historial/tecnico/:id', async (req, res) => {
    try {
        const tecnicoId = req.params.id;

        // estados finalizada (2) y cancelada (3)
        const visitas = await User.findAll({
            where: {
                idTecnico: tecnicoId,
                idEstado: [2, 3],
                status: 1
            }
        });

        const resultado = await Promise.all(
            visitas.map(async (v) => {
                const estado = await Estado.findByPk(v.idEstado);
                const tipoServicio = await TipoServicio.findByPk(v.idTipoServicio);

                // obtener información del cliente
                const cliente = await getCliente(v.idCliente);

                let departamento = null;
                let municipio = null;

                // si el cliente tiene ubicacion
                if (cliente?.ubicacion) {

                    if (cliente.ubicacion.idDepartamento) {
                        const depRes = await axios.get(`${process.env.CONFIG || "http://localhost:2000"}/config/departamento/${cliente.ubicacion.idDepartamento}`);
                        departamento = depRes.data.data?.nombre;
                    }

                    if (cliente.ubicacion.idMunicipio) {
                        const munRes = await axios.get(`${process.env.CONFIG || "http://localhost:2000"}/config/municipio/${cliente.ubicacion.idMunicipio}`);
                        municipio = munRes.data.data?.nombre;
                    }
                }


                return {
                    ...v.dataValues,
                    estado,
                    tipoServicio,
                    clienteNombre: cliente ? `${cliente.nombre} ${cliente.apellido}` : "Sin nombre",
                    departamento,
                    municipio
                };
            })
        );

        res.status(200).json({
            success: true,
            data: resultado,
            message: 'Historial del técnico obtenido correctamente.'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});


async function getCliente(id) {
    try {
        const res = await axios.get(`${CLIENTE_URL}/cliente`); // TRAE UBICACIÓN
        const clientes = res.data.data;

        return clientes.find(c => c.id === id) || null;

    } catch (error) {
        console.error("Error obteniendo cliente:", error);
        return null;
    }
}



export default router;
