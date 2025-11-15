// src/pages/Estado.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import TableTemplate from "../componentes/TableTemplate";
import FormModal from "../componentes/FormModal";
import ConfirmDialog from "../componentes/ConfirmDialog";
import { Button, Box, Snackbar, Alert } from "@mui/material";

const Estado = () => {
    const [estados, setEstados] = useState([]);
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

    // 🔹 Función para mostrar alertas
    const showAlert = (message, severity = "success") => {
        setAlert({ open: true, message, severity });
        setTimeout(() => setAlert({ open: false, message: "", severity: "success" }), 3000);
    };

    // 🔹 Registrar auditoría
    const registrarAuditoria = async (accion) => {
        try {
            if (!token) return;
            const decoded = JSON.parse(atob(token.split(".")[1]));
            const userId = decoded.id || decoded.userId || decoded.data?.id;

            const url = `${import.meta.env.VITE_BACKEND_CONFIG}/config/auditoria`;
            await axios.post(url, { idEmpleado: userId, accion }, { headers: { Authorization: `Bearer ${token}` } });
        } catch (error) {
            console.error("Error al registrar auditoría:", error);
        }
    };

    // 🔹 Obtener estados
    const fetchEstados = async () => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_VISITA}/visita/estado`;
            const res = await axios.get(url);
            setEstados(res.data?.data || []);
        } catch (error) {
            console.error("Error al obtener estados:", error);
            setEstados([]);
        }
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
        fetchEstados();
        fetchEmpleados();
    }, []);

    // 🔹 CRUD de Estado

    // Crear
    const createEstado = async (formData) => {
        try {
            const dataToSend = { ...formData, creadoPor: userIdFromToken, actualizadoPor: userIdFromToken };
            const url = `${import.meta.env.VITE_BACKEND_VISITA}/visita/estado`;
            const res = await axios.post(url, dataToSend);

            await registrarAuditoria(`Creó el estado "${formData.tipo}"`);
            showAlert(res.data?.message || "Estado creado correctamente.");
            fetchEstados();
        } catch (error) {
            console.error(error);
            showAlert("Error al crear estado.", "error");
        }
    };

    // Editar
    const editEstado = async (id, formData) => {
        try {
            const dataToSend = { ...formData, actualizadoPor: userIdFromToken };
            const url = `${import.meta.env.VITE_BACKEND_VISITA}/visita/estado/${id}`;
            const res = await axios.put(url, dataToSend);

            await registrarAuditoria(`Editó el estado "${formData.tipo}"`);
            showAlert(res.data?.message || "Estado actualizado correctamente.");
            fetchEstados();
        } catch (error) {
            console.error(error);
            showAlert("Error al actualizar estado.", "error");
        }
    };

    // Desactivar (soft delete)
    const deleteEstado = async (id) => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_VISITA}/visita/estado/${id}`;
            const res = await axios.delete(url);

            await registrarAuditoria(`Desactivó el estado con ID ${id}`);
            showAlert(res.data?.message || "Estado desactivado correctamente.");
            fetchEstados();
        } catch (error) {
            console.error(error);
            showAlert("Error al desactivar estado.", "error");
        }
    };

    // 🔹 Mapear nombres de creado/actualizado
    const mappedEstados = estados.map((estado) => {
        const creador = empleados.find((e) => e.id === estado.creadoPor);
        const actualizador = empleados.find((e) => e.id === estado.actualizadoPor);
        return {
            ...estado,
            creadoPorNombre: creador ? `${creador.nombre} ${creador.apellido}` : "—",
            actualizadoPorNombre: actualizador ? `${actualizador.nombre} ${actualizador.apellido}` : "—",
        };
    });

    // 🔹 Columnas de la tabla
    const estadoColumns = [
        { field: "tipo", headerName: "Tipo de Estado" },
        { field: "creadoPorNombre", headerName: "Creado Por" },
        { field: "actualizadoPorNombre", headerName: "Actualizado Por" },
    ];

    // 🔹 Campos formulario modal
    const estadoFields = [
        { name: "tipo", label: "Tipo de Estado" },
    ];

    return (
        <div style={{ padding: 20 }}>
            <h2>Gestión de Estados</h2>

            <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={() => { setModalData(null); setModalOpen(true); }}>
                    Crear Estado
                </Button>
            </Box>

            <TableTemplate
                columns={estadoColumns}
                data={mappedEstados}
                onEdit={(row) => { setModalData(row); setModalOpen(true); }}
                onDelete={(row) => setConfirmOpen({ open: true, id: row.id })}
            />

            <FormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalData?.id ? "Editar Estado" : "Crear Estado"}
                fields={estadoFields}
                initialData={modalData}
                onSubmit={(data) => {
                    modalData?.id ? editEstado(modalData.id, data) : createEstado(data);
                    setModalOpen(false);
                }}
            />

            <ConfirmDialog
                open={confirmOpen.open}
                onClose={() => setConfirmOpen({ open: false, id: null })}
                onConfirm={() => deleteEstado(confirmOpen.id)}
                title="Eliminar Estado"
                message="¿Desea desactivar este estado?"
            />

            <Snackbar
                open={alert.open}
                autoHideDuration={3000}
                onClose={() => setAlert({ open: false, message: "", severity: "success" })}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert severity={alert.severity} variant="filled" onClose={() => setAlert({ open: false, message: "", severity: "success" })}>
                    {alert.message}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default Estado;
