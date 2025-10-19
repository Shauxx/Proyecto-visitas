// middlewares/auth.js
import jwt from 'jsonwebtoken';
import User from '../db/models/usuario.js';

export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'] || req.headers['Authorization'];
        if (!authHeader) return res.status(401).json({ success: false, error: 'No token provided.' });

        const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
        if (!token) return res.status(401).json({ success: false, error: 'No token provided.' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findByPk(decoded.id);
        if (!user || user.estado !== 1) {
            return res.status(401).json({ success: false, error: 'Usuario inválido o deshabilitado.' });
        }

        req.user = {
            id: user.id,
            idEmpleado: user.idEmpleado,
            idRol: user.idRol
        };

        next();
    } catch (err) {
        console.error(err);
        return res.status(401).json({ success: false, error: 'Token inválido o expirado.' });
    }
};
