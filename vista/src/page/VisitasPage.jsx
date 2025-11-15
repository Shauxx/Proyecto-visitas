import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    CircularProgress,
    Tooltip,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import axios from "axios";
import ConfirmDialog from "../componentes/ConfirmDialog";
import VisitaModal from "../componentes/VisitaModal";

const VisitasPage = () => {
    const [visitas, setVisitas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const token = localStorage.getItem("token");
    const apiVisita = import.meta.env.VITE_BACKEND_VISITA;
    const apiUsuario = import.meta.env.VITE_BACKEND_USUARIO;
    const apiCliente = import.meta.env.VITE_BACKEND_URL;
    const apiConfig = import.meta.env.VITE_BACKEND_CONFIG;

    // 📋 Cargar visitas con nombres reales
    const fetchVisitas = async () => {
        try {
            setLoading(true);
            const visitasRes = await axios.get(`${apiVisita}/visita`);
            const empleadosRes = await axios.get(`${apiUsuario}/usuarios/empleado`);
            const usuariosRes = await axios.get(`${apiUsuario}/usuarios/usuario`);
            const clientesRes = await axios.get(`${apiCliente}/cliente`);

            const visitasData = visitasRes.data.data || [];
            const empleados = empleadosRes.data.data || [];
            const usuarios = usuariosRes.data.data || [];
            const clientes = clientesRes.data.data || [];

            // 🔗 Mapear roles con empleados
            const usuariosConRol = usuarios.map((u) => ({
                id: u.id,
                idEmpleado: u.idEmpleado,
                idRol: u.idRol,
            }));

            const visitasConNombres = visitasData.map((v) => {
                // Cliente
                const cliente = clientes.find((c) => c.id === v.idCliente);

                // Supervisor
                const supervisorUsuario = usuariosConRol.find((u) => u.idEmpleado === v.idSupervisor);
                const supervisorEmp = empleados.find((e) => e.id === v.idSupervisor);

                // Técnico
                const tecnicoUsuario = usuariosConRol.find((u) => u.idEmpleado === v.idTecnico);
                const tecnicoEmp = empleados.find((e) => e.id === v.idTecnico);

                return {
                    ...v,
                    clienteNombre: cliente ? cliente.nombre : `Cliente #${v.idCliente}`,
                    supervisorNombre: supervisorEmp
                        ? `${supervisorEmp.nombre} ${supervisorEmp.apellido}`
                        : `Supervisor #${v.idSupervisor}`,
                    tecnicoNombre: tecnicoEmp
                        ? `${tecnicoEmp.nombre} ${tecnicoEmp.apellido}`
                        : `Técnico #${v.idTecnico}`,
                };
            });

            setVisitas(visitasConNombres);
        } catch (error) {
            console.error("Error al obtener visitas:", error);
        } finally {
            setLoading(false);
        }
    };

    // 🧾 Auditoría
    const registrarAuditoria = async (accion) => {
        try {
            if (!token) return;
            const decoded = JSON.parse(atob(token.split(".")[1]));
            const userId = decoded.id || decoded.userId || decoded.data?.id;

            const url = `${apiConfig}/config/auditoria`;
            await axios.post(
                url,
                { idEmpleado: userId, accion },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (error) {
            console.error("Error al registrar auditoría:", error);
        }
    };

    useEffect(() => {
        fetchVisitas();
    }, []);

    // 🗑️ Eliminar visita
    const handleDelete = async (id) => {
        try {
            await axios.delete(`${apiVisita}/visita/${id}`);
            await registrarAuditoria(`Eliminó la visita ID: ${id}`);
            fetchVisitas();
        } catch (error) {
            console.error("Error al eliminar visita:", error);
        }
    };

    const handleEdit = (data) => {
        setEditData(data);
        setOpenModal(true);
    };

    const handleNew = () => {
        setEditData(null);
        setOpenModal(true);
    };

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
                Gestión de Visitas
            </Typography>

            <Button
                variant="contained"
                startIcon={<Add />}
                sx={{ mb: 2 }}
                onClick={handleNew}
            >
                Nueva Visita
            </Button>

            {loading ? (
                <CircularProgress />
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Cliente</TableCell>
                                <TableCell>Supervisor</TableCell>
                                <TableCell>Técnico</TableCell>
                                <TableCell>Fecha Programada</TableCell>
                                <TableCell>Tipo Servicio</TableCell>
                                <TableCell>Acciones</TableCell>
                                <TableCell>Estado</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {visitas.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        No hay visitas registradas
                                    </TableCell>
                                </TableRow>
                            ) : (
                                visitas.map((v) => (
                                    <TableRow key={v.id}>
                                        <TableCell>{v.id}</TableCell>
                                        <TableCell>{v.clienteNombre}</TableCell>
                                        <TableCell>{v.supervisorNombre}</TableCell>
                                        <TableCell>{v.tecnicoNombre}</TableCell>
                                        <TableCell>{new Date(v.fechaProgramada).toLocaleString()}</TableCell>
                                        <TableCell>{v.tipoServicio?.tipo || "Sin tipo"}</TableCell>
                                        <TableCell>{v.estado?.tipo || "Sin estado"}</TableCell>
                                        <TableCell>
                                            <Tooltip title="Editar">
                                                <IconButton color="primary" onClick={() => handleEdit(v)}>
                                                    <Edit />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Eliminar">
                                                <IconButton
                                                    color="error"
                                                    onClick={() => {
                                                        setSelectedId(v.id);
                                                        setConfirmOpen(true);
                                                    }}
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>

                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <VisitaModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                fetchVisitas={fetchVisitas}
                editData={editData}
                registrarAuditoria={registrarAuditoria}
            />

            <ConfirmDialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={() => handleDelete(selectedId)}
                title="Eliminar visita"
                message="¿Deseas eliminar esta visita?"
            />
        </Box>
    );
};

export default VisitasPage;
