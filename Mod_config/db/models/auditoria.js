// db/models/auditoria.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

const Auditoria = sequelize.define('auditoria', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    idEmpleado: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    accion: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

export default Auditoria;
