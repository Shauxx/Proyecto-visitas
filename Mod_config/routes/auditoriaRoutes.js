// routes/auditoriaRoutes.js
import express from 'express';
import User from '../db/models/auditoria.js';

const router = express.Router();

router.get('/auditoria', async (req, res) => {
    try {
        const data = await User.findAll();
        res.status(200).json({ success: true, data, message: 'Auditoria obtenida correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.get('/auditoria/:id', async (req, res) => {
    const Id = req.params.id;

    try {
        const data = await User.findByPk(Id);

        if (!data) {
            return res.status(404).json({ success: false, error: 'Auditoria no encontrada.' });
        }

        res.status(200).json({ success: true, data, message: 'Auditoria obtenido correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});


router.post('/auditoria', async (req, res) => {
    const { idEmpleado, accion } = req.body;

    try {
        const newcargo = await User.create({ idEmpleado, accion });

        res.status(201).json({ success: true, data: newcargo, message: 'Auditoria creada correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});




export default router;
