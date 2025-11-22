// src/pages/Plantilla.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import TableTemplate from "../componentes/TableTemplate";
import PlantillaModal from "../componentes/PlantillaModal";
import ConfirmDialog from "../componentes/ConfirmDialog";
import { Button, Box, Snackbar, Alert } from "@mui/material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


const Plantilla = () => {
    const [plantillas, setPlantillas] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState({ open: false, id: null });
    const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

    // 🔹 Obtener ID del usuario logueado desde el token
    const token = localStorage.getItem("token");
    let userIdFromToken = 0;
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            userIdFromToken = payload.id;
        } catch (err) {
            console.error("Token inválido:", err);
        }
    }

    // 🔹 Mostrar alertas
    const showAlert = (message, severity = "success") => {
        setAlert({ open: true, message, severity });
        setTimeout(() => setAlert({ open: false, message: "", severity: "success" }), 3000);
    };

    // 🔹 Registrar auditoría
    const registrarAuditoria = async (accion) => {
        try {
            if (!token) return;
            const decoded = JSON.parse(atob(token.split(".")[1]));
            const userId = decoded.id || decoded.userId || decoded.data?.id;

            const url = `${import.meta.env.VITE_BACKEND_CONFIG}/config/auditoria`;
            await axios.post(
                url,
                { idEmpleado: userId, accion },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (error) {
            console.error("Error al registrar auditoría:", error);
        }
    };

    // 🔹 Obtener plantillas
    const fetchPlantillas = async () => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_CONFIG}/config/plantilla`;
            const res = await axios.get(url);
            setPlantillas(res.data?.data || []);
        } catch (error) {
            console.error("Error al obtener plantillas:", error);
            setPlantillas([]);
        }
    };

    // 🔹 Obtener empleados (para mostrar nombres de creador/actualizador)
    const fetchEmpleados = async () => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_USUARIO}/usuarios/empleado`;
            const res = await axios.get(url);
            setEmpleados(res.data?.data || []);
        } catch (error) {
            console.error("Error al obtener empleados:", error);
            setEmpleados([]);
        }
    };

    useEffect(() => {
        fetchPlantillas();
        fetchEmpleados();
    }, []);

    // 🔹 CRUD de Plantilla

    // Crear
    const createPlantilla = async (formData) => {
        try {
            const dataToSend = {
                ...formData,
                creadoPor: userIdFromToken,
                actualizadoPor: userIdFromToken,
            };
            const url = `${import.meta.env.VITE_BACKEND_CONFIG}/config/plantilla`;
            const res = await axios.post(url, dataToSend);

            await registrarAuditoria(`Creó la plantilla "${formData.nombre}"`);
            showAlert(res.data?.message || "Plantilla creada correctamente.");
            fetchPlantillas();
        } catch (error) {
            console.error("Error al crear plantilla:", error);
            showAlert("Error al crear plantilla.", "error");
        }
    };

    // Editar
    const editPlantilla = async (id, formData) => {
        try {
            const dataToSend = { ...formData, actualizadoPor: userIdFromToken };
            const url = `${import.meta.env.VITE_BACKEND_CONFIG}/config/plantilla/${id}`;
            const res = await axios.put(url, dataToSend);

            await registrarAuditoria(`Editó la plantilla "${formData.nombre}"`);
            showAlert(res.data?.message || "Plantilla actualizada correctamente.");
            fetchPlantillas();
        } catch (error) {
            console.error("Error al actualizar plantilla:", error);
            showAlert("Error al actualizar plantilla.", "error");
        }
    };

    // Desactivar (soft delete)
    const deletePlantilla = async (id) => {
        try {
            const url = `${import.meta.env.VITE_BACKEND_CONFIG}/config/plantilla/${id}`;
            const res = await axios.delete(url);

            await registrarAuditoria(`Desactivó la plantilla con ID ${id}`);
            showAlert(res.data?.message || "Plantilla desactivada correctamente.");
            fetchPlantillas();
        } catch (error) {
            console.error("Error al desactivar plantilla:", error);
            showAlert("Error al desactivar plantilla.", "error");
        }
    };

    // 🔹 Mapeo de nombres de creador/actualizador
    const mappedPlantillas = plantillas.map((plantilla) => {
        const creador = empleados.find((e) => e.id === plantilla.creadoPor);
        const actualizador = empleados.find((e) => e.id === plantilla.actualizadoPor);
        return {
            ...plantilla,
            creadoPorNombre: creador ? `${creador.nombre} ${creador.apellido}` : "—",
            actualizadoPorNombre: actualizador ? `${actualizador.nombre} ${actualizador.apellido}` : "—",
        };
    });

    // 🔹 Columnas de la tabla
    const plantillaColumns = [
        { field: "nombre", headerName: "Nombre" },
        { field: "asunto", headerName: "Asunto" },
        { field: "cuerpo", headerName: "Cuerpo" },
        { field: "creadoPorNombre", headerName: "Creado Por" },
        { field: "actualizadoPorNombre", headerName: "Actualizado Por" },
    ];


    const generarPDFPlantillas = () => {
        const doc = new jsPDF();

        // 1️⃣ Encabezado corporativo
        doc.setFontSize(18);
        doc.text("SkyNet S.A.", 14, 20);

        // 2️⃣ Columnas del PDF
        const tableColumn = [
            "Nombre",
            "Asunto",
            "Cuerpo",
            "Creado Por",
            "Actualizado Por"
        ];

        // 3️⃣ Filas del PDF
        const tableRows = mappedPlantillas.map((p) => [
            p.nombre,
            p.asunto,
            p.cuerpo,
            p.creadoPorNombre,
            p.actualizadoPorNombre
        ]);

        // 4️⃣ Construcción de tabla con estilo
        autoTable(doc, {
            startY: 28,
            head: [tableColumn],
            body: tableRows,
            theme: "grid",
            headStyles: {
                fillColor: [25, 118, 210], // azul corporativo
                textColor: 255
            },
            styles: {
                fontSize: 9,
                cellWidth: "wrap"
            },
            columnStyles: {
                2: { cellWidth: 60 } // cuerpo de plantilla más ancho
            }
        });

        // 5️⃣ Descargar PDF
        doc.save("Plantillas_SkyNet.pdf");
    };



    return (
        <div style={{ padding: 20 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <h2>Gestión de Plantillas de Correo</h2>

                <Button variant="outlined" color="secondary" onClick={generarPDFPlantillas}>
                    Descargar PDF
                </Button>
            </Box>


            <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ mb: 2 }}
                    onClick={() => {
                        setModalData(null);
                        setModalOpen(true);
                    }}
                >
                    Crear Plantilla
                </Button>
            </Box>

            <TableTemplate
                columns={plantillaColumns}
                data={mappedPlantillas}
                onEdit={(row) => {
                    setModalData(row);
                    setModalOpen(true);
                }}
                onDelete={(row) => setConfirmOpen({ open: true, id: row.id })}
            />

            <PlantillaModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                initialData={modalData}
                onSubmit={(data) => {
                    modalData?.id
                        ? editPlantilla(modalData.id, data)
                        : createPlantilla(data);
                }}
            />


            <ConfirmDialog
                open={confirmOpen.open}
                onClose={() => setConfirmOpen({ open: false, id: null })}
                onConfirm={() => deletePlantilla(confirmOpen.id)}
                title="Eliminar Plantilla"
                message="¿Desea desactivar esta plantilla?"
            />

            <Snackbar
                open={alert.open}
                autoHideDuration={3000}
                onClose={() =>
                    setAlert({ open: false, message: "", severity: "success" })
                }
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    severity={alert.severity}
                    variant="filled"
                    onClose={() =>
                        setAlert({ open: false, message: "", severity: "success" })
                    }
                >
                    {alert.message}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default Plantilla;
