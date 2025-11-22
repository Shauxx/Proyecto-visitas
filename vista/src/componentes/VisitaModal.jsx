//vista\src\componentes\VisitaModal.jsx
import React, { useState, useEffect } from "react";
import {
    Modal,
    Box,
    Typography,
    Grid,
    TextField,
    Button,
    MenuItem,
    Alert,
} from "@mui/material";
import axios from "axios";

const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 500,
    bgcolor: "background.paper",
    borderRadius: 3,
    boxShadow: 24,
    p: 4,
};

const VisitaModal = ({
    open,
    onClose,
    fetchVisitas,
    editData,
    registrarAuditoria,
    showAlert,
}) => {
    const [formData, setFormData] = useState({
        idCliente: "",
        idSupervisor: "",
        idTecnico: "",
        fechaProgramada: "",
        idTipoServicio: "",
        idEstado: 1,
        descripcion: "",
    });
    const [clientes, setClientes] = useState([]);
    const [supervisores, setSupervisores] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [tiposServicio, setTiposServicio] = useState([]);
    const [estados, setEstados] = useState([]); // 👈 añadimos estados
    const [errorMsg, setErrorMsg] = useState("");

    const token = localStorage.getItem("token");
    const apiVisita = import.meta.env.VITE_BACKEND_VISITA;
    const apiUsuario = import.meta.env.VITE_BACKEND_USUARIO;
    const apiCliente = import.meta.env.VITE_BACKEND_URL;

    // 🔄 Cargar datos cuando se edita o se abre nuevo
    useEffect(() => {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        const userRol = decoded.idRol;
        const userEmpleadoId = decoded.idEmpleado;

        if (editData) {
            setFormData({
                idCliente: editData.idCliente || "",
                idSupervisor: editData.idSupervisor || "",
                idTecnico: editData.idTecnico || "",
                fechaProgramada: editData.fechaProgramada
                    ? editData.fechaProgramada.slice(0, 16)
                    : "",
                idTipoServicio:
                    editData.idTipoServicio || editData.tipoServicio?.id || "",
                idEstado: 1,
                descripcion: editData.descripcion || "",
            });
        } else {
            setFormData({
                idCliente: "",
                idSupervisor: userRol === 2 ? userEmpleadoId : "", // 🔥 supervisor auto-asignado
                idTecnico: "",
                fechaProgramada: "",
                idTipoServicio: "",
                idEstado: 1,
            });
        }
    }, [editData]);


    // 🧾 Cargar selects
    const loadSelects = async () => {
        try {
            const [empleadosRes, usuariosRes, clientesRes, tiposRes, estadosRes] = await Promise.all([
                axios.get(`${apiUsuario}/usuarios/empleado`),
                axios.get(`${apiUsuario}/usuarios/usuario`),
                axios.get(`${apiCliente}/cliente`),
                axios.get(`${apiVisita}/tipo/tipoServicio`),
                axios.get(`${apiVisita}/visita/estado`), // 👈 nuevo endpoint
            ]);

            const empleados = empleadosRes.data.data || [];
            const usuarios = usuariosRes.data.data || [];
            const clientes = clientesRes.data.data || [];
            const tipos = tiposRes.data.data || [];
            const estadosData = estadosRes.data.data || [];

            const supervisoresIds = usuarios
                .filter((u) => u.idRol === 2)
                .map((u) => u.idEmpleado);
            const tecnicosIds = usuarios
                .filter((u) => u.idRol === 3)
                .map((u) => u.idEmpleado);

            setClientes(clientes);
            const decoded = JSON.parse(atob(token.split(".")[1]));
            const userRol = decoded.idRol;
            const userEmpleadoId = decoded.idEmpleado;

            // Supervisores normales (igual que antes)
            setSupervisores(empleados.filter((e) => supervisoresIds.includes(e.id)));

            // Técnicos filtrados
            let tecnicosFiltrados = empleados.filter((e) => tecnicosIds.includes(e.id));

            if (userRol === 2) {
                // Si es SUPERVISOR, obtener su departamento
                const supervisor = empleados.find((e) => e.id === userEmpleadoId);

                if (supervisor) {
                    tecnicosFiltrados = tecnicosFiltrados.filter(
                        (tec) => tec.idDepartamento === supervisor.idDepartamento
                    );
                }
            }

            setTecnicos(tecnicosFiltrados);
            setTiposServicio(tipos);
            setEstados(estadosData);
        } catch (error) {
            console.error("Error al cargar selects:", error);
        }
    };

    useEffect(() => {
        loadSelects();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            setErrorMsg("");
            const decoded = JSON.parse(atob(token.split(".")[1]));
            const userId = decoded.id || decoded.userId || decoded.data?.id;

            const payload = {
                idCliente: formData.idCliente,
                idSupervisor: formData.idSupervisor,
                idTecnico: formData.idTecnico,
                fechaProgramada: formData.fechaProgramada,
                idTipoServicio: formData.idTipoServicio,
                descripcion: formData.descripcion,
                idEstado: 1,
                creadoPor: userId,
                actualizadoPor: userId,
            };

            if (editData) {
                await axios.put(`${apiVisita}/visita/${editData.id}`, payload);
                await registrarAuditoria(`Editó la visita ID: ${editData.id}`);
                showAlert("Visita actualizada correctamente", "info");
            } else {
                const res = await axios
                    .post(`${apiVisita}/visita`, payload)
                    .catch((err) => err.response);

                if (res && res.status === 400) {
                    setErrorMsg(
                        res.data.message ||
                        "El técnico ya tiene una visita asignada en esa hora."
                    );
                    showAlert("El técnico ya tiene una visita asignada en esa hora.", "success");
                    return;
                }

                await registrarAuditoria("Creó una nueva visita");
                showAlert("Visita creada correctamente", "success");
            }

            fetchVisitas();
            onClose();
        } catch (error) {
            console.error("Error al guardar visita:", error);
            setErrorMsg("Ocurrió un error al guardar la visita.");
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={modalStyle}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                    {editData ? "Editar Visita" : "Nueva Visita"}
                </Typography>

                {errorMsg && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {errorMsg}
                    </Alert>
                )}

                <Grid container spacing={2}>
                    {/* Cliente */}
                    <Grid item xs={12}>
                        <TextField
                            select
                            fullWidth
                            label="Cliente"
                            name="idCliente"
                            value={formData.idCliente}
                            onChange={handleChange}
                            sx={{ minWidth: 200 }}
                        >
                            {clientes.map((c) => (
                                <MenuItem key={c.id} value={c.id}>
                                    {c.nombre || c.razonSocial || `Cliente ${c.id}`}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Supervisor */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            select
                            fullWidth
                            label="Supervisor"
                            name="idSupervisor"
                            value={formData.idSupervisor}
                            onChange={handleChange}
                            disabled={JSON.parse(atob(token.split(".")[1])).idRol === 2}
                            sx={{ minWidth: 200 }}
                        >

                            {supervisores.map((s) => (
                                <MenuItem key={s.id} value={s.id}>
                                    {s.nombre} {s.apellido}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Técnico */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            select
                            fullWidth
                            label="Técnico"
                            name="idTecnico"
                            value={formData.idTecnico}
                            onChange={handleChange}
                            sx={{ minWidth: 200 }}
                        >
                            {tecnicos.map((t) => (
                                <MenuItem key={t.id} value={t.id}>
                                    {t.nombre} {t.apellido}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Tipo Servicio */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            select
                            fullWidth
                            label="Tipo de Servicio"
                            name="idTipoServicio"
                            value={formData.idTipoServicio}
                            onChange={handleChange}
                            sx={{ minWidth: 200 }}
                        >
                            {tiposServicio.map((ts) => (
                                <MenuItem key={ts.id} value={ts.id}>
                                    {typeof ts.tipo === "string" ? ts.tipo : ts.tipo?.nombre || `Tipo ${ts.id}`}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Descripción */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Descripción"
                            name="descripcion"
                            value={formData.descripcion || ""}
                            onChange={handleChange}
                            multiline
                            rows={2}
                        />
                    </Grid>


                    {/* Fecha */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            type="datetime-local"
                            label="Fecha Programada"
                            name="fechaProgramada"
                            value={formData.fechaProgramada}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                </Grid>


                <Box sx={{ mt: 3, textAlign: "right" }}>
                    <Button onClick={onClose} variant="outlined" sx={{ mr: 1 }}>
                        Cancelar
                    </Button>
                    <Button variant="contained" onClick={handleSubmit}>
                        {editData ? "Actualizar" : "Guardar"}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default VisitaModal;
