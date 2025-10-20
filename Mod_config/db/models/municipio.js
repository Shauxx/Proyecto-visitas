// db/models/municipio.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';
import Departamento from './departamento.js';

const Municipio = sequelize.define('municipio', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
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

Municipio.belongsTo(Departamento, { foreignKey: 'idDepartamento', as: 'departamento' });

export default Municipio;
