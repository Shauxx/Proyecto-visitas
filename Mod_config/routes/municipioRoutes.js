// routes/municipioRoutes.js
import express from 'express';
import User from '../db/models/municipio.js';

const router = express.Router();

router.get('/municipio', async (req, res) => {
    try {
        const data = await User.findAll({ where: { estado: 1 } });
        res.status(200).json({ success: true, data, message: 'Municipio obtenido correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.get('/municipio/:id', async (req, res) => {
    const Id = req.params.id;

    try {
        const data = await User.findByPk(Id);

        if (!data) {
            return res.status(404).json({ success: false, error: 'Municipio no encontrado.' });
        }

        res.status(200).json({ success: true, data, message: 'Municipio obtenido correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.get('/municipio/departamento/:idDepartamento', async (req, res) => {
    const { idDepartamento } = req.params;

    try {
        const municipios = await User.findAll({
            where: { idDepartamento, estado: 1 }
        });

        if (!municipios || municipios.length === 0) {
            return res.status(404).json({ success: false, error: 'No se encontraron municipios para este departamento.' });
        }

        res.status(200).json({
            success: true,
            data: municipios,
            message: 'Municipios obtenidos correctamente por departamento.'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.post('/municipio', async (req, res) => {
    const { nombre, idDepartamento, creadoPor, actualizadoPor } = req.body;

    try {
        const existing = await User.findOne({ where: { nombre } });

        if (existing) {
            return res.status(400).json({ success: false, error: 'El municipio ya existe.' });
        }

        const newcargo = await User.create({ nombre, idDepartamento, creadoPor, actualizadoPor });

        res.status(201).json({ success: true, data: newcargo, message: 'Municipio creado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});


router.put('/municipio/:id', async (req, res) => {
    const Id = req.params.id;
    const { nombre, idDepartamento, actualizadoPor } = req.body;

    try {
        const existing = await User.findByPk(Id);

        if (!existing) {
            return res.status(404).json({ success: false, error: 'Municipio no encontrado.' });
        }

        await existing.update({ nombre, idDepartamento, actualizadoPor });

        res.status(200).json({ success: true, data: existing, message: 'Municipio actualizado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.delete('/municipio/:id', async (req, res) => {
    const Id = req.params.id;

    try {
        const rol = await User.findByPk(Id);

        if (!rol) {
            return res.status(404).json({ success: false, error: 'Municipio no encontrado.' });
        }

        await rol.update({ estado: 0 });

        res.status(200).json({ success: true, data: rol, message: 'Municipio desactivado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});



export default router;
