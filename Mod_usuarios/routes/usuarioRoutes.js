// routes/usuarioRoutes.js
import express from 'express';
import User from '../db/models/usuario.js';
import bcrypt from 'bcrypt';

const router = express.Router();

router.get('/usuario', async (req, res) => {
    try {
        const data = await User.findAll({ where: { estado: 1 } });
        res.status(200).json({ success: true, data, message: 'Usuarios obtenidos correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.get('/usuario/:id', async (req, res) => {
    const Id = req.params.id;

    try {
        const data = await User.findByPk(Id);

        if (!data) {
            return res.status(404).json({ success: false, error: 'Usuario no encontrado.' });
        }

        res.status(200).json({ success: true, data, message: 'Usuario obtenido correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.post('/usuario', async (req, res) => {
    const { usuario, contra, idRol, idEmpleado, creadoPor, actualizadoPor } = req.body;

    try {
        const existing = await User.findOne({ where: { usuario } });

        if (existing) {
            return res.status(400).json({ success: false, error: 'El usuario ya existe.' });
        }

        const hashedPassword = await bcrypt.hash(contra, 10);

        const newUser = await User.create({
            usuario, contra: hashedPassword, idRol, idEmpleado, creadoPor, actualizadoPor
        });

        res.status(201).json({ success: true, data: newUser, message: 'Usuario creado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});



router.put('/usuario/:id', async (req, res) => {
    const Id = req.params.id;
    const { usuario, contra, idRol, idEmpleado, actualizadoPor } = req.body;

    try {
        const existing = await User.findByPk(Id);

        if (!existing) {
            return res.status(404).json({ success: false, error: 'Usuario no encontrado.' });
        }

        let updateData = { usuario, idRol, idEmpleado, actualizadoPor };

        if (contra) {
            const hashedPassword = await bcrypt.hash(contra, 10);
            updateData.contra = hashedPassword;
        }

        await existing.update(updateData);

        res.status(200).json({ success: true, data: existing, message: 'Usuario actualizado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});


router.post('/usuario/login', async (req, res) => {
    const { usuario, contra } = req.body;

    try {
        const user = await User.findOne({ where: { usuario, estado: 1 } });

        if (!user) {
            return res.status(401).json({ success: false, error: 'Usuario incorrecto.' });
        }

        const isMatch = await bcrypt.compare(contra, user.contra);

        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Contraseña incorrecta.' });
        }

        res.status(200).json({ success: true, data: user, message: 'Ingreso exitoso.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Error interno del servidor.' });
    }
});



router.delete('/usuario/:id', async (req, res) => {
    const Id = req.params.id;

    try {
        const rol = await User.findByPk(Id);

        if (!rol) {
            return res.status(404).json({ success: false, error: 'Usuario no encontrado.' });
        }

        await rol.update({ estado: 0 });

        res.status(200).json({ success: true, data: rol, message: 'Usuario desactivado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});



export default router;
