// routes/departamentoRoutes.js
import express from 'express';
import User from '../db/models/departamento.js';

const router = express.Router();

router.get('/departamento', async (req, res) => {
    try {
        const data = await User.findAll({ where: { estado: 1 } });
        res.status(200).json({ success: true, data, message: 'departamento obtenido correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.get('/departamento/:id', async (req, res) => {
    const Id = req.params.id;

    try {
        const data = await User.findByPk(Id);

        if (!data) {
            return res.status(404).json({ success: false, error: 'Departamento no encontrado.' });
        }

        res.status(200).json({ success: true, data, message: 'Departamento obtenido correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.post('/departamento', async (req, res) => {
    const { nombre, creadoPor, actualizadoPor } = req.body;

    try {
        const existing = await User.findOne({ where: { nombre } });

        if (existing) {
            return res.status(400).json({ success: false, error: 'El departamento ya existe.' });
        }

        const newcargo = await User.create({ nombre, creadoPor, actualizadoPor });

        res.status(201).json({ success: true, data: newcargo, message: 'Departamento creado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});


router.put('/departamento/:id', async (req, res) => {
    const Id = req.params.id;
    const { nombre, actualizadoPor } = req.body;

    try {
        const existing = await User.findByPk(Id);

        if (!existing) {
            return res.status(404).json({ success: false, error: 'Departamento no encontrado.' });
        }

        await existing.update({ nombre, actualizadoPor });

        res.status(200).json({ success: true, data: existing, message: 'Departamento actualizado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.delete('/departamento/:id', async (req, res) => {
    const Id = req.params.id;

    try {
        const rol = await User.findByPk(Id);

        if (!rol) {
            return res.status(404).json({ success: false, error: 'Departamento no encontrado.' });
        }

        await rol.update({ estado: 0 });

        res.status(200).json({ success: true, data: rol, message: 'Departamento desactivado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});



export default router;
