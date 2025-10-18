// db/models/rol.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';
import Rol from './rol.js';
import Permiso from './permiso.js';

const RolPermiso = sequelize.define('rolPermiso', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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

RolPermiso.belongsTo(Rol, { foreignKey: 'idRol', as: 'rol' });
RolPermiso.belongsTo(Permiso, { foreignKey: 'idPermiso', as: 'permiso' });

export default RolPermiso;
