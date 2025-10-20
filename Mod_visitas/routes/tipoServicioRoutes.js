// routes/tipoServicioRoutes.js
import express from 'express';
import User from '../db/models/tipoServicio.js';

const router = express.Router();

router.get('/tipoServicio', async (req, res) => {
    try {
        const data = await User.findAll({ where: { estado: 1 } });
        res.status(200).json({ success: true, data, message: 'Tipos de Servicio obtenidos correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.get('/tipoServicio/:id', async (req, res) => {
    const Id = req.params.id;

    try {
        const data = await User.findByPk(Id);

        if (!data) {
            return res.status(404).json({ success: false, error: 'Tipo de Servicio no encontrado.' });
        }

        res.status(200).json({ success: true, data, message: 'Tipo de Servicio obtenido correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.post('/tipoServicio', async (req, res) => {
    const { tipo, creadoPor, actualizadoPor } = req.body;

    try {
        const existing = await User.findOne({ where: { tipo } });

        if (existing) {
            return res.status(400).json({ success: false, error: 'El Tipo de Servicio ya existe.' });
        }

        const newcargo = await User.create({ tipo, creadoPor, actualizadoPor });

        res.status(201).json({ success: true, data: newcargo, message: 'Tipo de Servicio creado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});


router.put('/tipoServicio/:id', async (req, res) => {
    const Id = req.params.id;
    const { tipo, actualizadoPor } = req.body;

    try {
        const existing = await User.findByPk(Id);

        if (!existing) {
            return res.status(404).json({ success: false, error: 'Tipo de Servicio no encontrado.' });
        }

        await existing.update({ tipo, actualizadoPor });

        res.status(200).json({ success: true, data: existing, message: 'Tipo de Servicio actualizado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.delete('/tipoServicio/:id', async (req, res) => {
    const Id = req.params.id;

    try {
        const rol = await User.findByPk(Id);

        if (!rol) {
            return res.status(404).json({ success: false, error: 'Tipo de Servicio no encontrado.' });
        }

        await rol.update({ estado: 0 });

        res.status(200).json({ success: true, data: rol, message: 'Tipo de Servicio desactivado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});



export default router;
