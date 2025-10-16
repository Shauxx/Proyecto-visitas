import express from 'express'
import cors from 'cors'
import pg from 'pg'
import { FRONTEND_URL, DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, DB_PORT } from './config.js'

const app = express()
const pool = new pg.Pool({
    host: DB_HOST,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD,
    port: DB_PORT,
});

app.use(cors({
    origin: FRONTEND_URL,
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