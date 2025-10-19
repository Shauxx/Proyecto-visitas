// index.js
import express from 'express';
import cors from 'cors';
import { sequelize } from './db/index.js';
import { FRONTEND_URL } from './config/db.config.js';
import rolRoutes from './routes/rolRoutes.js';
import empleadoRoutes from './routes/empleadoRoutes.js';
import permisoRoutes from './routes/permisoRoutes.js';
import RolPermisoRoutes from './routes/rolPermisoRoutes.js';
import UsuarioRoutes from './routes/usuarioRoutes.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
    origin: FRONTEND_URL
}));

// Rutas
app.use('/usuarios', rolRoutes);
app.use('/usuarios', empleadoRoutes);
app.use('/usuarios', permisoRoutes);
app.use('/usuarios', RolPermisoRoutes);
app.use('/usuarios', UsuarioRoutes);

// Sincronizar con la base de datos y arrancar el servidor
sequelize.sync({ force: false }).then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor en ejecución en http://localhost:${PORT}`);
    });
});
