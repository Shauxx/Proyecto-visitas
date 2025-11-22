import React, { useEffect, useState } from "react";
import axios from "axios";
import TableTemplate from "../componentes/TableTemplate";
import FormModal from "../componentes/FormModal";
import ConfirmDialog from "../componentes/ConfirmDialog";
import { Button, Box } from "@mui/material";
import { Snackbar, Alert } from "@mui/material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


const Rol = () => {
    const [roles, setRoles] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState({ open: false, id: null });
    const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });


    // 🔹 Obtener ID del usuario logueado desde el token
    const token = localStorage.getItem("token");
    let userIdFromToken = 0;
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            userIdFromToken = payload.id;
        } catch (err) {
            console.error("Token inválido:", err);
        }
    }

    // 🔹 Obtener roles
    const fetchRoles = async () => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_USUARIO}/usuarios/rol`;
            const res = await axios.get(url);
            setRoles(res.data?.data || []);
        } catch (error) {
            console.error("Error al obtener roles:", error);
            setRoles([]);
        }
    };

    const registrarAuditoria = async (accion) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

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

    const showAlert = (message, severity = "success") => {
        setAlert({ open: true, message, severity });
        setTimeout(() => setAlert({ open: false, message: "", severity: "success" }), 3000);
    };



    // 🔹 Obtener empleados
    const fetchEmpleados = async () => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_USUARIO}/usuarios/empleado`;
            const res = await axios.get(url);
            setEmpleados(res.data?.data || []);
        } catch (error) {
            console.error("Error al obtener empleados:", error);
            setEmpleados([]);
        }
    };

    useEffect(() => {
        fetchRoles();
        fetchEmpleados();
    }, []);

    // Crear rol
    const createRol = async (formData) => {
        try {
            const dataToSend = {
                ...formData,
                creadoPor: userIdFromToken,
                actualizadoPor: userIdFromToken,
            };

            const url = `${import.meta.env.VITE_BACKEND_USUARIO}/usuarios/rol`;
            const res = await axios.post(url, dataToSend);

            await registrarAuditoria(`Creó el rol "${formData.nombre}"`);
            showAlert(res.data?.message || "Rol creado correctamente.");
            fetchRoles();
        } catch (error) {
            console.error("Error al crear rol:", error);
            showAlert("Error al crear rol.", "error");
        }
    };

    // Editar rol
    const editRol = async (id, formData) => {
        try {
            const dataToSend = { ...formData, actualizadoPor: userIdFromToken };
            const url = `${import.meta.env.VITE_BACKEND_USUARIO}/usuarios/rol/${id}`;
            const res = await axios.put(url, dataToSend);

            await registrarAuditoria(`Editó el rol "${formData.nombre}"`);
            showAlert(res.data?.message || "Rol actualizado correctamente.");
            fetchRoles();
        } catch (error) {
            console.error("Error al actualizar rol:", error);
            showAlert("Error al actualizar rol.", "error");
        }
    };

    // Eliminar rol
    const deleteRol = async (id) => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_USUARIO}/usuarios/rol/${id}`;
            const res = await axios.delete(url);

            await registrarAuditoria(`Eliminó el rol con ID ${id}`);
            showAlert(res.data?.message || "Rol eliminado correctamente.");
            fetchRoles();
        } catch (error) {
            console.error("Error al eliminar rol:", error);
            showAlert("Error al eliminar rol.", "error");
        }
    };


    // 🔹 Crear una versión mapeada con nombres de empleados
    const mappedRoles = roles.map((rol) => {
        const creador = empleados.find((e) => e.id === rol.creadoPor);
        const actualizador = empleados.find((e) => e.id === rol.actualizadoPor);
        return {
            ...rol,
            creadoPorNombre: creador ? `${creador.nombre} ${creador.apellido}` : "—",
            actualizadoPorNombre: actualizador ? `${actualizador.nombre} ${actualizador.apellido}` : "—",
        };
    });

    // 🔹 Columnas de la tabla
    const rolColumns = [
        { field: "nombre", headerName: "Nombre" },
        { field: "descripcion", headerName: "Descripción" },
        { field: "creadoPorNombre", headerName: "Creado Por" },
        { field: "actualizadoPorNombre", headerName: "Actualizado Por" },
    ];

    // 🔹 Campos del formulario modal
    const rolFields = [
        { name: "nombre", label: "Nombre del Rol" },
        { name: "descripcion", label: "Descripción" },
    ];


    const generarPDFRoles = () => {
        const doc = new jsPDF();

        // 1️⃣ Encabezado
        doc.setFontSize(18);
        doc.text("SkyNet S.A.", 14, 20);

        // 2️⃣ Columnas del PDF
        const tableColumn = [
            "Nombre del Rol",
            "Descripción",
            "Creado Por",
            "Actualizado Por"
        ];

        // 3️⃣ Datos del PDF
        const tableRows = mappedRoles.map((r) => [
            r.nombre,
            r.descripcion,
            r.creadoPorNombre,
            r.actualizadoPorNombre
        ]);

        // 4️⃣ Generar tabla
        autoTable(doc, {
            startY: 28,
            head: [tableColumn],
            body: tableRows,
            theme: "grid",
            headStyles: { fillColor: [25, 118, 210], textColor: 255 },
            styles: { fontSize: 10 }
        });

        // 5️⃣ Descargar PDF
        doc.save("Roles_SkyNet.pdf");
    };


    return (
        <div style={{ padding: 20 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <h2>Gestión de Roles</h2>
                <Button variant="outlined" color="secondary" onClick={generarPDFRoles}>
                    Descargar PDF
                </Button>
            </Box>


            <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ mb: 2 }}
                    onClick={() => {
                        setModalData(null);
                        setModalOpen(true);
                    }}
                >
                    Crear Rol
                </Button>
            </Box>
            <TableTemplate
                columns={rolColumns}
                data={mappedRoles}
                onEdit={(row) => {
                    setModalData(row);
                    setModalOpen(true);
                }}
                onDelete={(row) => setConfirmOpen({ open: true, id: row.id })}
            />

            <FormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalData?.id ? "Editar Rol" : "Crear Rol"}
                fields={rolFields}
                initialData={modalData}
                onSubmit={(data) => {
                    modalData?.id ? editRol(modalData.id, data) : createRol(data);
                    setModalOpen(false);
                }}
            />

            <ConfirmDialog
                open={confirmOpen.open}
                onClose={() => setConfirmOpen({ open: false, id: null })}
                onConfirm={() => deleteRol(confirmOpen.id)}
                title="Eliminar Rol"
                message="¿Desea eliminar este rol?"
            />
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

        </div>
    );
};

export default Rol;
