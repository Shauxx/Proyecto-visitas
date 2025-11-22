// db/models/visitas.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';
import Estado from './estado.js';
import TipoServicio from './tipoServicio.js';

const Visitas = sequelize.define('visitas', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    idCliente: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    idSupervisor: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    idTecnico: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    fechaProgramada: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    descripcion: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
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

Visitas.belongsTo(Estado, { foreignKey: 'idEstado', as: 'estado' });
Visitas.belongsTo(TipoServicio, { foreignKey: 'idTipoServicio', as: 'tipoServicio' });

export default Visitas;
