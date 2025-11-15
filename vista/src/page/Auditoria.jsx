import React, { useEffect, useState } from "react";
import axios from "axios";
import TableTemplate from "../componentes/TableTemplate";

const Auditoria = () => {
    const [registros, setRegistros] = useState([]);
    const [empleados, setEmpleados] = useState([]);

    const columnas = [
        { field: "empleadoNombre", headerName: "Empleado" },
        { field: "accion", headerName: "Acción" },
        { field: "createdAt", headerName: "Fecha" },
    ];

    // 🔹 Obtener empleados
    const obtenerEmpleados = async () => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_USUARIO}/usuarios/empleado`;
            const { data } = await axios.get(url);
            if (data.success && Array.isArray(data.data)) {
                setEmpleados(data.data);
            } else {
                setEmpleados([]);
            }
        } catch (error) {
            console.error("Error al obtener empleados:", error);
        }
    };

    // 🔹 Obtener registros de auditoría
    const obtenerAuditoria = async () => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_CONFIG}/config/auditoria`;
            const { data } = await axios.get(url);

            if (data.success && Array.isArray(data.data)) {
                setRegistros(data.data);
            } else {
                console.error("Formato de respuesta inesperado:", data);
            }
        } catch (error) {
            console.error("Error al obtener auditoría:", error);
        }
    };

    // 🔹 Cargar ambos al inicio
    useEffect(() => {
        obtenerEmpleados();
        obtenerAuditoria();
    }, []);

    // 🔹 Crear una lista combinada (auditoría + nombre del empleado)
    const registrosConNombre = registros.map((r) => {
        const empleado = empleados.find((e) => e.id === r.idEmpleado);
        return {
            ...r,
            empleadoNombre: empleado ? `${empleado.nombre} ${empleado.apellido}` : "—",
            createdAt: new Date(r.createdAt).toLocaleString("es-GT") || "-",
        };
    });

    return (
        <div style={{ padding: 20 }}>
            <h2>Registro de Auditoría</h2>
            <TableTemplate columns={columnas} data={registrosConNombre} />
        </div>
    );
};

export default Auditoria;
