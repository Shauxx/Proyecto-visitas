import React, { useEffect, useState } from "react";
import axios from "axios";
import TableTemplate from "../componentes/TableTemplate";
import FormModal from "../componentes/FormModal";
import ConfirmDialog from "../componentes/ConfirmDialog";
import { Button, Box, Snackbar, Alert } from "@mui/material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


const Usuarios = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState({ open: false, id: null });

    // 🔔 Alerta visual
    const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
    const showAlert = (message, severity = "success") => {
        setAlert({ open: true, message, severity });
        setTimeout(() => setAlert({ open: false, message: "", severity: "success" }), 3000);
    };

    // 🔹 Obtener ID del usuario logueado
    const token = localStorage.getItem("token");
    let userIdFromToken = 0;
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            userIdFromToken = payload.id || payload.userId || payload.data?.id;
        } catch (err) {
            console.error("Token inválido:", err);
        }
    }

    // 🔹 Registrar auditoría
    const registrarAuditoria = async (accion) => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_CONFIG}/config/auditoria`;
            await axios.post(
                url,
                { idEmpleado: userIdFromToken, accion },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (error) {
            console.error("Error al registrar auditoría:", error);
        }
    };

    // 🔹 Obtener usuarios
    const fetchUsers = async () => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_USUARIO}/usuarios/usuario`;
            const res = await axios.get(url);
            setUsers(res.data?.data || []);
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
            setUsers([]);
        }
    };

    // 🔹 Obtener roles
    const obtenerRoles = async () => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_USUARIO}/usuarios/rol`;
            const { data } = await axios.get(url);
            setRoles(data.success && Array.isArray(data.data) ? data.data : []);
        } catch (error) {
            console.error("Error al obtener roles:", error);
            setRoles([]);
        }
    };

    // 🔹 Obtener empleados
    const obtenerEmpleados = async () => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_USUARIO}/usuarios/empleado`;
            const { data } = await axios.get(url);
            setEmpleados(data.success && Array.isArray(data.data) ? data.data : []);
        } catch (error) {
            console.error("Error al obtener empleados:", error);
            setEmpleados([]);
        }
    };

    useEffect(() => {
        fetchUsers();
        obtenerRoles();
        obtenerEmpleados();
    }, []);

    // 🔹 Crear usuario
    const createUser = async (formData) => {
        try {
            const dataToSend = {
                ...formData,
                creadoPor: userIdFromToken,
                actualizadoPor: userIdFromToken,
            };
            const url = `${import.meta.env.VITE_BACKEND_USUARIO}/usuarios/usuario`;
            const res = await axios.post(url, dataToSend);

            await registrarAuditoria(`Creó al usuario ${formData.usuario}`);
            showAlert(res.data?.message || "Usuario creado correctamente.");
            fetchUsers();
        } catch (error) {
            console.error("Error al crear usuario:", error);
            showAlert("Error al crear usuario.", "error");
        }
    };

    // 🔹 Editar usuario
    const editUser = async (id, formData) => {
        try {
            const dataToSend = { ...formData, actualizadoPor: userIdFromToken };
            const url = `${import.meta.env.VITE_BACKEND_USUARIO}/usuarios/usuario/${id}`;
            const res = await axios.put(url, dataToSend);

            await registrarAuditoria(`Editó al usuario ${formData.usuario}`);
            showAlert(res.data?.message || "Usuario actualizado correctamente.");
            fetchUsers();
        } catch (error) {
            console.error("Error al actualizar usuario:", error);
            showAlert("Error al actualizar usuario.", "error");
        }
    };

    // 🔹 Eliminar usuario
    const deleteUser = async (id) => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_USUARIO}/usuarios/usuario/${id}`;
            const res = await axios.delete(url);

            const usuario = users.find((u) => u.id === id);
            await registrarAuditoria(`Eliminó al usuario ${usuario?.usuario || id}`);
            showAlert(res.data?.message || "Usuario eliminado correctamente.");
            fetchUsers();
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
            showAlert("Error al eliminar usuario.", "error");
        }
    };

    // 🔹 Columnas de la tabla
    const mappedUsers = users.map((user) => {
        const rol = roles.find((r) => r.id === user.idRol);
        const emp = empleados.find((e) => e.id === user.idEmpleado);
        const creador = empleados.find((e) => e.id === user.creadoPor);
        const actualizador = empleados.find((e) => e.id === user.actualizadoPor);

        return {
            ...user,
            rolNombre: rol ? rol.nombre : "Desconocido",
            empleadoNombre: emp ? `${emp.nombre} ${emp.apellido}` : "Sin asignar",
            creadoNombre: creador ? `${creador.nombre} ${creador.apellido}` : "—",
            actualizadoNombre: actualizador ? `${actualizador.nombre} ${actualizador.apellido}` : "—",
        };
    });


    const userColumns = [
        { field: "usuario", headerName: "Usuario", flex: 1 },
        { field: "rolNombre", headerName: "Rol", flex: 1 },
        { field: "empleadoNombre", headerName: "Empleado", flex: 1 },
        { field: "creadoNombre", headerName: "Creado Por", flex: 1 },
        { field: "actualizadoNombre", headerName: "Actualizado Por", flex: 1 },
    ];

    // 🔹 Campos del formulario
    const userFields = [
        { name: "usuario", label: "Usuario" },
        { name: "contra", label: "Contraseña", type: "password" },
        {
            name: "idRol",
            label: "Rol",
            type: "select",
            options: roles.map((rol) => ({ value: rol.id, label: rol.nombre })),
        },
        {
            name: "idEmpleado",
            label: "Empleado",
            type: "select",
            options: empleados.map((emp) => ({
                value: emp.id,
                label: `${emp.nombre} ${emp.apellido}`,
            })),
        },
    ];

    const generarPDFUsuarios = () => {
        const doc = new jsPDF();

        // 1️⃣ Nombre de la empresa
        doc.setFontSize(18);
        doc.text("SkyNet S.A.", 14, 20);

        // 2️⃣ Columnas del PDF
        const tableColumn = [
            "Usuario",
            "Rol",
            "Empleado",
            "Creado Por",
            "Actualizado Por"
        ];

        // 3️⃣ Filas basadas en mappedUsers
        const tableRows = mappedUsers.map((u) => [
            u.usuario,
            u.rolNombre,
            u.empleadoNombre,
            u.creadoNombre,
            u.actualizadoNombre,
        ]);

        // 4️⃣ Construir tabla
        autoTable(doc, {
            startY: 28,
            head: [tableColumn],
            body: tableRows,
            theme: "grid",
            headStyles: { fillColor: [25, 118, 210], textColor: 255 },
            styles: { fontSize: 10 }
        });

        // 5️⃣ Descargar PDF
        doc.save("Usuarios_SkyNet.pdf");
    };


    return (
        <div style={{ padding: 20 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <h2>Gestión de Usuarios</h2>
                <Button variant="outlined" color="secondary" onClick={generarPDFUsuarios}>
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
                    Crear Usuario
                </Button>
            </Box>

            <TableTemplate
                columns={userColumns}
                data={mappedUsers}
                onEdit={(row) => {
                    setModalData(row);
                    setModalOpen(true);
                }}
                onDelete={(row) => setConfirmOpen({ open: true, id: row.id })}
            />

            <FormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalData?.id ? "Editar Usuario" : "Crear Usuario"}
                fields={userFields}
                initialData={modalData}
                onSubmit={(data) => {
                    modalData?.id ? editUser(modalData.id, data) : createUser(data);
                    setModalOpen(false);
                }}
            />

            <ConfirmDialog
                open={confirmOpen.open}
                onClose={() => setConfirmOpen({ open: false, id: null })}
                onConfirm={() => deleteUser(confirmOpen.id)}
                title="Eliminar Usuario"
                message="¿Desea eliminar este usuario?"
            />

            {/* 🔔 Snackbar */}
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

export default Usuarios;
