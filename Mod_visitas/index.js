// index.js
import express from 'express';
import cors from 'cors';
import { sequelize } from './db/index.js';
import { FRONTEND_URL } from './config/db.config.js';
import estadoRoutes from './routes/estadoRoutes.js';
import registroVisitasRoutes from './routes/registroVisitasRoutes.js';
import tipoServicioRoutes from './routes/tipoServicioRoutes.js';
import visitasRoutes from './routes/visitasRoutes.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cors({
    origin: FRONTEND_URL
}));

// Rutas
app.use('/visita', estadoRoutes);
app.use('/visita', registroVisitasRoutes);
app.use('/visita', visitasRoutes);
app.use('/tipo', tipoServicioRoutes);

// Sincronizar con la base de datos y arrancar el servidor
sequelize.sync({ force: false }).then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor en ejecución en http://localhost:${PORT}`);
    });
});
