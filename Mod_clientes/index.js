import express from 'express'
import cors from 'cors'
import pg from 'pg'
import { FRONTEND_URL } from './config.js'

const app = express()
const pool = new pg.Pool({
    host: "localhost",
    database: "visitas",
    user: "postgres",
    password: "1234",
    port: 5432,
});

app.use(cors({
    origin: "http://localhost:5173",
}));

app.get("/ping/cliente", async (req, res) => {
    const result = await pool.query("Select NOW()");
    res.send({
        pongCliente: result.rows[0].now,
    });
})

app.listen(3000, () => {
    console.log('server started on port 3000')
}) 