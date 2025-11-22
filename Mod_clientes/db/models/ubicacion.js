// db/models/ubicacion.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

const Ubicacion = sequelize.define('ubicacion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    idDepartamento: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    idMunicipio: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    longitud: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    latitud: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    ubicacion: {
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

export default Ubicacion;
