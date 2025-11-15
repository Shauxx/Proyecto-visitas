// src/componentes/FormModal.jsx
import React, { useEffect, useState } from "react";
import {
    Modal,
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    MenuItem,
    Alert,
} from "@mui/material";

const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: 600,
    bgcolor: "background.paper",
    boxShadow: 24,
    borderRadius: 3,
    p: 4,
};

const FormModal = ({ open, onClose, title, fields, onSubmit, initialData }) => {
    const [formData, setFormData] = useState({});
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});


    useEffect(() => {
        if (initialData) setFormData(initialData);
    }, [initialData]);

    const formatDPI = (value) => {
        const numbersOnly = value.replace(/\D/g, "");
        return numbersOnly
            .replace(/^(\d{0,4})(\d{0,5})(\d{0,4}).*/, "$1-$2-$3")
            .replace(/-+$/, "");
    };

    const validateField = (name, value) => {
        let message = "";

        if (name === "nit") {
            if (!/^\d{9}$/.test(value)) {
                message = "Debe contener exactamente 9 dígitos numéricos";
            }
        }
        if (name === "dpi") {
            if (!/^\d{4}-\d{5}-\d{4}$/.test(value)) {
                message = "Formato inválido (####-#####-####)";
            }
        }
        setFieldErrors((prev) => ({ ...prev, [name]: message }));
        return message;
    };

    const handleChange = (e, field) => {
        const { name, value } = e.target;
        let newValue = value;

        if (name === "nit") {
            newValue = value.replace(/\D/g, "");
            if (newValue.length > 9) newValue = newValue.slice(0, 9);
        }

        if (name === "dpi") {
            newValue = formatDPI(value);
            if (newValue.length > 15) newValue = newValue.slice(0, 15);
        }

        setFormData((prev) => ({ ...prev, [name]: newValue }));

        if (error) setError("");
        validateField(name, newValue);
        if (field?.onChange) field.onChange(newValue);
    };

    const handleSubmit = () => {
        const vacios = fields.filter(
            (f) => !formData[f.name] || formData[f.name].toString().trim() === ""
        );

        // Solo validar si el formulario tiene NIT o DPI
        let nitError = "";
        let dpiError = "";

        if (fields.some(f => f.name === "nit")) {
            nitError = validateField("nit", formData.nit || "");
        }
        if (fields.some(f => f.name === "dpi")) {
            dpiError = validateField("dpi", formData.dpi || "");
        }

        if (vacios.length > 0 || nitError || dpiError) {
            setError("Corrige los campos marcados en rojo antes de guardar.");
            return;
        }

        onSubmit(formData);
        setFormData({});
        setError("");
        setFieldErrors({});
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
                    {title}
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Grid container spacing={2}>
                    {fields.map((field) => (
                        <Grid item xs={12} key={field.name}>
                            {field.type === "select" ? (
                                <TextField
                                    select
                                    required
                                    fullWidth
                                    variant="outlined"
                                    label={field.label}
                                    name={field.name}
                                    value={formData[field.name] || ""}
                                    onChange={(e) => handleChange(e, field)}
                                    SelectProps={{ displayEmpty: true }}
                                    InputLabelProps={{ shrink: true }}
                                    error={!!fieldErrors[field.name]}
                                    helperText={fieldErrors[field.name] || ""}
                                >
                                    <MenuItem value="">
                                        <em>Seleccione {field.label.toLowerCase()}</em>
                                    </MenuItem>
                                    {field.options?.map((opt) => (
                                        <MenuItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            ) : (
                                <TextField
                                    required
                                    fullWidth
                                    variant="outlined"
                                    label={field.label}
                                    name={field.name}
                                    type={field.type || "text"}
                                    value={formData[field.name] || ""}
                                    onChange={(e) => handleChange(e, field)}
                                    inputProps={
                                        field.name === "nit"
                                            ? { maxLength: 9 }
                                            : field.name === "dpi"
                                                ? { maxLength: 15 }
                                                : {}
                                    }
                                    error={!!fieldErrors[field.name]}
                                    helperText={fieldErrors[field.name] || ""}
                                />
                            )}

                        </Grid>
                    ))}
                </Grid>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        mt: 3,
                        gap: 1.5,
                    }}
                >
                    <Button onClick={onClose} variant="outlined" color="inherit">
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

export default FormModal;
