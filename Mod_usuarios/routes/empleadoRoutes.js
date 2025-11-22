// routes/EmpleadoRoutes.js
import express from 'express';
import User from '../db/models/empleado.js';

const router = express.Router();

router.get('/empleado', async (req, res) => {
    try {
        const data = await User.findAll({ where: { estado: 1 } });
        res.status(200).json({ success: true, data, message: 'Empleados obtenidos correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.get('/empleado/:id', async (req, res) => {
    const Id = req.params.id;

    try {
        const data = await User.findByPk(Id);

        if (!data) {
            return res.status(404).json({ success: false, error: 'Empleado no encontrado.' });
        }

        res.status(200).json({ success: true, data, message: 'Empleado obtenido correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.post('/empleado', async (req, res) => {
    const { nombre, apellido, nit, dpi, correo, idDepartamento, idMunicipio, creadoPor, actualizadoPor } = req.body;

    try {
        const existing = await User.findOne({ where: { nit, dpi } });

        if (existing) {
            return res.status(400).json({ success: false, error: 'El empleado ya existe.' });
        }

        const newcargo = await User.create({ nombre, apellido, nit, dpi, correo, idDepartamento, idMunicipio, creadoPor, actualizadoPor });

        res.status(201).json({ success: true, data: newcargo, message: 'Empleado creado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});


router.put('/empleado/:id', async (req, res) => {
    const Id = req.params.id;
    const { nombre, apellido, nit, dpi, correo, idDepartamento, idMunicipio, actualizadoPor } = req.body;

    try {
        const existing = await User.findByPk(Id);

        if (!existing) {
            return res.status(404).json({ success: false, error: 'Empleado no encontrado.' });
        }

        await existing.update({ nombre, apellido, nit, dpi, correo, idDepartamento, idMunicipio, actualizadoPor });

        res.status(200).json({ success: true, data: existing, message: 'Empleado actualizado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.delete('/empleado/:id', async (req, res) => {
    const Id = req.params.id;

    try {
        const rol = await User.findByPk(Id);

        if (!rol) {
            return res.status(404).json({ success: false, error: 'Empleado no encontrado.' });
        }

        await rol.update({ estado: 0 });

        res.status(200).json({ success: true, data: rol, message: 'Empleado desactivado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});



export default router;
