// routes/rolRoutes.js
import express from 'express';
import User from '../db/models/rol.js';

const router = express.Router();

router.get('/rol', async (req, res) => {
    try {
        const data = await User.findAll({ where: { estado: 1 } });
        res.status(200).json({ success: true, data, message: 'Roles obtenidos correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.get('/rol/:id', async (req, res) => {
    const Id = req.params.id;

    try {
        const data = await User.findByPk(Id);

        if (!data) {
            return res.status(404).json({ success: false, error: 'Rol no encontrado.' });
        }

        res.status(200).json({ success: true, data, message: 'Rol obtenido correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.post('/rol', async (req, res) => {
    const { nombre, descripcion, creadoPor, actualizadoPor } = req.body;

    try {
        const existing = await User.findOne({ where: { nombre } });

        if (existing) {
            return res.status(400).json({ success: false, error: 'El rol ya existe.' });
        }

        const newcargo = await User.create({ nombre, descripcion, creadoPor, actualizadoPor });

        res.status(201).json({ success: true, data: newcargo, message: 'Rol creado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});


router.put('/rol/:id', async (req, res) => {
    const Id = req.params.id;
    const { nombre, descripcion, actualizadoPor } = req.body;

    try {
        const existing = await User.findByPk(Id);

        if (!existing) {
            return res.status(404).json({ success: false, error: 'Rol no encontrado.' });
        }

        await existing.update({ nombre, descripcion, actualizadoPor });

        res.status(200).json({ success: true, data: existing, message: 'Rol actualizado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.delete('/rol/:id', async (req, res) => {
    const Id = req.params.id;

    try {
        const rol = await User.findByPk(Id);

        if (!rol) {
            return res.status(404).json({ success: false, error: 'Rol no encontrado.' });
        }

        await rol.update({ estado: 0 });

        res.status(200).json({ success: true, data: rol, message: 'Rol desactivado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});



export default router;
