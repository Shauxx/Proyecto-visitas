import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Box,
    Typography,
    CircularProgress,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
} from "@mui/material";

const SupervisorDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [tecnicos, setTecnicos] = useState([]);
    const [visitas, setVisitas] = useState([]);
    const [clientes, setClientes] = useState([]);

    const BACKEND_USUARIO = import.meta.env.VITE_BACKEND_USUARIO;
    const BACKEND_VISITA = import.meta.env.VITE_BACKEND_VISITA;
    const BACKEND_CLIENTE = import.meta.env.VITE_BACKEND_URL; // clientes

    const token = localStorage.getItem("token");
    const decoded = token ? JSON.parse(atob(token.split(".")[1])) : null;

    const idRol = decoded?.idRol;
    const idEmpleado = decoded?.idEmpleado;

    // 👉 Función para formatear fecha
    const formatFecha = (f) => {
        try {
            const d = new Date(f);
            return (
                d.toLocaleDateString("es-GT") +
                " " +
                d.toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" })
            );
        } catch {
            return f;
        }
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                // 1️⃣ Datos del supervisor
                const supervisor = await axios.get(
                    `${BACKEND_USUARIO}/usuarios/empleado/${idEmpleado}`
                );
                const depSupervisor = supervisor.data.data.idDepartamento;

                // 2️⃣ Empleados
                const empleados = (
                    await axios.get(`${BACKEND_USUARIO}/usuarios/empleado`)
                ).data.data;

                // 3️⃣ Usuarios (para saber roles)
                const usuarios = (
                    await axios.get(`${BACKEND_USUARIO}/usuarios/usuario`)
                ).data.data;

                // 4️⃣ Combinar roles
                const empleadosConRol = empleados.map((emp) => {
                    const u = usuarios.find((x) => x.idEmpleado === emp.id);
                    return { ...emp, idRol: u?.idRol };
                });

                // 5️⃣ Filtrar técnicos del mismo departamento
                const tecnicosDep = empleadosConRol.filter(
                    (t) => t.idRol === 3 && t.idDepartamento === depSupervisor
                );

                setTecnicos(tecnicosDep);

                // 6️⃣ Obtener todas las visitas
                const visitasRes = await axios.get(`${BACKEND_VISITA}/visita`);
                const vData = visitasRes.data.data;

                // Filtrar solo estado (1 programada, 4 reprogramada)
                const tecnicosIDs = tecnicosDep.map((t) => t.id);
                const filtradas = vData.filter(
                    (v) =>
                        tecnicosIDs.includes(v.idTecnico) &&
                        (v.idEstado === 1 || v.idEstado === 4)
                );

                setVisitas(filtradas);

                // 7️⃣ Obtener clientes para mostrar nombre
                const clientesRes = await axios.get(`${BACKEND_CLIENTE}/cliente`);
                setClientes(clientesRes.data.data);

            } catch (e) {
                console.log("Error cargando dashboard:", e);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const getClienteNombre = (idCliente) => {
        const c = clientes.find((x) => x.id === idCliente);
        return c ? `${c.nombre} ${c.apellido}` : `Cliente #${idCliente}`;
    };

    if (loading)
        return (
            <Box sx={{ textAlign: "center", mt: 5 }}>
                <CircularProgress />
            </Box>
        );

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
                Agenda de Técnicos Supervisados
            </Typography>

            {tecnicos.length === 0 && (
                <Typography>No hay técnicos en tu departamento.</Typography>
            )}

            {tecnicos.map((tec) => (
                <Paper key={tec.id} sx={{ p: 2, mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        Técnico: {tec.nombre} {tec.apellido}
                    </Typography>

                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Cliente</TableCell>
                                <TableCell>Fecha Programada</TableCell>
                                <TableCell>Descripción</TableCell>
                                <TableCell>Estado</TableCell>
                                <TableCell>Tipo Servicio</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {visitas
                                .filter((v) => v.idTecnico === tec.id)
                                .map((v) => (
                                    <TableRow key={v.id}>
                                        <TableCell>{getClienteNombre(v.idCliente)}</TableCell>
                                        <TableCell>{formatFecha(v.fechaProgramada)}</TableCell>

                                        <TableCell>{v.descripcion || "— Sin descripción —"}</TableCell>

                                        <TableCell>
                                            {v.estado?.nombre || "— Sin estado —"}
                                        </TableCell>

                                        <TableCell>
                                            {v.tipoServicio?.nombre || "— Sin tipo —"}
                                        </TableCell>
                                    </TableRow>

                                ))}
                        </TableBody>
                    </Table>
                </Paper>
            ))}
        </Box>
    );
};

export default SupervisorDashboard;
