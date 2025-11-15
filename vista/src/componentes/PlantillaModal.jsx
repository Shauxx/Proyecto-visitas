import React, { useState, useEffect } from "react";
import {
    Modal,
    Box,
    Typography,
    TextField,
    Button,
    Grid,
} from "@mui/material";

const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: 700,
    bgcolor: "background.paper",
    boxShadow: 24,
    borderRadius: 3,
    p: 4,
};

const PlantillaModal = ({ open, onClose, initialData, onSubmit }) => {
    const [formData, setFormData] = useState({
        nombre: "",
        asunto: "",
        cuerpo: "",
    });

    useEffect(() => {
        if (initialData) setFormData(initialData);
        else setFormData({ nombre: "", asunto: "", cuerpo: "" });
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (!formData.nombre || !formData.asunto || !formData.cuerpo.trim()) {
            alert("Todos los campos son obligatorios");
            return;
        }
        onSubmit(formData);
        onClose();
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={modalStyle}>
                <Typography
                    variant="h6"
                    sx={{
                        mb: 3,
                        textAlign: "center",
                        fontWeight: "bold",
                        color: "#1976d2",
                    }}
                >
                    {initialData ? "Editar Plantilla" : "Crear Plantilla"}
                </Typography>

                {/* Primera fila: dos campos lado a lado */}
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Nombre de la Plantilla"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Asunto del Correo"
                            name="asunto"
                            value={formData.asunto}
                            onChange={handleChange}
                        />
                    </Grid>
                </Grid>

                {/* Segunda fila: fuera del grid, ocupa todo el ancho */}
                <TextField
                    fullWidth
                    multiline
                    minRows={8}
                    label="Cuerpo del Correo (puede usar variables como {{nombre}} o {{fecha}})"
                    name="cuerpo"
                    value={formData.cuerpo}
                    onChange={handleChange}
                    sx={{ mt: 3 }}
                />




                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        mt: 3,
                        gap: 1.5,
                    }}
                >
                    <Button variant="outlined" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleSubmit}>
                        Guardar
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default PlantillaModal;
