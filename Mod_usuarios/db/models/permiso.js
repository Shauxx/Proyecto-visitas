// db/models/rol.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

const Permiso = sequelize.define('permiso', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    descripcion: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    estado: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
    creadoPor: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    actualizadoPor: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

export default Permiso;
