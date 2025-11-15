import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Typography,
    CircularProgress,
    Tooltip, Grid, TextField,
    Collapse,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import axios from "axios";

const VisitasPage = () => {
    const [visitas, setVisitas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVisita, setSelectedVisita] = useState(null);
    const [ubicacionCliente, setUbicacionCliente] = useState(null);
    const [departamento, setDepartamento] = useState("");
    const [municipio, setMunicipio] = useState("");
    const [tecnicoUbicacion, setTecnicoUbicacion] = useState(null);
    const [registro, setRegistro] = useState({
        horaingreso: "",
        horaegreso: "",
        observaciones: "",
        recomendaciones: ""
    });


    const token = localStorage.getItem("token");
    const apiVisita = import.meta.env.VITE_BACKEND_VISITA;
    const apiCliente = import.meta.env.VITE_BACKEND_URL;
    const apiConfig = import.meta.env.VITE_BACKEND_CONFIG;

    // 📍 Cargar visitas solo del técnico logueado
    const fetchVisitas = async () => {
        try {
            setLoading(true);
            const decoded = JSON.parse(atob(token.split(".")[1]));
            const tecnicoId = decoded.idEmpleado || decoded.id;

            const res = await axios.get(`${apiVisita}/visita`);
            const visitasData = res.data.data || [];

            // Traer clientes
            const clientesRes = await axios.get(`${apiCliente}/cliente`);
            const clientesData = clientesRes.data.data || [];

            const visitasTecnico = visitasData
                .filter((v) => v.idTecnico === tecnicoId)
                .map((v) => {
                    const cliente = clientesData.find((c) => c.id === v.idCliente);
                    return {
                        ...v,
                        clienteNombre: cliente ? `${cliente.nombre} ${cliente.apellido}` : "",
                        idUbicacion: cliente ? cliente.idUbicacion : null,
                    };
                });

            setVisitas(visitasTecnico);
        } catch (error) {
            console.error("Error al cargar visitas:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGuardarRegistro = async () => {
        if (!selectedVisita) return;

        try {
            await axios.post(`${apiVisita}/visita/registroVisitas`, {
                ...registro,
                creadoPor: selectedVisita.idTecnico,
                actualizadoPor: selectedVisita.idTecnico
            });

            alert("Registro de visita guardado correctamente.");
            setRegistro({
                horaingreso: "",
                horaegreso: "",
                observaciones: "",
                recomendaciones: ""
            });
            fetchVisitas(); // actualizar lista si quieres
        } catch (error) {
            console.error("Error al guardar registro:", error);
            alert("Error al guardar registro.");
        }
    };


    // 📍 Cargar ubicación del cliente y nombres de departamento y municipio
    const fetchUbicacionCliente = async (idUbicacion) => {
        try {
            const res = await axios.get(`${apiCliente}/cliente/ubicacion/${idUbicacion}`);
            const ubic = res.data.data;
            setUbicacionCliente(ubic);

            if (ubic?.idDepartamento) {
                const depRes = await axios.get(`${apiConfig}/departamento/${ubic.idDepartamento}`);
                setDepartamento(depRes.data.data.nombre);
            }
            if (ubic?.idMunicipio) {
                const munRes = await axios.get(`${apiConfig}/municipio/${ubic.idMunicipio}`);
                setMunicipio(munRes.data.data.nombre);
            }
        } catch (error) {
            console.error("Error al cargar ubicación del cliente:", error);
        }
    };

    // 📍 Obtener ubicación del técnico
    const getTecnicoUbicacion = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setTecnicoUbicacion({
                        lat: pos.coords.latitude,
                        lon: pos.coords.longitude,
                    });
                },
                (err) => {
                    console.error("Error al obtener ubicación del técnico:", err);
                }
            );
        }
    };

    useEffect(() => {
        fetchVisitas();
        getTecnicoUbicacion();
    }, []);

    // Abrir detalle de visita
    const handleSelectVisita = (visita) => {
        setSelectedVisita(visita);
        if (visita.idUbicacion) fetchUbicacionCliente(visita.idUbicacion);
    };

    // Abrir Google Maps / Waze
    const handleIrACliente = () => {
        if (!tecnicoUbicacion || !ubicacionCliente) return;
        const url = `https://www.google.com/maps/dir/?api=1&origin=${tecnicoUbicacion.lat},${tecnicoUbicacion.lon}&destination=${ubicacionCliente.latitud},${ubicacionCliente.longitud}&travelmode=driving`;
        window.open(url, "_blank");
    };

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
                Visitas Asignadas
            </Typography>

            {loading ? (
                <CircularProgress />
            ) : visitas.length === 0 ? (
                <Typography>No tienes visitas asignadas.</Typography>
            ) : (
                visitas.map((v) => (
                    <Box
                        key={v.id}
                        sx={{
                            border: "1px solid #ccc",
                            borderRadius: 2,
                            p: 2,
                            mb: 2,
                            cursor: "pointer",
                        }}
                        onClick={() => handleSelectVisita(v)}
                    >
                        <Typography><b>ID Visita:</b> {v.id}</Typography>
                        <Typography><b>Cliente:</b> {v.clienteNombre}</Typography>
                        <Typography>
                            <b>Fecha Programada:</b>{" "}
                            {new Date(v.fechaProgramada).toLocaleString()}
                        </Typography>
                        <Typography><b>Tipo Servicio:</b> {v.tipoServicio?.tipo || "Sin asignar"}</Typography>

                        {/* Detalles colapsables */}
                        <Collapse in={selectedVisita?.id === v.id}>
                            <Box sx={{ mt: 2, p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
                                {ubicacionCliente ? (
                                    <>
                                        {/* Ubicación del cliente */}
                                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                            <b>Ubicación Cliente:</b> {departamento}, {municipio}
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleIrACliente}
                                            sx={{ mb: 2 }}
                                        >
                                            Cómo llegar
                                        </Button>

                                        {/* Formulario de registro de visita */}
                                        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: "bold" }}>
                                            Registrar visita:
                                        </Typography>

                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    label="Hora de ingreso"
                                                    type="datetime-local"
                                                    value={registro.horaingreso}
                                                    onChange={(e) =>
                                                        setRegistro({ ...registro, horaingreso: e.target.value })
                                                    }
                                                    fullWidth
                                                    InputLabelProps={{ shrink: true }}
                                                />
                                            </Grid>

                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    label="Hora de egreso"
                                                    type="datetime-local"
                                                    value={registro.horaegreso}
                                                    onChange={(e) =>
                                                        setRegistro({ ...registro, horaegreso: e.target.value })
                                                    }
                                                    fullWidth
                                                    InputLabelProps={{ shrink: true }}
                                                />
                                            </Grid>

                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    label="Observaciones"
                                                    multiline
                                                    rows={3}
                                                    value={registro.observaciones}
                                                    onChange={(e) =>
                                                        setRegistro({ ...registro, observaciones: e.target.value })
                                                    }
                                                    fullWidth
                                                />
                                            </Grid>

                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    label="Recomendaciones"
                                                    multiline
                                                    rows={3}
                                                    value={registro.recomendaciones}
                                                    onChange={(e) =>
                                                        setRegistro({ ...registro, recomendaciones: e.target.value })
                                                    }
                                                    fullWidth
                                                />
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    onClick={handleGuardarRegistro}
                                                >
                                                    Guardar Registro
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </>
                                ) : (
                                    <Typography>Cargando ubicación...</Typography>
                                )}
                            </Box>

                        </Collapse>


                    </Box>
                ))
            )}
        </Box>
    );
};

export default VisitasPage;
