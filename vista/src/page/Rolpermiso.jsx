import React, { useEffect, useState } from "react";
import axios from "axios";
import TableTemplate from "../componentes/TableTemplate";
import FormModal from "../componentes/FormModal";
import ConfirmDialog from "../componentes/ConfirmDialog";
import { Button, Box, Snackbar, Alert } from "@mui/material";

const RolPermiso = () => {
    const [rolPermisos, setRolPermisos] = useState([]);
    const [roles, setRoles] = useState([]);
    const [permisos, setPermisos] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState({ open: false, id: null });
    const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

    // Obtener ID del usuario desde el token
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

    // --- Funciones de carga ---
    const fetchRolPermisos = async () => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_USUARIO}/usuarios/rolpermiso`;
            const res = await axios.get(url);
            setRolPermisos(res.data?.data || []);
        } catch (error) {
            console.error("Error al obtener rol-permisos:", error);
            setRolPermisos([]);
        }
    };

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

    // --- Auditoría ---
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

    // --- Alertas ---
    const showAlert = (message, severity = "success") => {
        setAlert({ open: true, message, severity });
        setTimeout(() => setAlert({ open: false, message: "", severity: "success" }), 3000);
    };

    useEffect(() => {
        fetchRolPermisos();
        fetchRoles();
        fetchPermisos();
        fetchEmpleados();
    }, []);

    // --- CRUD ---
    const createRolPermiso = async (formData) => {
        try {
            const dataToSend = {
                ...formData,
                creadoPor: userIdFromToken,
                actualizadoPor: userIdFromToken,
            };

            const url = `${import.meta.env.VITE_BACKEND_USUARIO}/usuarios/rolpermiso`;
            const res = await axios.post(url, dataToSend);

            await registrarAuditoria(
                `Asignó el permiso ${formData.idPermiso} al rol ${formData.idRol}`
            );

            showAlert(res.data?.message || "Rol y permiso creado correctamente.");
            fetchRolPermisos();
        } catch (error) {
            console.error("Error al crear rol-permiso:", error);
            showAlert("Error al crear rol y permiso.", "error");
        }
    };

    const editRolPermiso = async (id, formData) => {
        try {
            const dataToSend = { ...formData, actualizadoPor: userIdFromToken };
            const url = `${import.meta.env.VITE_BACKEND_USUARIO}/usuarios/rolpermiso/${id}`;
            const res = await axios.put(url, dataToSend);

            await registrarAuditoria(
                `Editó la relación rol ${formData.idRol} con permiso ${formData.idPermiso}`
            );

            showAlert(res.data?.message || "Rol y permiso actualizado correctamente.");
            fetchRolPermisos();
        } catch (error) {
            console.error("Error al actualizar rol-permiso:", error);
            showAlert("Error al actualizar rol y permiso.", "error");
        }
    };

    const deleteRolPermiso = async (id) => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_USUARIO}/usuarios/rolpermiso/${id}`;
            const res = await axios.delete(url);

            await registrarAuditoria(`Eliminó la relación rol-permiso con ID ${id}`);
            showAlert(res.data?.message || "Rol y permiso eliminado correctamente.");
            fetchRolPermisos();
        } catch (error) {
            console.error("Error al eliminar rol-permiso:", error);
            showAlert("Error al eliminar rol y permiso.", "error");
        }
    };

    // --- Mapeo de datos ---
    const mappedRolPermisos = rolPermisos.map((rp) => {
        const rol = roles.find((r) => r.id === rp.idRol);
        const permiso = permisos.find((p) => p.id === rp.idPermiso);
        const creador = empleados.find((e) => e.id === rp.creadoPor);
        const actualizador = empleados.find((e) => e.id === rp.actualizadoPor);

        return {
            ...rp,
            rolNombre: rol ? rol.nombre : "—",
            permisoNombre: permiso ? permiso.nombre : "—",
            creadoPorNombre: creador ? `${creador.nombre} ${creador.apellido}` : "—",
            actualizadoPorNombre: actualizador ? `${actualizador.nombre} ${actualizador.apellido}` : "—",
        };
    });

    // --- Columnas de tabla ---
    const columns = [
        { field: "rolNombre", headerName: "Rol" },
        { field: "permisoNombre", headerName: "Permiso" },
        { field: "creadoPorNombre", headerName: "Creado Por" },
        { field: "actualizadoPorNombre", headerName: "Actualizado Por" },
    ];

    // --- Campos del formulario ---
    const fields = [
        {
            name: "idRol",
            label: "Rol",
            type: "select",
            options: roles.map((r) => ({ value: r.id, label: r.nombre })),
        },
        {
            name: "idPermiso",
            label: "Permiso",
            type: "select",
            options: permisos.map((p) => ({ value: p.id, label: p.nombre })),
        },
    ];

    return (
        <div style={{ padding: 20 }}>
            <h2>Gestión de Rol-Permiso</h2>

            <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        setModalData(null);
                        setModalOpen(true);
                    }}
                >
                    Asignar Permiso a Rol
                </Button>
            </Box>

            <TableTemplate
                columns={columns}
                data={mappedRolPermisos}
                onEdit={(row) => {
                    setModalData(row);
                    setModalOpen(true);
                }}
                onDelete={(row) => setConfirmOpen({ open: true, id: row.id })}
            />

            <FormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalData?.id ? "Editar Asignación" : "Asignar Permiso a Rol"}
                fields={fields}
                initialData={modalData}
                onSubmit={(data) => {
                    modalData?.id ? editRolPermiso(modalData.id, data) : createRolPermiso(data);
                    setModalOpen(false);
                }}
            />

            <ConfirmDialog
                open={confirmOpen.open}
                onClose={() => setConfirmOpen({ open: false, id: null })}
                onConfirm={() => deleteRolPermiso(confirmOpen.id)}
                title="Eliminar Asignación"
                message="¿Desea eliminar esta relación Rol-Permiso?"
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

export default RolPermiso;
