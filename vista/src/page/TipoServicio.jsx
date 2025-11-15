import React, { useEffect, useState } from "react";
import axios from "axios";
import TableTemplate from "../componentes/TableTemplate";
import FormModal from "../componentes/FormModal";
import ConfirmDialog from "../componentes/ConfirmDialog";
import { Button, Box, Snackbar, Alert } from "@mui/material";

const TipoServicio = () => {
    const [tiposServicio, setTiposServicio] = useState([]);
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

    // 🔹 Obtener tipos de servicio
    const fetchTiposServicio = async () => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_VISITA}/visita/tipoServicio`;
            const res = await axios.get(url);
            setTiposServicio(res.data?.data || []);
        } catch (error) {
            console.error("Error al obtener tipos de servicio:", error);
            setTiposServicio([]);
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

    // 🔹 Registrar auditoría
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

    // 🔹 Mostrar alertas
    const showAlert = (message, severity = "success") => {
        setAlert({ open: true, message, severity });
        setTimeout(() => setAlert({ open: false, message: "", severity: "success" }), 3000);
    };

    useEffect(() => {
        fetchTiposServicio();
        fetchEmpleados();
    }, []);

    // 🔹 Crear tipo de servicio
    const createTipoServicio = async (formData) => {
        try {
            const dataToSend = {
                ...formData,
                creadoPor: userIdFromToken,
                actualizadoPor: userIdFromToken,
            };

            const url = `${import.meta.env.VITE_BACKEND_VISITA}/visita/tipoServicio`;
            const res = await axios.post(url, dataToSend);

            await registrarAuditoria(`Creó el tipo de servicio "${formData.tipo}"`);
            showAlert(res.data?.message || "Tipo de servicio creado correctamente.");
            fetchTiposServicio();
        } catch (error) {
            console.error("Error al crear tipo de servicio:", error);
            showAlert("Error al crear tipo de servicio.", "error");
        }
    };

    // 🔹 Editar tipo de servicio
    const editTipoServicio = async (id, formData) => {
        try {
            const dataToSend = { ...formData, actualizadoPor: userIdFromToken };
            const url = `${import.meta.env.VITE_BACKEND_VISITA}/visita/tipoServicio/${id}`;
            const res = await axios.put(url, dataToSend);

            await registrarAuditoria(`Editó el tipo de servicio "${formData.tipo}"`);
            showAlert(res.data?.message || "Tipo de servicio actualizado correctamente.");
            fetchTiposServicio();
        } catch (error) {
            console.error("Error al actualizar tipo de servicio:", error);
            showAlert("Error al actualizar tipo de servicio.", "error");
        }
    };

    // 🔹 Eliminar tipo de servicio
    const deleteTipoServicio = async (id) => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_VISITA}/visita/tipoServicio/${id}`;
            const res = await axios.delete(url);

            await registrarAuditoria(`Eliminó el tipo de servicio con ID ${id}`);
            showAlert(res.data?.message || "Tipo de servicio eliminado correctamente.");
            fetchTiposServicio();
        } catch (error) {
            console.error("Error al eliminar tipo de servicio:", error);
            showAlert("Error al eliminar tipo de servicio.", "error");
        }
    };

    // 🔹 Mapear con nombres de empleados
    const mappedTiposServicio = tiposServicio.map((serv) => {
        const creador = empleados.find((e) => e.id === serv.creadoPor);
        const actualizador = empleados.find((e) => e.id === serv.actualizadoPor);
        return {
            ...serv,
            creadoPorNombre: creador ? `${creador.nombre} ${creador.apellido}` : "—",
            actualizadoPorNombre: actualizador ? `${actualizador.nombre} ${actualizador.apellido}` : "—",
        };
    });

    // 🔹 Columnas de la tabla
    const columns = [
        { field: "tipo", headerName: "Tipo de Servicio" },
        { field: "creadoPorNombre", headerName: "Creado Por" },
        { field: "actualizadoPorNombre", headerName: "Actualizado Por" },
    ];

    // 🔹 Campos del formulario
    const fields = [
        { name: "tipo", label: "Tipo de Servicio" },
    ];

    return (
        <div style={{ padding: 20 }}>
            <h2>Gestión de Tipos de Servicio</h2>

            <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        setModalData(null);
                        setModalOpen(true);
                    }}
                >
                    Crear Tipo de Servicio
                </Button>
            </Box>

            <TableTemplate
                columns={columns}
                data={mappedTiposServicio}
                onEdit={(row) => {
                    setModalData(row);
                    setModalOpen(true);
                }}
                onDelete={(row) => setConfirmOpen({ open: true, id: row.id })}
            />

            <FormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalData?.id ? "Editar Tipo de Servicio" : "Crear Tipo de Servicio"}
                fields={fields}
                initialData={modalData}
                onSubmit={(data) => {
                    modalData?.id ? editTipoServicio(modalData.id, data) : createTipoServicio(data);
                    setModalOpen(false);
                }}
            />

            <ConfirmDialog
                open={confirmOpen.open}
                onClose={() => setConfirmOpen({ open: false, id: null })}
                onConfirm={() => deleteTipoServicio(confirmOpen.id)}
                title="Eliminar Tipo de Servicio"
                message="¿Desea eliminar este tipo de servicio?"
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

export default TipoServicio;
