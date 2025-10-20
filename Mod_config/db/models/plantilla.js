// db/models/plantilla.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

const Plantilla = sequelize.define('plantilla', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    asunto: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    cuerpo: {
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

export default Plantilla;
