// index.js
import express from 'express';
import cors from 'cors';
import { sequelize } from './db/index.js';
import { FRONTEND_URL } from './config/db.config.js';
import auditoriaRoutes from './routes/auditoriaRoutes.js';
import plantillaRoutes from './routes/plantillaRoutes.js';
import departamentoRoutes from './routes/departamentoRoutes.js';
import municipioRoutes from './routes/municipioRoutes.js';
import dashboard from './routes/dashboardRoutes.js'

const app = express();
const PORT = process.env.PORT || 2000;

// Middleware
app.use(express.json());
app.use(cors({
    origin: FRONTEND_URL
}));

// Rutas
app.use('/config', auditoriaRoutes);
app.use('/config', plantillaRoutes);
app.use('/config', departamentoRoutes);
app.use('/config', municipioRoutes);
app.use('/dashboard', dashboard);

// Sincronizar con la base de datos y arrancar el servidor
sequelize.sync({ force: false }).then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor en ejecución en http://localhost:${PORT}`);
    });
});
