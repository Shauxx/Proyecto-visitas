// db/models/usuario.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';
import Rol from './rol.js';
import Empleado from './empleado.js';

const Usuario = sequelize.define('usuario', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    usuario: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    contra: {
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

Usuario.belongsTo(Rol, { foreignKey: 'idRol', as: 'rol' });
Usuario.belongsTo(Empleado, { foreignKey: 'idEmpleado', as: 'empleado' });

export default Usuario;
