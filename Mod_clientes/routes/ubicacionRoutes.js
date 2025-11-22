// routes/ubicacionRoutes.js
import express from 'express';
import User from '../db/models/ubicacion.js';

const router = express.Router();

router.get('/ubicacion', async (req, res) => {
    try {
        const data = await User.findAll({ where: { estado: 1 } });
        res.status(200).json({ success: true, data, message: 'Ubicaciones obtenidas correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.get('/ubicacion/:id', async (req, res) => {
    const Id = req.params.id;

    try {
        const data = await User.findByPk(Id);

        if (!data) {
            return res.status(404).json({ success: false, error: 'Ubicacion no encontrada.' });
        }

        res.status(200).json({ success: true, data, message: 'Ubicacion obtenida correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.post('/ubicacion', async (req, res) => {
    const { idDepartamento, idMunicipio, longitud, latitud, ubicacion, creadoPor, actualizadoPor } = req.body;

    try {
        const newcargo = await User.create({ idDepartamento, idMunicipio, longitud, latitud, ubicacion, creadoPor, actualizadoPor });

        res.status(201).json({ success: true, data: newcargo, message: 'Ubicacion creada correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});


router.put('/ubicacion/:id', async (req, res) => {
    const Id = req.params.id;
    const { idDepartamento, idMunicipio, longitud, latitud, ubicacion, actualizadoPor } = req.body;

    try {
        const existing = await User.findByPk(Id);

        if (!existing) {
            return res.status(404).json({ success: false, error: 'Ubicacion no encontrado.' });
        }

        await existing.update({ idDepartamento, idMunicipio, longitud, latitud, ubicacion, actualizadoPor });

        res.status(200).json({ success: true, data: existing, message: 'Ubicacion actualizado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.delete('/ubicacion/:id', async (req, res) => {
    const Id = req.params.id;

    try {
        const rol = await User.findByPk(Id);

        if (!rol) {
            return res.status(404).json({ success: false, error: 'Ubicacion no encontrado.' });
        }

        await rol.update({ estado: 0 });

        res.status(200).json({ success: true, data: rol, message: 'Ubicacion desactivado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});



export default router;
