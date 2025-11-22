import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Paper,
    CircularProgress,
} from "@mui/material";
import axios from "axios";

const HistoricoVisitasTecnico = () => {
    const [visitas, setVisitas] = useState([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const token = localStorage.getItem("token");
    const apiVisita = import.meta.env.VITE_BACKEND_VISITA;

    const fetchHistorial = async () => {
        try {
            setLoading(true);
            const decoded = JSON.parse(atob(token.split(".")[1]));
            const tecnicoId = decoded.idEmpleado || decoded.id;

            const res = await axios.get(`${apiVisita}/visita/historial/tecnico/${tecnicoId}`);
            setVisitas(res.data.data || []);
        } catch (error) {
            console.error("Error al obtener historial:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistorial();
    }, []);

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
                Historial de Visitas Realizadas
            </Typography>

            {loading ? (
                <CircularProgress />
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#1976d2" }}>
                                <TableCell sx={{ color: "#fff" }}>ID</TableCell>
                                <TableCell sx={{ color: "#fff" }}>Cliente</TableCell>
                                <TableCell sx={{ color: "#fff" }}>Departamento</TableCell>
                                <TableCell sx={{ color: "#fff" }}>Municipio</TableCell>
                                <TableCell sx={{ color: "#fff" }}>Fecha</TableCell>
                                <TableCell sx={{ color: "#fff" }}>Descripción</TableCell>
                                <TableCell sx={{ color: "#fff" }}>Tipo Servicio</TableCell>
                                <TableCell sx={{ color: "#fff" }}>Estado</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {visitas
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((v) => (
                                    <TableRow key={v.id}>
                                        <TableCell>{v.id}</TableCell>
                                        <TableCell>{v.clienteNombre}</TableCell>
                                        <TableCell>{v.departamento || "Sin datos"}</TableCell>
                                        <TableCell>{v.municipio || "Sin datos"}</TableCell>
                                        <TableCell>{new Date(v.fechaProgramada).toLocaleString()}</TableCell>
                                        <TableCell>{v.descripcion || "—"}</TableCell>
                                        <TableCell>{v.tipoServicio?.tipo || "Sin tipo"}</TableCell>
                                        <TableCell>{v.estado?.tipo}</TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>

                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={visitas.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                    />
                </TableContainer>
            )}
        </Box>
    );
};

export default HistoricoVisitasTecnico;
