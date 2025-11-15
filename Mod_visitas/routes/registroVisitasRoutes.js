// routes/registroVisitasRoutes.js
import express from 'express';
import User from '../db/models/registroVisitas.js';

const router = express.Router();

router.get('/registroVisitas', async (req, res) => {
    try {
        const data = await User.findAll({ where: { estado: 1 } });
        res.status(200).json({ success: true, data, message: 'Registro de Visitas obtenidos correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.get('/registroVisitas/:id', async (req, res) => {
    const Id = req.params.id;

    try {
        const data = await User.findByPk(Id);

        if (!data) {
            return res.status(404).json({ success: false, error: 'Registro de Visitas no encontrado.' });
        }

        res.status(200).json({ success: true, data, message: 'Registro de Visitas obtenido correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.post('/registroVisitas', async (req, res) => {
    const { horaingreso, horaegreso, obervaciones, recomendaciones, creadoPor, actualizadoPor } = req.body;

    try {
        const newcargo = await User.create({ horaingreso, horaegreso, obervaciones, recomendaciones, creadoPor, actualizadoPor });

        res.status(201).json({ success: true, data: newcargo, message: 'Registro de Visitas creado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});


router.put('/registroVisitas/:id', async (req, res) => {
    const Id = req.params.id;
    const { horaingreso, horaegreso, obervaciones, recomendaciones, actualizadoPor } = req.body;

    try {
        const existing = await User.findByPk(Id);

        if (!existing) {
            return res.status(404).json({ success: false, error: 'Registro de Visitas no encontrado.' });
        }

        await existing.update({ horaingreso, horaegreso, obervaciones, recomendaciones, actualizadoPor });

        res.status(200).json({ success: true, data: existing, message: 'Registro de Visitas actualizado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.delete('/registroVisitas/:id', async (req, res) => {
    const Id = req.params.id;

    try {
        const rol = await User.findByPk(Id);

        if (!rol) {
            return res.status(404).json({ success: false, error: 'Registro de Visitas no encontrado.' });
        }

        await rol.update({ estado: 0 });

        res.status(200).json({ success: true, data: rol, message: 'Registro de Visitas desactivado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});



export default router;
