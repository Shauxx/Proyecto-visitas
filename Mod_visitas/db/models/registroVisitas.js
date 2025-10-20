// db/models/registroVisitas.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';
import Visitas from './visitas.js';

const RegistroVisitas = sequelize.define('registroVisitas', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    horaingreso: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    horaegreso: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    obervaciones: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    recomendaciones: {
        type: DataTypes.STRING,
        allowNull: true,
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

RegistroVisitas.belongsTo(Visitas, { foreignKey: 'idVisita', as: 'visitas' });

export default RegistroVisitas;
