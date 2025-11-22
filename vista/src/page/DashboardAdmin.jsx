import React, { useEffect, useState } from "react";
import {
    Box, Grid, Paper, Typography, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Pagination, Chip, FormControl, InputLabel, Select, MenuItem
} from "@mui/material";

import {
    PieChart, Pie, Cell, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

import axios from "axios";

const DashboardAdmin = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    const [clientes, setClientes] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [municipios, setMunicipios] = useState([]);

    const [pagina, setPagina] = useState(1);
    const porPagina = 5;

    const [filtro, setFiltro] = useState("dia");

    const apiDashboard = import.meta.env.VITE_BACKEND_CONFIG;
    const apiCliente = import.meta.env.VITE_BACKEND_URL;
    const apiDepartamento = import.meta.env.VITE_BACKEND_CONFIG;
    const apiMunicipio = import.meta.env.VITE_BACKEND_CONFIG;

    // ------ FETCHS ------
    useEffect(() => {
        fetchDashboard();
        fetchClientes();
        fetchDepartamentos();
        fetchMunicipios();
    }, []);

    const fetchDashboard = async () => {
        try {
            const res = await axios.get(`${apiDashboard}/dashboard/admin`);
            setData(res.data.data);
        } catch (err) {
            console.error("Error dashboard admin:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchClientes = async () => {
        try {
            const res = await axios.get(`${apiCliente}/cliente`);
            setClientes(res.data.data);
        } catch (err) {
            console.error("Error clientes:", err);
        }
    };

    const fetchDepartamentos = async () => {
        try {
            const res = await axios.get(`${apiDepartamento}/config/departamento`);
            setDepartamentos(res.data.data);
        } catch (err) {
            console.error("Error departamentos:", err);
        }
    };

    const fetchMunicipios = async () => {
        try {
            const res = await axios.get(`${apiMunicipio}/config/municipio`);
            setMunicipios(res.data.data);
        } catch (err) {
            console.error("Error municipios:", err);
        }
    };

    // ------ FILTRO ------
    const filtrarVisitas = () => {
        if (!data || !data.ultimasVisitas) return [];

        const hoy = new Date();

        return data.ultimasVisitas.filter(v => {
            const fecha = new Date(v.fechaProgramada);

            if (filtro === "dia") {
                return (
                    fecha.getDate() === hoy.getDate() &&
                    fecha.getMonth() === hoy.getMonth() &&
                    fecha.getFullYear() === hoy.getFullYear()
                );
            }
            if (filtro === "mes") {
                return (
                    fecha.getMonth() === hoy.getMonth() &&
                    fecha.getFullYear() === hoy.getFullYear()
                );
            }
            if (filtro === "año") {
                return fecha.getFullYear() === hoy.getFullYear();
            }

            return true;
        });
    };

    const filtradas = filtrarVisitas();

    // PAGINACIÓN
    const inicio = (pagina - 1) * porPagina;
    const paginadas = filtradas.slice(inicio, inicio + porPagina);
    const totalPaginas = Math.ceil(filtradas.length / porPagina);

    // ------- GRAFICOS -------
    const estadosPie = [
        { name: "Registradas", value: data?.visitasPorEstado.registradas, color: "#1976d2" },
        { name: "Finalizadas", value: data?.visitasPorEstado.finalizadas, color: "#00C853" },
        { name: "Canceladas", value: data?.visitasPorEstado.canceladas, color: "#D32F2F" },
        { name: "Reprogramadas", value: data?.visitasPorEstado.reprogramadas, color: "#FFB300" }
    ];

    // Visitas por técnico
    const visitasTecnicoData =
        data?.visitasPorTecnico
            ? Object.entries(data.visitasPorTecnico).map(([id, total]) => ({
                tecnico: `${id}`,
                total
            }))
            : [];

    // Servicios
    const serviciosData =
        data?.servicios
            ? Object.entries(data.servicios).map(([id, total]) => ({
                servicio: `${id}`,
                total
            }))
            : [];

    // Departamentos
    const deptoData =
        data?.departamentosConteo
            ? Object.entries(data.departamentosConteo).map(([id, total]) => {
                const depto = departamentos.find(d => d.id == id);
                return {
                    departamento: depto ? depto.nombre : `Depto ${id}`,
                    total
                };
            })
            : [];

    if (loading || !data) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight="bold" mb={4}>Dashboard Administrador</Typography>

            <Grid container spacing={4}>

                {/* FILTRO */}
                <Grid item xs={12}>
                    <FormControl size="small" sx={{ width: 300, marginTop: 5 }}>
                        <InputLabel>Filtrar por</InputLabel>
                        <Select value={filtro} label="Filtrar por" onChange={(e) => setFiltro(e.target.value)}>
                            <MenuItem value="dia">Del Día</MenuItem>
                            <MenuItem value="mes">Del Mes</MenuItem>
                            <MenuItem value="año">Del Año</MenuItem>
                            <MenuItem value="todo">Todo</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                {/* KPIs */}
                <Grid item xs={12}>
                    <Grid container spacing={3}>
                        {[
                            { titulo: "Total Visitas", valor: data.totalVisitas, color: "#1976d2" },
                            { titulo: "Clientes", valor: data.totalClientes, color: "#0097A7" },
                            { titulo: "Empleados", valor: data.totalEmpleados, color: "#7B1FA2" },
                            { titulo: "Finalizadas", valor: data.visitasPorEstado.finalizadas, color: "#00C853" },
                        ].map((item, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <Paper
                                    sx={{
                                        p: 3,
                                        textAlign: "center",
                                        borderRadius: "20px",
                                        background: `linear-gradient(135deg, ${item.color}33, ${item.color}66)`,
                                        boxShadow: `0px 4px 15px ${item.color}55`,
                                    }}
                                >
                                    <Typography variant="h6">{item.titulo}</Typography>
                                    <Typography variant="h3" sx={{ mt: 1, fontWeight: "bold", color: item.color }}>
                                        {item.valor}
                                    </Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
                {/* GRAFICOS */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, borderRadius: "20px" }}>
                        <Typography variant="h6" textAlign="center" mb={2}>Visitas por Estado</Typography>
                        <PieChart width={270} height={200}>
                            <Pie data={estadosPie} dataKey="value" outerRadius={60} label>
                                {estadosPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, borderRadius: "20px" }}>
                        <Typography variant="h6" textAlign="center" mb={2}>Visitas por Técnico</Typography>
                        <BarChart width={250} height={200} data={visitasTecnicoData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="tecnico" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="total" fill="#1976d2" />
                        </BarChart>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, borderRadius: "20px" }}>
                        <Typography variant="h6" textAlign="center" mb={2}>Servicios más solicitados</Typography>
                        <BarChart width={250} height={200} data={serviciosData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="servicio" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="total" fill="#7B1FA2" />
                        </BarChart>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, borderRadius: "20px" }}>
                        <Typography variant="h6" textAlign="center" mb={2}>Departamentos más visitados</Typography>
                        <BarChart width={250} height={200} data={deptoData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="departamento" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="total" fill="#0097A7" />
                        </BarChart>
                    </Paper>
                </Grid>

                {/* TABLA */}
                <Grid item xs={12}>
                    <Typography variant="h6" mb={2}>Últimas Visitas</Typography>

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
                                    <TableCell sx={{ color: "#fff" }}>Servicio</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {paginadas.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">No hay datos</TableCell>
                                    </TableRow>
                                ) : (
                                    paginadas.map(v => {
                                        const cliente = clientes.find(c => c.id === v.idCliente);

                                        const depto = departamentos.find(d => d.id === cliente?.ubicacion?.idDepartamento);
                                        const muni = municipios.find(m => m.id === cliente?.ubicacion?.idMunicipio);

                                        const ubicacion = (depto && muni)
                                            ? `${depto.nombre}, ${muni.nombre}`
                                            : "No registrada";

                                        return (
                                            <TableRow key={v.id}>
                                                <TableCell>{v.id}</TableCell>
                                                <TableCell>
                                                    {cliente
                                                        ? `${cliente.nombre} ${cliente.apellido}`
                                                        : "Sin cliente"}
                                                </TableCell>
                                                <TableCell>{ubicacion}</TableCell>
                                                <TableCell>{new Date(v.fechaProgramada).toLocaleString()}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={v.estado?.tipo || "N/A"}
                                                        sx={{
                                                            color: "white",
                                                            backgroundColor:
                                                                v.estado?.tipo === "Finalizado" ? "green" :
                                                                    v.estado?.tipo === "Cancelada" ? "red" :
                                                                        v.estado?.tipo === "Reprogramada" ? "orange" :
                                                                            "gray",
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>{v.descripcion || "—"}</TableCell>
                                                <TableCell>{v.tipoServicio?.tipo}</TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box display="flex" justifyContent="center" py={2}>
                        <Pagination
                            count={totalPaginas}
                            page={pagina}
                            onChange={(e, value) => setPagina(value)}
                            color="primary"
                        />
                    </Box>
                </Grid>

            </Grid>
        </Box>
    );
};

export default DashboardAdmin;

