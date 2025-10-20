// routes/plantillaRoutes.js
import express from 'express';
import User from '../db/models/plantilla.js';

const router = express.Router();

router.get('/plantilla', async (req, res) => {
    try {
        const data = await User.findAll({ where: { estado: 1 } });
        res.status(200).json({ success: true, data, message: 'Plantilla obtenida correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.get('/plantilla/:id', async (req, res) => {
    const Id = req.params.id;

    try {
        const data = await User.findByPk(Id);

        if (!data) {
            return res.status(404).json({ success: false, error: 'Plantilla no encontrada.' });
        }

        res.status(200).json({ success: true, data, message: 'Plantilla obtenida correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.post('/plantilla', async (req, res) => {
    const { nombre, asunto, cuerpo, creadoPor, actualizadoPor } = req.body;

    try {
        const existing = await User.findOne({ where: { nombre } });

        if (existing) {
            return res.status(400).json({ success: false, error: 'La plantilla ya existe.' });
        }

        const newcargo = await User.create({ nombre, asunto, cuerpo, creadoPor, actualizadoPor });

        res.status(201).json({ success: true, data: newcargo, message: 'plantilla creada correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});


router.put('/plantilla/:id', async (req, res) => {
    const Id = req.params.id;
    const { nombre, asunto, cuerpo, actualizadoPor } = req.body;

    try {
        const existing = await User.findByPk(Id);

        if (!existing) {
            return res.status(404).json({ success: false, error: 'plantilla no encontrada.' });
        }

        await existing.update({ nombre, asunto, cuerpo, actualizadoPor });

        res.status(200).json({ success: true, data: existing, message: 'Plantilla actualizada correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.delete('/plantilla/:id', async (req, res) => {
    const Id = req.params.id;

    try {
        const rol = await User.findByPk(Id);

        if (!rol) {
            return res.status(404).json({ success: false, error: 'Plantilla no encontrada.' });
        }

        await rol.update({ estado: 0 });

        res.status(200).json({ success: true, data: rol, message: 'Plantilla desactivada correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});



export default router;
