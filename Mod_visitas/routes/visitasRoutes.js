// routes/visitasRoutes.js
import express from 'express';
import User from '../db/models/visitas.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const data = await User.findAll({ where: { estado: 1 } });
        res.status(200).json({ success: true, data, message: 'visitas obtenidas correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
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
    const { idCliente, idSupervisor, idTecnico, fechaProgramada, creadoPor, actualizadoPor } = req.body;

    try {
        const existe = await User.findOne({
            where: { idTecnico, fechaProgramada },
        });

        if (existe) {
            return res.status(400).json({ success: false, message: 'El técnico ya tiene una visita asignada en esa hora.', });
        }
        const newcargo = await User.create({ idCliente, idSupervisor, idTecnico, fechaProgramada, creadoPor, actualizadoPor });

        res.status(201).json({ success: true, data: newcargo, message: 'Visita creada correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});


router.put('/:id', async (req, res) => {
    const Id = req.params.id;
    const { idCliente, idSupervisor, idTecnico, fechaProgramada, actualizadoPor } = req.body;

    try {
        const existing = await User.findByPk(Id);

        if (!existing) {
            return res.status(404).json({ success: false, error: 'Visita no encontrada.' });
        }

        await existing.update({ idCliente, idSupervisor, idTecnico, fechaProgramada, actualizadoPor });

        res.status(200).json({ success: true, data: existing, message: 'Visita actualizada correctamente.' });
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

        await rol.update({ estado: 0 });

        res.status(200).json({ success: true, data: rol, message: 'Visita desactivada correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});



export default router;
