//vista\src\page\VisitasPage.jsx
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
    CircularProgress, Snackbar, Alert,
    Tooltip,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import axios from "axios";
import ConfirmDialog from "../componentes/ConfirmDialog";
import VisitaModal from "../componentes/VisitaModal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { TablePagination } from "@mui/material";



const VisitasPage = () => {
    const [visitas, setVisitas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [alert, setAlert] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const showAlert = (message, severity = "success") => {
        setAlert({ open: true, message, severity });
    };

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

            const clientesRes = await axios.get(`${apiCliente}/cliente`);

            const visitasData = visitasRes.data.data || [];
            const empleados = empleadosRes.data.data || [];
            const clientes = clientesRes.data.data || [];

            // 🔗 Mapear roles con empleados


            const decodedUser = JSON.parse(atob(token.split(".")[1]));
            const rol = decodedUser.idRol;
            const idEmpleado = decodedUser.idEmpleado;

            let visitasFiltradas;
            const showAlert = (message, severity = "success") => {
                setAlert({ open: true, message, severity });
            };

            // ADMIN → ve todo
            if (rol === 1) {
                visitasFiltradas = visitasData;

                // SUPERVISOR → solo las donde él es el supervisor asignado
            } else if (rol === 2) {
                visitasFiltradas = visitasData.filter(v =>
                    v.idSupervisor === idEmpleado
                );

                // TÉCNICO → solo sus visitas
            } else if (rol === 3) {
                visitasFiltradas = visitasData.filter(v =>
                    v.idTecnico === idEmpleado
                );
            }


            const visitasConNombres = visitasFiltradas.map((v) => {
                // Cliente
                const cliente = clientes.find((c) => c.id === v.idCliente);

                // Supervisor
                const supervisorEmp = empleados.find((e) => e.id === v.idSupervisor);

                // Técnico
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
            setAlert({
                open: true,
                message: "Visita eliminada correctamente",
                severity: "success",
            });
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

    const generarPDF = () => {
        const doc = new jsPDF("landscape"); // horizontal porque la tabla es ancha

        // 🔹 Encabezado
        doc.setFontSize(18);
        doc.text("SkyNet S.A.", 14, 20);

        doc.setFontSize(14);
        doc.text("Reporte de Visitas", 14, 30);

        // 🔹 Columnas
        const columnas = [
            "ID",
            "Cliente",
            "Supervisor",
            "Técnico",
            "Fecha Programada",
            "Descripción",
            "Tipo Servicio",
            "Estado"
        ];

        // 🔹 Filas
        const filas = visitas.map((v) => [
            v.id,
            v.clienteNombre,
            v.supervisorNombre,
            v.tecnicoNombre,
            new Date(v.fechaProgramada).toLocaleString(),
            v.descripcion || "",
            v.tipoServicio?.tipo || "Sin tipo",
            v.estado?.tipo || "Sin estado"
        ]);

        autoTable(doc, {
            startY: 38,
            head: [columnas],
            body: filas,
            theme: "grid",
            headStyles: {
                fillColor: [25, 118, 210],
                textColor: 255,
            },
            styles: {
                fontSize: 8,
            },
            columnStyles: {
                1: { cellWidth: 50 }, // Cliente
                2: { cellWidth: 40 }, // Supervisor
                3: { cellWidth: 40 }, // Técnico
                4: { cellWidth: 35 }, // Fecha
                5: { cellWidth: 50 }, // Descripción
                6: { cellWidth: 35 }, // Tipo
                7: { cellWidth: 30 }, // Estado
            }
        });

        doc.save("Reporte_Visitas_SkyNet.pdf");
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };


    return (
        <Box sx={{ p: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                    Gestión de Visitas
                </Typography>

                <Button variant="outlined" color="secondary" onClick={generarPDF}>
                    Descargar PDF
                </Button>
            </Box>


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
                            <TableRow sx={{
                                backgroundColor: "#1976d2",
                                color: "#fff",
                                fontWeight: "bold",
                                textAlign: "center",
                            }}>
                                <TableCell sx={{ color: "#fff", }}>ID</TableCell>
                                <TableCell sx={{ color: "#fff", }}>Cliente</TableCell>
                                <TableCell sx={{ color: "#fff", }}>Supervisor</TableCell>
                                <TableCell sx={{ color: "#fff", }}>Técnico</TableCell>
                                <TableCell sx={{ color: "#fff", }}>Fecha Programada</TableCell>
                                <TableCell sx={{ color: "#fff" }}>Descripción</TableCell>
                                <TableCell sx={{ color: "#fff", }}>Tipo Servicio</TableCell>
                                <TableCell sx={{ color: "#fff", }}>Acciones</TableCell>
                                <TableCell sx={{ color: "#fff", }}>Estado</TableCell>
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
                                visitas
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((v) => (
                                        <TableRow key={v.id}>
                                            <TableCell>{v.id}</TableCell>
                                            <TableCell>{v.clienteNombre}</TableCell>
                                            <TableCell>{v.supervisorNombre}</TableCell>
                                            <TableCell>{v.tecnicoNombre}</TableCell>
                                            <TableCell>{new Date(v.fechaProgramada).toLocaleString()}</TableCell>
                                            <TableCell>{v.descripcion || "—"}</TableCell>
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
            <TablePagination
                component="div"
                count={visitas.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Filas por página:"
                rowsPerPageOptions={[5, 10, 25, 50]}
            />


            <VisitaModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                fetchVisitas={fetchVisitas}
                editData={editData}
                registrarAuditoria={registrarAuditoria}
                showAlert={showAlert}
            />

            <ConfirmDialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={() => handleDelete(selectedId)}
                title="Eliminar visita"
                message="¿Deseas eliminar esta visita?"
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
                >
                    {alert.message}
                </Alert>
            </Snackbar>

        </Box>
    );
};

export default VisitasPage;
