import React, { useEffect, useState } from "react";
import {
    Box,
    Grid,
    Paper,
    Typography,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Pagination,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import axios from "axios";

const DashboardTecnico = () => {

    const [filtro, setFiltro] = useState("dia");
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    const [pagina, setPagina] = useState(1);
    const porPagina = 5;

    const token = localStorage.getItem("token");
    const apiDashboard = import.meta.env.VITE_BACKEND_CONFIG;

    const decoded = JSON.parse(atob(token.split(".")[1]));
    const tecnicoId = decoded.idEmpleado;

    const fetchData = async () => {
        try {
            const res = await axios.get(`${apiDashboard}/dashboard/tecnico/${tecnicoId}`);
            setData(res.data.data);
        } catch (error) {
            console.error("Error cargando dashboard técnico:", error);
        } finally {
            setLoading(false);
        }
    };

    const filtrarVisitas = () => {
        if (!data) return [];
        const hoy = new Date();

        return data.ultimasVisitas.filter((v) => {
            const fecha = new Date(v.fechaProgramada);

            if (filtro === "dia")
                return (
                    fecha.getDate() === hoy.getDate() &&
                    fecha.getMonth() === hoy.getMonth() &&
                    fecha.getFullYear() === hoy.getFullYear()
                );

            if (filtro === "mes")
                return (
                    fecha.getMonth() === hoy.getMonth() &&
                    fecha.getFullYear() === hoy.getFullYear()
                );

            if (filtro === "año")
                return fecha.getFullYear() === hoy.getFullYear();

            return true;
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading || !data) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    const filtradas = filtrarVisitas();

    const totalFiltradas = filtradas.length;
    const finalizadasFiltradas = filtradas.filter(v => v.idEstado === 2).length;
    const reprogramadasFiltradas = filtradas.filter(v => v.idEstado === 4).length;
    const canceladasFiltradas = filtradas.filter(v => v.idEstado === 3).length;
    const registradasFiltradas = filtradas.filter(v => v.idEstado === 1).length;

    const inicio = (pagina - 1) * porPagina;
    const visitasPaginadas = filtradas.slice(inicio, inicio + porPagina);
    const totalPaginas = Math.ceil(filtradas.length / porPagina);

    const pieData = [
        { name: "Finalizadas", value: finalizadasFiltradas, color: "#00C853" },
        { name: "Reprogramadas", value: reprogramadasFiltradas, color: "#FFB300" },
        { name: "Canceladas", value: canceladasFiltradas, color: "#D32F2F" },
        { name: "Registradas", value: registradasFiltradas, color: "#4A90E2" },
    ];

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight="bold" mb={4}>
                Dashboard Técnico
            </Typography>

            {/* -------------------- */}
            {/* FILA: CARDS + GRAFICA */}
            {/* -------------------- */}
            <Grid container spacing={3}>

                {/* ------ CARDS ------ */}
                <Grid item xs={12} md={8}>
                    {/* FILTRO */}
                    <Paper
                        sx={{
                            mb: 5,
                            borderRadius: "16px",
                            backgroundColor: "#fafafa",
                        }}
                    >
                        <FormControl fullWidth size="small">
                            <InputLabel>Filtrar por</InputLabel>
                            <Select
                                fullWidth
                                value={filtro}
                                label="Filtrar por"
                                onChange={(e) => setFiltro(e.target.value)}
                                sx={{
                                    borderRadius: "10px",
                                }}
                            >
                                <MenuItem value="dia">Del Día</MenuItem>
                                <MenuItem value="mes">Del Mes</MenuItem>
                                <MenuItem value="año">Del Año</MenuItem>
                                <MenuItem value="todo">Todo</MenuItem>
                            </Select>
                        </FormControl>
                    </Paper>

                    <Grid container spacing={3}>
                        {[
                            { titulo: "Total Visitas", valor: totalFiltradas, color: "#4A90E2" },
                            { titulo: "Finalizadas", valor: finalizadasFiltradas, color: "#00C853" },
                            { titulo: "Reprogramadas", valor: reprogramadasFiltradas, color: "#FFB300" },
                            { titulo: "Canceladas", valor: canceladasFiltradas, color: "#D32F2F" },
                        ].map((item, index) => (
                            <Grid item xs={12} sm={6} md={6} key={index}>
                                <Paper
                                    sx={{
                                        p: 3,
                                        textAlign: "center",
                                        borderRadius: "20px",
                                        background: `linear-gradient(135deg, ${item.color}33, ${item.color}66)`,
                                        boxShadow: `0px 4px 15px ${item.color}55`,
                                        transition: "0.3s",
                                        "&:hover": {
                                            transform: "translateY(-5px)",
                                            boxShadow: `0px 8px 22px ${item.color}99`,
                                        },
                                    }}
                                >
                                    <Typography variant="h6" sx={{ color: "#333", fontWeight: "bold" }}>
                                        {item.titulo}
                                    </Typography>
                                    <Typography
                                        variant="h3"
                                        sx={{
                                            mt: 1,
                                            fontWeight: "bold",
                                            color: item.color,
                                            textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
                                        }}
                                    >
                                        {item.valor}
                                    </Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>


                </Grid>

                {/* ------ GRAFICO ------ */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, borderRadius: "20px" }}>
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                            <PieChart width={460} height={200}>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={75}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </Box>
                    </Paper>
                </Grid>

            </Grid>

            {/* -------------------- */}
            {/* TABLA COMPLETA */}
            {/* -------------------- */}
            <Box mt={5}>
                <Typography variant="h6" mb={2}>
                    Últimas Visitas
                </Typography>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#1976d2" }}>
                                <TableCell sx={{ color: "#fff" }}>ID</TableCell>
                                <TableCell sx={{ color: "#fff" }}>Cliente</TableCell>
                                <TableCell sx={{ color: "#fff" }}>Ubicación</TableCell>
                                <TableCell sx={{ color: "#fff" }}>Fecha</TableCell>
                                <TableCell sx={{ color: "#fff" }}>Estado</TableCell>
                                <TableCell sx={{ color: "#fff" }}>Descripción</TableCell>
                                <TableCell sx={{ color: "#fff" }}>Tipo Servicio</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {visitasPaginadas.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        No hay visitas registradas.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                visitasPaginadas.map((v) => (
                                    <TableRow key={v.id}>
                                        <TableCell>{v.id}</TableCell>
                                        <TableCell>{v.clienteNombre}</TableCell>
                                        <TableCell>{v.ubicacion}</TableCell>
                                        <TableCell>{new Date(v.fechaProgramada).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={v.estado?.tipo || "Sin estado"}
                                                sx={{
                                                    color: "white",
                                                    backgroundColor:
                                                        v.estado?.tipo === "Finalizado"
                                                            ? "green"
                                                            : v.estado?.tipo === "Cancelada" ||
                                                                v.estado?.tipo === "Cancelado"
                                                                ? "red"
                                                                : "orange",
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>{v.descripcion || "—"}</TableCell>
                                        <TableCell>{v.tipoServicio?.tipo || "Sin tipo"}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    <Box display="flex" justifyContent="center" py={2}>
                        <Pagination
                            count={totalPaginas}
                            page={pagina}
                            onChange={(e, value) => setPagina(value)}
                            color="primary"
                        />
                    </Box>
                </TableContainer>
            </Box>

        </Box>
    );
};

export default DashboardTecnico;
