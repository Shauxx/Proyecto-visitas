// routes/estadoRoutes.js
import express from 'express';
import User from '../db/models/estado.js';

const router = express.Router();

router.get('/estado', async (req, res) => {
    try {
        const data = await User.findAll({ where: { estado: 1 } });
        res.status(200).json({ success: true, data, message: 'Estados obtenidos correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.get('/estado/:id', async (req, res) => {
    const Id = req.params.id;

    try {
        const data = await User.findByPk(Id);

        if (!data) {
            return res.status(404).json({ success: false, error: 'Estado no encontrado.' });
        }

        res.status(200).json({ success: true, data, message: 'Estado obtenido correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.post('/estado', async (req, res) => {
    const { tipo, creadoPor, actualizadoPor } = req.body;

    try {
        const existing = await User.findOne({ where: { tipo } });

        if (existing) {
            return res.status(400).json({ success: false, error: 'El estado ya existe.' });
        }

        const newcargo = await User.create({ tipo, creadoPor, actualizadoPor });

        res.status(201).json({ success: true, data: newcargo, message: 'Estado creado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});


router.put('/estado/:id', async (req, res) => {
    const Id = req.params.id;
    const { tipo, actualizadoPor } = req.body;

    try {
        const existing = await User.findByPk(Id);

        if (!existing) {
            return res.status(404).json({ success: false, error: 'Estado no encontrado.' });
        }

        await existing.update({ tipo, actualizadoPor });

        res.status(200).json({ success: true, data: existing, message: 'Estado actualizado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.delete('/estado/:id', async (req, res) => {
    const Id = req.params.id;

    try {
        const rol = await User.findByPk(Id);

        if (!rol) {
            return res.status(404).json({ success: false, error: 'Estado no encontrado.' });
        }

        await rol.update({ estado: 0 });

        res.status(200).json({ success: true, data: rol, message: 'Estado desactivado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});



export default router;
