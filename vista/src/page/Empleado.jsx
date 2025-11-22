import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Box, Snackbar, Alert } from "@mui/material";
import TableTemplate from "../componentes/TableTemplate";
import FormModal from "../componentes/FormModal";
import ConfirmDialog from "../componentes/ConfirmDialog";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Empleados = () => {
    const [empleados, setEmpleados] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [empleadoAEliminar, setEmpleadoAEliminar] = useState(null);
    const [editingEmpleado, setEditingEmpleado] = useState(null);
    const [departamentos, setDepartamentos] = useState([]);
    const [municipios, setMunicipios] = useState([]);

    // 🔔 Estado para mostrar mensajes
    const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

    const showAlert = (message, severity = "success") => {
        setAlert({ open: true, message, severity });
        setTimeout(() => setAlert({ open: false, message: "", severity: "success" }), 3000);
    };

    // 📦 Columnas de la tabla
    const columnas = [
        { field: "nombre", headerName: "Nombre" },
        { field: "apellido", headerName: "Apellido" },
        { field: "nit", headerName: "NIT" },
        { field: "dpi", headerName: "DPI" },
        { field: "correo", headerName: "Correo" },
    ];

    // 🧩 Obtener empleados
    const obtenerEmpleados = async () => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_USUARIO}/usuarios/empleado`;
            const { data } = await axios.get(url);
            if (data.success && Array.isArray(data.data)) {
                setEmpleados(data.data);
            }
        } catch (error) {
            console.error("Error al obtener empleados:", error);
        }
    };

    useEffect(() => {
        obtenerEmpleados();
    }, []);

    // 📍 Obtener departamentos y municipios
    const obtenerDepartamentos = async () => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_CONFIG}/config/departamento`;
            const { data } = await axios.get(url);
            setDepartamentos(data.data || []);
        } catch (error) {
            console.error("Error al obtener departamentos:", error);
        }
    };

    const obtenerMunicipios = async (idDepartamento) => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_CONFIG}/config/municipio/departamento/${idDepartamento}`;
            const { data } = await axios.get(url);
            setMunicipios(data.data || []);
        } catch (error) {
            console.error("Error al obtener municipios:", error);
        }
    };

    // 🧾 Registrar auditoría
    const registrarAuditoria = async (accion) => {
        try {
            const token = localStorage.getItem("token");
            const decoded = JSON.parse(atob(token.split(".")[1]));
            const userId = decoded.id || decoded.userId || decoded.data?.id;

            const url = `${import.meta.env.VITE_BACKEND_CONFIG}/config/auditoria`;

            await axios.post(
                url,
                {
                    idEmpleado: userId,
                    accion,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
        } catch (error) {
            console.error("Error al registrar auditoría:", error);
        }
    };

    // 🧩 Crear o editar empleado
    const handleAdd = async (nuevoEmpleado) => {
        if (!nuevoEmpleado.correo || nuevoEmpleado.correo.trim() === "") {
            showAlert("El campo correo es obligatorio.", "error");
            return;
        }
        try {
            const token = localStorage.getItem("token");
            const decoded = JSON.parse(atob(token.split(".")[1]));
            const userId = decoded.id || decoded.userId || decoded.data?.id;

            const payload = {
                ...nuevoEmpleado,
                idDepartamento: Number(nuevoEmpleado.idDepartamento),
                idMunicipio: Number(nuevoEmpleado.idMunicipio),
                actualizadoPor: userId,
                creadoPor: userId,
            };

            console.log("🔹 Payload enviado al backend:", payload); // 🔍 Mostrar payload

            const url = `${import.meta.env.VITE_BACKEND_USUARIO}/usuarios/empleado`;

            let res;
            if (editingEmpleado) {
                res = await axios.put(`${url}/${editingEmpleado.id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                await registrarAuditoria(
                    `Editó al empleado ${editingEmpleado.nombre} ${editingEmpleado.apellido}`
                );
                showAlert(res.data?.message || "Empleado actualizado correctamente.");
            } else {
                res = await axios.post(url, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                await registrarAuditoria(
                    `Agregó al empleado ${nuevoEmpleado.nombre} ${nuevoEmpleado.apellido}`
                );
                showAlert(res.data?.message || "Empleado creado correctamente.");
            }

            console.log("🔹 Respuesta del backend:", res.data); // 🔍 Mostrar respuesta

            obtenerEmpleados();
            setEditingEmpleado(null);
        } catch (error) {
            console.error("Error al guardar empleado:", error);
            if (error.response) {
                console.error("🔹 Error response del backend:", error.response.data); // 🔍 Mostrar detalle del 500
            }
            showAlert("Error al guardar empleado.", "error");
        }
    };


    // ✏️ Editar empleado
    const handleEdit = (empleado) => {
        setEditingEmpleado(empleado);
        setOpenModal(true);
        obtenerDepartamentos();
        obtenerMunicipios(empleado.idDepartamento);
    };

    // 🧨 Abrir confirmación antes de eliminar
    const handleOpenDelete = (empleado) => {
        setEmpleadoAEliminar(empleado);
        setOpenDelete(true);
    };

    // 🗑️ Confirmar eliminación
    const handleDelete = async () => {
        try {
            const token = localStorage.getItem("token");
            const url = `${import.meta.env.VITE_BACKEND_USUARIO}/usuarios/empleado/${empleadoAEliminar.id}`;

            const res = await axios.delete(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            await registrarAuditoria(
                `Eliminó al empleado ${empleadoAEliminar.nombre} ${empleadoAEliminar.apellido}`
            );

            showAlert(res.data?.message || "Empleado eliminado correctamente.");
            obtenerEmpleados();
            setEmpleadoAEliminar(null);
        } catch (error) {
            console.error("Error al eliminar empleado:", error);
            showAlert("Error al eliminar empleado.", "error");
        }
    };

    // Campos del formulario
    const camposFormulario = [
        { name: "nombre", label: "Nombre" },
        { name: "apellido", label: "Apellido" },
        { name: "nit", label: "NIT" },
        { name: "dpi", label: "DPI" },
        { name: "correo", label: "Correo", type: "text" },
        {
            name: "idDepartamento",
            label: "Departamento",
            type: "select",
            options: departamentos.map((d) => ({
                label: d.nombre,
                value: d.id,
            })),
            onChange: (val) => obtenerMunicipios(val),
        },
        {
            name: "idMunicipio",
            label: "Municipio",
            type: "select",
            options: municipios.map((m) => ({
                label: m.nombre,
                value: m.id,
            })),
        },
    ];


    const generarPDFEmpleados = () => {
        const doc = new jsPDF();

        // 1️⃣ Título del PDF
        doc.setFontSize(18);
        doc.text("SkyNet S.A.", 14, 22);

        // 2️⃣ Tabla con los datos de empleados
        const tableColumn = ["#", "Nombre", "Apellido", "NIT", "DPI", "Correo"];
        const tableRows = [];

        empleados.forEach((e, index) => {
            const rowData = [
                index + 1,
                e.nombre,
                e.apellido,
                e.nit,
                e.dpi,
                e.dpi,
                e.correo
            ];
            tableRows.push(rowData);
        });

        autoTable(doc, {
            startY: 30,
            head: [tableColumn],
            body: tableRows,
            theme: "grid",
            headStyles: { fillColor: [25, 118, 210], textColor: 255 },
            styles: { fontSize: 10 },
        });

        // 3️⃣ Guardar PDF
        doc.save("Empleados_SkyNet.pdf");
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <h2>Gestión de Empleados</h2>
                <Button variant="outlined" color="secondary" onClick={generarPDFEmpleados}>
                    Descargar PDF
                </Button>
            </Box>

            <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        setEditingEmpleado(null);
                        obtenerDepartamentos();
                        setOpenModal(true);
                    }}
                >
                    Agregar Empleado
                </Button>
            </Box>

            <TableTemplate
                columns={columnas}
                data={empleados}
                onEdit={handleEdit}
                onDelete={handleOpenDelete}
            />

            <FormModal
                open={openModal}
                onClose={() => {
                    setOpenModal(false);
                    setEditingEmpleado(null);
                }}
                title={editingEmpleado ? "Editar Empleado" : "Agregar Empleado"}
                fields={camposFormulario}
                onSubmit={handleAdd}
                initialData={editingEmpleado}
            />

            <ConfirmDialog
                open={openDelete}
                onClose={() => setOpenDelete(false)}
                onConfirm={handleDelete}
                title="Eliminar Empleado"
                message={`¿Seguro que deseas eliminar a ${empleadoAEliminar?.nombre} ${empleadoAEliminar?.apellido}?`}
            />

            {/* 🔔 Snackbar para mostrar mensajes */}
            <Snackbar
                open={alert.open}
                autoHideDuration={3000}
                onClose={() => setAlert({ open: false, message: "", severity: "success" })}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    severity={alert.severity}
                    variant="filled"
                    onClose={() => setAlert({ open: false, message: "", severity: "success" })}
                    sx={{ width: "100%" }}
                >
                    {alert.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Empleados;
