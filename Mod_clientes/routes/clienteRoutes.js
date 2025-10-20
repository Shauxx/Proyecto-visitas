// routes/ubicacionRoutes.js
import express from 'express';
import User from '../db/models/cliente.js';
import Ubicacion from '../db/models/ubicacion.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const data = await User.findAll({ where: { estado: 1 } });
        res.status(200).json({ success: true, data, message: 'Clientes obtenidos correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.get('/:id', async (req, res) => {
    const Id = req.params.id;

    try {
        const data = await User.findByPk(Id);

        if (!data) {
            return res.status(404).json({ success: false, error: 'Cliente no encontrado.' });
        }

        res.status(200).json({ success: true, data, message: 'Cliente obtenido correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.post('/', async (req, res) => {
    const { nombre, apellido, nit, correo, telefono, idDepartamento, idMunicipio, longitud, latitud, creadoPor, actualizadoPor
    } = req.body;

    const transaction = await User.sequelize.transaction();

    try {
        const nuevaUbicacion = await Ubicacion.create(
            { idDepartamento, idMunicipio, longitud, latitud, creadoPor, actualizadoPor },
            { transaction }
        );

        const nuevoCliente = await User.create(
            { nombre, apellido, nit, correo, telefono, idUbicacion: nuevaUbicacion.id, creadoPor, actualizadoPor },
            { transaction }
        );

        await transaction.commit();

        res.status(201).json({ success: true, data: nuevoCliente, message: 'Cliente y ubicación creados correctamente.' });
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        res.status(500).json({ success: false, error: 'Error al crear cliente y ubicación.' });
    }
});


router.put('/:id', async (req, res) => {
    const Id = req.params.id;
    const { nombre, apellido, nit, correo, telefono, idDepartamento, idMunicipio, longitud, latitud, actualizadoPor } = req.body;

    const transaction = await User.sequelize.transaction();

    try {
        const cliente = await User.findByPk(Id, { transaction });

        if (!cliente) {
            await transaction.rollback();
            return res.status(404).json({ success: false, error: 'Cliente no encontrado.' });
        }
        await cliente.update(
            { nombre, apellido, nit, correo, telefono, actualizadoPor },
            { transaction }
        );

        const ubicacion = await Ubicacion.findByPk(cliente.idUbicacion, { transaction });

        if (ubicacion) {
            await ubicacion.update(
                { idDepartamento, idMunicipio, longitud, latitud, actualizadoPor },
                { transaction }
            );
        }

        await transaction.commit();

        res.status(200).json({
            success: true,
            data: { cliente, ubicacion },
            message: 'Cliente y ubicación actualizados correctamente.',
        });
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        res.status(500).json({ success: false, error: 'Error al actualizar cliente y ubicación.' });
    }
});

router.delete('/:id', async (req, res) => {
    const Id = req.params.id;

    try {
        const rol = await User.findByPk(Id);

        if (!rol) {
            return res.status(404).json({ success: false, error: 'Cliente no encontrado.' });
        }

        await rol.update({ estado: 0 });

        res.status(200).json({ success: true, data: rol, message: 'Cliente desactivado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});


export default router;
