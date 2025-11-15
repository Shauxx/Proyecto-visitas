import React, { useEffect, useState } from "react";
import axios from "axios";
import TableTemplate from "../componentes/TableTemplate";
import FormModal from "../componentes/FormModal";
import ConfirmDialog from "../componentes/ConfirmDialog";
import { Button, Box, Snackbar, Alert } from "@mui/material";

const Permiso = () => {
    const [permisos, setPermisos] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState({ open: false, id: null });
    const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

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

    const fetchPermisos = async () => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_USUARIO}/usuarios/permiso`;
            const res = await axios.get(url);
            setPermisos(res.data?.data || []);
        } catch (error) {
            console.error("Error al obtener permisos:", error);
            setPermisos([]);
        }
    };

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

    const registrarAuditoria = async (accion) => {
        try {
            if (!token) return;
            const decoded = JSON.parse(atob(token.split(".")[1]));
            const userId = decoded.id || decoded.userId || decoded.data?.id;

            const url = `${import.meta.env.VITE_BACKEND_CONFIG}/config/auditoria`;

            await axios.post(
                url,
                { idEmpleado: userId, accion },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (error) {
            console.error("Error al registrar auditoría:", error);
        }
    };

    const showAlert = (message, severity = "success") => {
        setAlert({ open: true, message, severity });
        setTimeout(() => setAlert({ open: false, message: "", severity: "success" }), 3000);
    };

    useEffect(() => {
        fetchPermisos();
        fetchEmpleados();
    }, []);

    const createPermiso = async (formData) => {
        try {
            const dataToSend = {
                ...formData,
                creadoPor: userIdFromToken,
                actualizadoPor: userIdFromToken,
            };
            const url = `${import.meta.env.VITE_BACKEND_USUARIO}/usuarios/permiso`;
            const res = await axios.post(url, dataToSend);
            await registrarAuditoria(`Creó el permiso "${formData.nombre}"`);
            showAlert(res.data?.message || "Permiso creado correctamente.");
            fetchPermisos();
        } catch (error) {
            console.error("Error al crear permiso:", error);
            showAlert("Error al crear permiso.", "error");
        }
    };

    const editPermiso = async (id, formData) => {
        try {
            const dataToSend = { ...formData, actualizadoPor: userIdFromToken };
            const url = `${import.meta.env.VITE_BACKEND_USUARIO}/usuarios/permiso/${id}`;
            const res = await axios.put(url, dataToSend);
            await registrarAuditoria(`Editó el permiso "${formData.nombre}"`);
            showAlert(res.data?.message || "Permiso actualizado correctamente.");
            fetchPermisos();
        } catch (error) {
            console.error("Error al actualizar permiso:", error);
            showAlert("Error al actualizar permiso.", "error");
        }
    };

    const deletePermiso = async (id) => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_USUARIO}/usuarios/permiso/${id}`;
            const res = await axios.delete(url);
            await registrarAuditoria(`Eliminó el permiso con ID ${id}`);
            showAlert(res.data?.message || "Permiso eliminado correctamente.");
            fetchPermisos();
        } catch (error) {
            console.error("Error al eliminar permiso:", error);
            showAlert("Error al eliminar permiso.", "error");
        }
    };

    const mappedPermisos = permisos.map((permiso) => {
        const creador = empleados.find((e) => e.id === permiso.creadoPor);
        const actualizador = empleados.find((e) => e.id === permiso.actualizadoPor);
        return {
            ...permiso,
            creadoPorNombre: creador ? `${creador.nombre} ${creador.apellido}` : "—",
            actualizadoPorNombre: actualizador ? `${actualizador.nombre} ${actualizador.apellido}` : "—",
        };
    });

    const permisoColumns = [
        { field: "nombre", headerName: "Nombre" },
        { field: "descripcion", headerName: "Descripción" },
        { field: "creadoPorNombre", headerName: "Creado Por" },
        { field: "actualizadoPorNombre", headerName: "Actualizado Por" },
    ];

    const permisoFields = [
        { name: "nombre", label: "Nombre del Permiso" },
        { name: "descripcion", label: "Descripción" },
    ];

    return (
        <div style={{ padding: 20 }}>
            <h2>Gestión de Permisos</h2>

            <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => { setModalData(null); setModalOpen(true); }}
                >
                    Crear Permiso
                </Button>
            </Box>

            <TableTemplate
                columns={permisoColumns}
                data={mappedPermisos}
                onEdit={(row) => { setModalData(row); setModalOpen(true); }}
                onDelete={(row) => setConfirmOpen({ open: true, id: row.id })}
            />

            <FormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalData?.id ? "Editar Permiso" : "Crear Permiso"}
                fields={permisoFields}
                initialData={modalData}
                onSubmit={(data) => {
                    modalData?.id ? editPermiso(modalData.id, data) : createPermiso(data);
                    setModalOpen(false);
                }}
            />

            <ConfirmDialog
                open={confirmOpen.open}
                onClose={() => setConfirmOpen({ open: false, id: null })}
                onConfirm={() => deletePermiso(confirmOpen.id)}
                title="Eliminar Permiso"
                message="¿Desea eliminar este permiso?"
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

export default Permiso;
