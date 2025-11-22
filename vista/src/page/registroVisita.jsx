// vista\src\page\registroVisita.jsx
import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Typography,
    CircularProgress,
    Grid,
    TextField,
    Collapse,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Modal
} from "@mui/material";
import axios from "axios";
import emailjs from "emailjs-com";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


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
    const [nuevaFecha, setNuevaFecha] = useState("");

    // Modal de selección de estado
    const [modalOpen, setModalOpen] = useState(false);
    const [estadoSeleccionado, setEstadoSeleccionado] = useState(null);
    const [fechaReprogramacion, setFechaReprogramacion] = useState("");

    const token = localStorage.getItem("token");
    const apiVisita = import.meta.env.VITE_BACKEND_VISITA;
    const apiCliente = import.meta.env.VITE_BACKEND_URL;
    const apiConfig = import.meta.env.VITE_BACKEND_CONFIG;

    // Cargar visitas
    const fetchVisitas = async () => {
        try {
            setLoading(true);
            const decoded = JSON.parse(atob(token.split(".")[1]));
            const tecnicoId = decoded.idEmpleado || decoded.id;

            const res = await axios.get(`${apiVisita}/visita`);
            const visitasData = res.data.data || [];

            const clientesRes = await axios.get(`${apiCliente}/cliente`);
            const clientesData = clientesRes.data.data || [];

            const visitasTecnico = visitasData
                .filter((v) =>
                    v.idTecnico === tecnicoId &&
                    (v.idEstado === 1 || v.idEstado === 4)
                )
                .map((v) => {
                    const cliente = clientesData.find((c) => c.id === v.idCliente);
                    return {
                        ...v,
                        clienteNombre: cliente ? `${cliente.nombre} ${cliente.apellido}` : "",
                        clienteCorreo: cliente ? cliente.correo : "",
                        idUbicacion: cliente ? cliente.idUbicacion : null,
                        fechaProgramadaObj: v.fechaProgramada ? new Date(v.fechaProgramada) : null
                    };
                })
                .sort((a, b) => (a.fechaProgramadaObj || 0) - (b.fechaProgramadaObj || 0));

            setVisitas(visitasTecnico);
        } catch (error) {
            console.error("Error al cargar visitas:", error);
        } finally {
            setLoading(false);
        }
    };

    const enviarCorreoRapido = (correo, nombreCliente, mensajeFinal, asunto) => {
        emailjs.send(
            "service_qhqfaud",
            "template_c8zv1xd",
            {
                email: correo,
                nombre: nombreCliente,
                asunto: asunto,
                mensajeFinal: mensajeFinal
            },
            "deDS2KHwK1fKhHsMy"
        )
            .then(res => console.log("📧 Correo enviado!", res))
            .catch(err => console.error("❌ Error enviando correo:", err));
    };

    // Abrir modal al guardar
    const handleOpenModal = () => setModalOpen(true);
    const handleCloseModal = () => {
        setModalOpen(false);
        setEstadoSeleccionado(null);
        setFechaReprogramacion("");
    };

    // Guardar registro + cambio de estado
    const handleConfirmarRegistro = async () => {
        if (!selectedVisita) return;

        // Validar pendiente
        if (estadoSeleccionado === 4 && !fechaReprogramacion) {
            alert("Seleccione la fecha y hora para reprogramar.");
            return;
        }

        try {
            // 1️⃣ Guardar registro
            await axios.post(`${apiVisita}/visita/registroVisitas`, {
                ...registro,
                creadoPor: selectedVisita.idTecnico,
                actualizadoPor: selectedVisita.idTecnico
            });

            // 2️⃣ Reprogramar si pendiente
            if (estadoSeleccionado === 4) {
                await axios.put(`${apiVisita}/visita/reprogramar/${selectedVisita.id}`, {
                    fechaProgramada: fechaReprogramacion
                });
            }

            // 3️⃣ Cambiar estado
            await cambiarEstado(estadoSeleccionado, fechaReprogramacion);

            alert("Registro guardado correctamente.");
            handleCloseModal();
            setRegistro({
                horaingreso: "",
                horaegreso: "",
                observaciones: "",
                recomendaciones: ""
            });
            fetchVisitas();
        } catch (error) {
            console.error("Error al guardar registro:", error);
            alert("Error al guardar registro.");
        }
    };

    const handleGuardarRegistro = () => {
        handleOpenModal();
    };

    const fetchUbicacionCliente = async (idUbicacion) => {
        try {
            const res = await axios.get(`${apiCliente}/cliente/ubicacion/${idUbicacion}`);
            const ubic = res.data.data;
            setUbicacionCliente(ubic);

            if (ubic?.idDepartamento) {
                const depRes = await axios.get(`${apiConfig}/config/departamento/${ubic.idDepartamento}`);
                setDepartamento(depRes.data.data.nombre);
            }
            if (ubic?.idMunicipio) {
                const munRes = await axios.get(`${apiConfig}/config/municipio/${ubic.idMunicipio}`);
                setMunicipio(munRes.data.data.nombre);
            }
        } catch (error) {
            console.error("Error al cargar ubicación del cliente:", error);
        }
    };

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

    const handleSelectVisita = (visita) => {
        setSelectedVisita(visita);
        if (visita.idUbicacion) fetchUbicacionCliente(visita.idUbicacion);
    };

    const handleIrACliente = () => {
        if (!tecnicoUbicacion || !ubicacionCliente) return;
        const url = `https://www.google.com/maps/dir/?api=1&origin=${tecnicoUbicacion.lat},${tecnicoUbicacion.lon}&destination=${ubicacionCliente.latitud},${ubicacionCliente.longitud}&travelmode=driving`;
        window.open(url, "_blank");
    };

    const cambiarEstado = async (nuevoEstado, fecha = null) => {
        if (!selectedVisita) return;
        try {
            const resp = await axios.put(
                `${apiVisita}/visita/estados/visit/${selectedVisita.id}`,
                {
                    idEstado: nuevoEstado,
                    observaciones: registro.observaciones,
                    motivo: registro.recomendaciones
                }
            );

            setSelectedVisita(resp.data.data);
            await fetchVisitas();

            // Seleccionar plantilla según estado
            let plantillaId;
            switch (nuevoEstado) {
                case 2: plantillaId = 1; break; // Finalizada
                case 3: plantillaId = 2; break; // Cancelada
                case 4: plantillaId = 3; break; // Reprogramada
                default: plantillaId = 1;
            }

            const plantilla = await obtenerPlantilla(plantillaId);
            if (!plantilla) return;

            // Variables para reemplazar en la plantilla
            let variables = {
                nombre: selectedVisita.clienteNombre
            };

            if (nuevoEstado === 2) {
                // Finalizada
                variables.fecha = new Date().toLocaleDateString();
                variables.recomendacion = registro.recomendaciones?.trim() || "Sin recomendaciones.";

            } else if (nuevoEstado === 3) {
                // Cancelada
                variables.fecha = fecha || nuevaFecha || "Sin fecha";

            } else if (nuevoEstado === 4) {
                // Reprogramada
                variables.fecha = fecha || fechaReprogramacion || nuevaFecha || "Sin fecha";
            }

            // Renderizar plantilla con las variables
            const mensajeFinal = renderizarPlantilla(plantilla.cuerpo, variables);

            // Enviar correo
            enviarCorreoRapido(
                selectedVisita.clienteCorreo,
                selectedVisita.clienteNombre,
                mensajeFinal,
                plantilla.asunto
            );

            alert("Estado actualizado correctamente.");
        } catch (error) {
            console.error("Error al cambiar estado:", error);
            alert("Error al cambiar estado.");
        }
    };


    const reprogramarVisita = async () => {
        try {
            await axios.put(`${apiVisita}/visita/reprogramar/${selectedVisita.id}`, {
                fechaProgramada: nuevaFecha
            });
            alert("Visita reprogramada.");
            fetchVisitas();
        } catch (error) {
            console.error("Error al reprogramar:", error);
            alert("Error al reprogramar.");
        }
    };

    const obtenerPlantilla = async (id) => {
        try {
            const res = await axios.get(`${apiConfig}/config/plantilla/${id}`);
            return res.data.data;
        } catch (error) {
            console.error("Error al obtener plantilla:", error);
            return null;
        }
    };

    const renderizarPlantilla = (texto, variables) => {
        return texto.replace(/{{(.*?)}}/g, (_, key) => variables[key] || "");
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const visitasBoxes = visitas.filter(v => {
        if (!v.fechaProgramadaObj) return false;
        const fecha = new Date(v.fechaProgramadaObj);
        fecha.setHours(0, 0, 0, 0);
        return fecha <= today;
    });

    const visitasTabla = visitas.filter(v => {
        if (!v.fechaProgramadaObj) return false;
        const fecha = new Date(v.fechaProgramadaObj);
        fecha.setHours(0, 0, 0, 0);
        return fecha > today;
    });

    const generarPDF = () => {
        const doc = new jsPDF("landscape"); // horizontal

        // 🔹 Encabezado
        doc.setFontSize(18);
        doc.text("SkyNet S.A.", 14, 15);

        doc.setFontSize(14);
        doc.text("Reporte de Próximas Visitas", 14, 25);

        // 🔹 Columnas
        const columnas = [
            "ID Visita",
            "Cliente",
            "Fecha Programada",
            "Tipo de Servicio"
        ];

        // 🔹 Filas (solo visitas futuras)
        const filas = visitasTabla.map((v) => [
            v.id,
            v.clienteNombre,
            v.fechaProgramadaObj?.toLocaleString(),
            v.tipoServicio?.tipo || "Sin asignar"
        ]);

        autoTable(doc, {
            startY: 35,
            head: [columnas],
            body: filas,
            theme: "grid",
            headStyles: {
                fillColor: [25, 118, 210],
                textColor: 255
            },
            styles: {
                fontSize: 10
            },
            columnStyles: {
                1: { cellWidth: 60 },
                2: { cellWidth: 50 },
                3: { cellWidth: 55 }
            }
        });

        doc.save("Reporte_Proximas_Visitas.pdf");
    };


    return (
        <Box sx={{ p: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                    Visitas Asignadas
                </Typography>

                <Button variant="outlined" color="secondary" onClick={generarPDF}>
                    Descargar PDF
                </Button>
            </Box>


            {loading ? (
                <CircularProgress />
            ) : visitasBoxes.length === 0 ? (
                <Typography>No tienes visitas asignadas.</Typography>
            ) : (
                visitasBoxes.map((v) => {
                    const atrasada = v.fechaProgramadaObj < today;

                    return (
                        <Box
                            key={v.id}
                            sx={{
                                border: "1px solid #ccc",
                                borderRadius: 2,
                                p: 2,
                                mb: 2,
                                cursor: "pointer",
                                backgroundColor: atrasada ? "#ff9a3b41" : "#E3F2FD"
                            }}
                            onClick={() => handleSelectVisita(v)}
                        >
                            <Typography><b>ID Visita:</b> {v.id}</Typography>
                            <Typography><b>Cliente:</b> {v.clienteNombre}</Typography>
                            <Typography><b>Fecha Programada:</b> {v.fechaProgramadaObj.toLocaleString()}</Typography>
                            <Typography><b>Tipo Servicio:</b> {v.tipoServicio?.tipo || "Sin asignar"}</Typography>
                            <Typography><b>Descripción:</b> {v.descripcion || "—"}</Typography>

                            <Collapse in={selectedVisita?.id === v.id}>
                                <Box sx={{ mt: 2, p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
                                    {ubicacionCliente ? (
                                        <>
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
                                                        onClick={handleGuardarRegistro} // abre modal
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
                    );
                })
            )}

            {/* Tabla con visitas futuras */}
            <Typography variant="h5" sx={{ mt: 4, mb: 2, fontWeight: "bold" }}>
                Próximas Visitas
            </Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{
                            backgroundColor: "#1976d2",
                            color: "#fff",
                            fontWeight: "bold",
                            textAlign: "center",
                        }}>
                            <TableCell sx={{ color: "#fff", }}>ID Visita</TableCell>
                            <TableCell sx={{ color: "#fff", }}>Cliente</TableCell>
                            <TableCell sx={{ color: "#fff", }}>Fecha Programada</TableCell>
                            <TableCell sx={{ color: "#fff" }}>Descripción</TableCell>
                            <TableCell sx={{ color: "#fff", }}>Tipo Servicio</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {visitasTabla.map((v) => (
                            <TableRow key={v.id}>
                                <TableCell>{v.id}</TableCell>
                                <TableCell>{v.clienteNombre}</TableCell>
                                <TableCell>{v.fechaProgramadaObj.toLocaleString()}</TableCell>
                                <TableCell>{v.descripcion || "—"}</TableCell>
                                <TableCell>{v.tipoServicio?.tipo || "Sin asignar"}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* --- Modal de selección de estado --- */}
            <Modal open={modalOpen} onClose={handleCloseModal}>
                <Box sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 380,
                    bgcolor: "background.paper",
                    borderRadius: 2,
                    p: 4
                }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Seleccione el estado de la visita
                    </Typography>

                    {/* Selector simple */}
                    <TextField
                        select
                        fullWidth
                        label="Estado"
                        value={estadoSeleccionado || ""}
                        onChange={(e) => setEstadoSeleccionado(Number(e.target.value))}
                        SelectProps={{ native: true }}
                    >
                        <option value="">Seleccione...</option>
                        <option value={2}>Finalizar visita</option>
                        <option value={3}>Cancelar visita</option>
                        <option value={4}>Marcar pendiente</option>
                    </TextField>

                    {/* Solo mostrar si es "pendiente" */}
                    {estadoSeleccionado === 4 && (
                        <TextField
                            type="datetime-local"
                            fullWidth
                            sx={{ mt: 2 }}
                            value={fechaReprogramacion}
                            onChange={(e) => setFechaReprogramacion(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    )}

                    <Button
                        variant="contained"
                        sx={{ mt: 3 }}
                        fullWidth
                        onClick={handleConfirmarRegistro}
                        disabled={!estadoSeleccionado}
                    >
                        Confirmar
                    </Button>
                </Box>
            </Modal>

        </Box>
    );
};

export default VisitasPage;
