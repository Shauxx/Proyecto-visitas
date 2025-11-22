import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, TextField, Button, CircularProgress, Snackbar, Alert, MenuItem, Select, InputLabel, FormControl } from "@mui/material";

const Perfil = () => {
    const [empleado, setEmpleado] = useState(null);
    const [usuario, setUsuario] = useState(null);
    const [rol, setRol] = useState(null);
    const [rolesDisponibles, setRolesDisponibles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

    const BACKEND_USUARIO = import.meta.env.VITE_BACKEND_USUARIO;

    const token = localStorage.getItem("token");
    const decoded = token ? JSON.parse(atob(token.split(".")[1])) : null;
    const idEmpleado = decoded?.idEmpleado;
    const idUsuario = decoded?.id;
    const idRol = decoded?.idRol;

    useEffect(() => {
        const fetchPerfil = async () => {
            try {
                const [empleadoRes, usuarioRes, rolRes, rolesRes] = await Promise.all([
                    axios.get(`${BACKEND_USUARIO}/usuarios/empleado/${idEmpleado}`),
                    axios.get(`${BACKEND_USUARIO}/usuarios/usuario/${idUsuario}`),
                    axios.get(`${BACKEND_USUARIO}/usuarios/rol/${idRol}`),
                    axios.get(`${BACKEND_USUARIO}/usuarios/rol`)
                ]);

                setEmpleado(empleadoRes.data.data);

                const user = { ...usuarioRes.data.data };
                delete user.contra;
                setUsuario(user);

                setRol(rolRes.data.data);
                setRolesDisponibles(rolesRes.data.data);
            } catch (error) {
                console.error("Error cargando perfil:", error);
                setAlert({ open: true, message: "No se pudo cargar el perfil", severity: "error" });
            } finally {
                setLoading(false);
            }
        };

        if (idEmpleado && idUsuario && idRol) fetchPerfil();
    }, [idEmpleado, idUsuario, idRol]);

    const handleEmpleadoChange = (e) => {
        const { name, value } = e.target;
        setEmpleado({ ...empleado, [name]: value });
    };

    const handleUsuarioChange = (e) => {
        const { name, value } = e.target;
        setUsuario({ ...usuario, [name]: value });
    };

    const handleRolChange = (e) => {
        setUsuario({ ...usuario, idRol: e.target.value });
    };

    const handleActualizar = async () => {
        try {
            await axios.put(`${BACKEND_USUARIO}/usuarios/empleado/${idEmpleado}`, empleado, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const payloadUsuario = { usuario: usuario.usuario, idRol: usuario.idRol };

            if (usuario.contra && usuario.contra.trim() !== "") {
                payloadUsuario.contra = usuario.contra;
            }

            await axios.put(`${BACKEND_USUARIO}/usuarios/usuario/${idUsuario}`, payloadUsuario, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setUsuario({ ...usuario, contra: "" });
            setAlert({ open: true, message: "Perfil actualizado correctamente", severity: "success" });
        } catch (error) {
            console.error(error);
            setAlert({ open: true, message: "Error al actualizar el perfil", severity: "error" });
        }
    };

    if (loading)
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
                <CircularProgress />
            </Box>
        );

    if (!empleado || !usuario || !rol) return <div>No se pudo cargar el perfil</div>;

    return (
        <Box sx={{ p: 3, maxWidth: 700, margin: "0 auto" }}>
            <h2>Perfil del Usuario</h2>

            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <TextField label="Nombre" name="nombre" value={empleado.nombre} onChange={handleEmpleadoChange} fullWidth />
                <TextField label="Apellido" name="apellido" value={empleado.apellido} onChange={handleEmpleadoChange} fullWidth />
            </Box>

            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <TextField label="NIT" name="nit" value={empleado.nit} onChange={handleEmpleadoChange} fullWidth />
                <TextField label="DPI" name="dpi" value={empleado.dpi} onChange={handleEmpleadoChange} fullWidth />
                <TextField label="Correo" name="correo" value={empleado.correo} onChange={handleEmpleadoChange} fullWidth />
            </Box>

            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <TextField label="Usuario" name="usuario" value={usuario.usuario} onChange={handleUsuarioChange} fullWidth />
                <TextField
                    label="Nueva Contraseña"
                    name="contra"
                    value={usuario.contra || ""}
                    onChange={handleUsuarioChange}
                    type="password"
                    fullWidth
                    placeholder="Dejar vacío si no quieres cambiar"
                />
                <FormControl fullWidth>
                    <InputLabel id="rol-label">Rol</InputLabel>
                    <Select labelId="rol-label" value={usuario.idRol || rol.id} onChange={handleRolChange}>
                        {rolesDisponibles.map((r) => (
                            <MenuItem key={r.id} value={r.id}>
                                {r.nombre}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <Button variant="contained" color="primary" onClick={handleActualizar}>
                Guardar cambios
            </Button>

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
                    sx={{ width: "100%" }}
                >
                    {alert.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Perfil;
