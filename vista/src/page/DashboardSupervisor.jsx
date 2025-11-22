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

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from "recharts";

import axios from "axios";

const DashboardSupervisor = () => {
    const [filtro, setFiltro] = useState("dia");
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    const [pagina, setPagina] = useState(1);
    const porPagina = 5;

    const [tecnicos, setTecnicos] = useState([]);

    const apiDashboard = import.meta.env.VITE_BACKEND_CONFIG;
    const apiEmpleado = import.meta.env.VITE_BACKEND_USUARIO;


    // Obtener ID supervisor del token
    const token = localStorage.getItem("token");
    const decoded = JSON.parse(atob(token.split(".")[1]));
    const supervisorId = decoded.idEmpleado;

    // -- FETCHS --
    const fetchData = async () => {
        try {
            const res = await axios.get(`${apiDashboard}/dashboard/supervisor/${supervisorId}`);
            setData(res.data.data);
        } catch (err) {
            console.error("Error dashboard supervisor:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTecnicos = async () => {
        try {
            const res = await axios.get(`${apiEmpleado}/usuarios/empleado`);
            setTecnicos(res.data.data);
        } catch (err) {
            console.error("Error cargando técnicos:", err);
            setTecnicos([]); // evita undefined
        }
    };





    useEffect(() => {
        fetchData();
        fetchTecnicos();
    }, []);

    // FILTRO
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
    const visitasPaginadas = filtradas.slice(inicio, inicio + porPagina);
    const totalPaginas = Math.ceil(filtradas.length / porPagina);

    // KPIs FILTRADOS
    const finalizadasFiltradas = filtradas.filter(v => v.idEstado === 2).length;
    const canceladasFiltradas = filtradas.filter(v => v.idEstado === 3).length;
    const reprogramadasFiltradas = filtradas.filter(v => v.idEstado === 4).length;
    const registradasFiltradas = filtradas.filter(v => v.idEstado === 1).length;

    // PIE CHART
    const pieData = [
        { name: "Finalizadas", value: finalizadasFiltradas, color: "#00C853" },
        { name: "Reprogramadas", value: reprogramadasFiltradas, color: "#FFB300" },
        { name: "Canceladas", value: canceladasFiltradas, color: "#D32F2F" },
        { name: "Registradas", value: registradasFiltradas, color: "#1976d2" }
    ];

    // VISITAS POR TÉCNICO
    const agrupadas = {};

    filtradas.forEach(v => {
        agrupadas[v.idTecnico] = (agrupadas[v.idTecnico] || 0) + 1;
    });

    const visitasPorTecnico = Object.entries(agrupadas).map(([id, total]) => {
        const tecnico = tecnicos?.find(t => Number(t.id) === Number(id));

        return {
            tecnicoId: Number(id),
            nombre: tecnico ? `${tecnico.nombre} ${tecnico.apellido}` : `Técnico ${id}`,
            total
        };
    });


    if (loading || !data) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight="bold" mb={4}>
                Dashboard Supervisor
            </Typography>

            <Grid container spacing={4}>

                {/* FILTRO */}
                <Grid item xs={12} sx={{ display: "flex", justifyContent: "center" }}>
                    <FormControl size="small" sx={{ width: 300, marginTop: 5 }}>
                        <InputLabel>Filtrar por</InputLabel>
                        <Select
                            value={filtro}
                            label="Filtrar por"
                            onChange={(e) => setFiltro(e.target.value)}
                        >
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
                            { titulo: "Visitas supervisadas", valor: filtradas.length, color: "#4A90E2" },
                            { titulo: "Técnicos asignados", valor: data.tecnicosSupervisados, color: "#673AB7" },
                            { titulo: "Finalizadas", valor: finalizadasFiltradas, color: "#00C853" },
                            { titulo: "Canceladas", valor: canceladasFiltradas, color: "#D32F2F" },
                        ].map((item, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
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
                    <Paper sx={{ p: 3, borderRadius: "20px" }}>
                        <Typography variant="h6" textAlign="center" mb={2}>
                            Estados de Visitas
                        </Typography>
                        <PieChart width={550} height={250}>
                            <Pie
                                data={pieData}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={110}
                                label
                            >
                                {pieData.map((entry, i) => (
                                    <Cell key={i} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: "20px" }}>
                        <Typography variant="h6" textAlign="center" mb={2}>
                            Visitas por Técnico
                        </Typography>

                        {visitasPorTecnico.length > 0 ? (
                            <BarChart width={550} height={250} data={visitasPorTecnico}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="nombre" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="total" fill="#1976d2" />
                            </BarChart>
                        ) : (
                            <Typography textAlign="center">No hay datos en este periodo.</Typography>
                        )}
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
                                {visitasPaginadas.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">No hay datos</TableCell>
                                    </TableRow>
                                ) : (
                                    visitasPaginadas.map((v) => {

                                        const ubicacion = v.ubicacion || "No registrada";


                                        return (
                                            <TableRow key={v.id}>
                                                <TableCell>{v.id}</TableCell>

                                                <TableCell>
                                                    {v.clienteNombre || "Sin cliente"}

                                                </TableCell>

                                                <TableCell>{ubicacion}</TableCell>

                                                <TableCell>
                                                    {new Date(v.fechaProgramada).toLocaleString()}
                                                </TableCell>

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

export default DashboardSupervisor;
