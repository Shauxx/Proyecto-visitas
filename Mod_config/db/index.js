// db/index.js
import { Sequelize } from 'sequelize';
import {
    DB_HOST,
    DB_PORT,
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
    DB_DIALECT
} from '../config/db.config.js';

const sequelize = new Sequelize({
    dialect: DB_DIALECT,
    host: DB_HOST,
    port: DB_PORT,
    database: DB_NAME,
    username: DB_USER,
    password: DB_PASSWORD,
});

export { sequelize };
