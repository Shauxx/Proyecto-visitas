// db/models/rol.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

const Empleado = sequelize.define('empleado', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    apellido: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    nit: {
        type: DataTypes.STRING(9),
        allowNull: false,
        unique: true,
    },
    dpi: {
        type: DataTypes.STRING(15),
        allowNull: false,
        unique: true,
    },
    idDepartamento: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    idMunicipio: {
        type: DataTypes.INTEGER,
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

export default Empleado;
