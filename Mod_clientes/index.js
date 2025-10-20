// index.js
import express from 'express';
import cors from 'cors';
import { sequelize } from './db/index.js';
import { FRONTEND_URL } from './config/db.config.js';
import ubicacionRoutes from './routes/ubicacionRoutes.js';
import clienteRoutes from './routes/clienteRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors({
    origin: FRONTEND_URL
}));

// Rutas
app.use('/cliente', ubicacionRoutes);
app.use('/cliente', clienteRoutes);

// Sincronizar con la base de datos y arrancar el servidor
sequelize.sync({ force: false }).then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor en ejecución en http://localhost:${PORT}`);
    });
});
