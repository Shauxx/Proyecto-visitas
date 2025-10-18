// routes/permisoRoutes.js
import express from 'express';
import User from '../db/models/permiso.js';

const router = express.Router();

router.get('/permiso', async (req, res) => {
    try {
        const data = await User.findAll({ where: { estado: 1 } });
        res.status(200).json({ success: true, data, message: 'Permisos obtenidos correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.get('/permiso/:id', async (req, res) => {
    const Id = req.params.id;

    try {
        const data = await User.findByPk(Id);

        if (!data) {
            return res.status(404).json({ success: false, error: 'Permiso no encontrado.' });
        }

        res.status(200).json({ success: true, data, message: 'Permiso obtenido correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.post('/permiso', async (req, res) => {
    const { nombre, descripcion, creadoPor, actualizadoPor } = req.body;

    try {
        const existing = await User.findOne({ where: { nombre } });

        if (existing) {
            return res.status(400).json({ success: false, error: 'El permiso ya existe.' });
        }

        const newcargo = await User.create({ nombre, descripcion, creadoPor, actualizadoPor });

        res.status(201).json({ success: true, data: newcargo, message: 'Permiso creado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});


router.put('/permiso/:id', async (req, res) => {
    const Id = req.params.id;
    const { nombre, descripcion, actualizadoPor } = req.body;

    try {
        const existing = await User.findByPk(Id);

        if (!existing) {
            return res.status(404).json({ success: false, error: 'Permiso no encontrado.' });
        }

        await existing.update({ nombre, descripcion, actualizadoPor });

        res.status(200).json({ success: true, data: existing, message: 'Permiso actualizado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.delete('/permiso/:id', async (req, res) => {
    const Id = req.params.id;

    try {
        const rol = await User.findByPk(Id);

        if (!rol) {
            return res.status(404).json({ success: false, error: 'Permiso no encontrado.' });
        }

        await rol.update({ estado: 0 });

        res.status(200).json({ success: true, data: rol, message: 'Permiso desactivado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});



export default router;
