import express from 'express'
import cors from 'cors'
import pg from 'pg'
import { FRONTEND_URL } from './config.js'

const app = express()
const pool = new pg.Pool()
app.use(cors({
    origin: FRONTEND_URL
}))

app.get('/users', (req, res) => {
    res.send({
        users: []
    })
})

app.listen(3000, () => {
    console.log('server started on port 3000')
}) 