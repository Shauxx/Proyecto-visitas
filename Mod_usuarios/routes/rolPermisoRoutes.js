// routes/rolPermisoRoutes.js
import express from 'express';
import User from '../db/models/rolPermiso.js';

const router = express.Router();

router.get('/rolpermiso', async (req, res) => {
    try {
        const data = await User.findAll({ where: { estado: 1 } });
        res.status(200).json({ success: true, data, message: 'Rol y permiso obtenidos correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.get('/rolpermiso/:id', async (req, res) => {
    const Id = req.params.id;

    try {
        const data = await User.findByPk(Id);

        if (!data) {
            return res.status(404).json({ success: false, error: 'Rol y permiso no encontrado.' });
        }

        res.status(200).json({ success: true, data, message: 'Rol y permiso obtenido correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.post('/rolpermiso', async (req, res) => {
    const { idRol, idPermiso, creadoPor, actualizadoPor } = req.body;

    try {
        const existing = await User.findOne({ where: { idRol, idPermiso } });

        if (existing) {
            return res.status(400).json({ success: false, error: 'El rol y permiso ya existe.' });
        }

        const newcargo = await User.create({ idRol, idPermiso, creadoPor, actualizadoPor });

        res.status(201).json({ success: true, data: newcargo, message: 'Rol y permiso creado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});


router.put('/rolpermiso/:id', async (req, res) => {
    const Id = req.params.id;
    const { idRol, idPermiso, actualizadoPor } = req.body;

    try {
        const existing = await User.findByPk(Id);

        if (!existing) {
            return res.status(404).json({ success: false, error: 'Rol y permiso no encontrado.' });
        }

        await existing.update({ idRol, idPermiso, actualizadoPor });

        res.status(200).json({ success: true, data: existing, message: 'Rol y permiso actualizado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.delete('/rolpermiso/:id', async (req, res) => {
    const Id = req.params.id;

    try {
        const rol = await User.findByPk(Id);

        if (!rol) {
            return res.status(404).json({ success: false, error: 'Rol y permiso no encontrado.' });
        }

        await rol.update({ estado: 0 });

        res.status(200).json({ success: true, data: rol, message: 'Rol y permiso desactivado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});



export default router;
