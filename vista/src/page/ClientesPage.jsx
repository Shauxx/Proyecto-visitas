//vista\src\page\ClientesPage.jsx
import React, { useEffect, useState } from "react";
import { Box, Button, Typography, Modal } from "@mui/material";
import TableTemplate from "./TableTemplate";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const markerIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "80%",
    height: "70%",
    bgcolor: "background.paper",
    boxShadow: 24,
    borderRadius: 3,
    p: 3,
};

const ClientesPage = () => {
    const [clientes, setClientes] = useState([]);
    const [openMap, setOpenMap] = useState(false);
    const [selectedCliente, setSelectedCliente] = useState(null);

    const obtenerClientes = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/cliente`);
            const data = await res.json();
            if (data.success) {
                // Mapea datos incluyendo latitud y longitud desde la relación ubicación
                const clientesConUbicacion = data.data.map((c) => ({
                    id: c.id,
                    nombre: c.nombre,
                    apellido: c.apellido,
                    correo: c.correo,
                    telefono: c.telefono,
                    nit: c.nit,
                    latitud: c.Ubicacion?.latitud || "",
                    longitud: c.Ubicacion?.longitud || "",
                }));
                setClientes(clientesConUbicacion);
            }
        } catch (error) {
            console.error("Error al obtener clientes:", error);
        }
    };

    useEffect(() => {
        obtenerClientes();
    }, []);

    const handleDelete = async (cliente) => {
        if (window.confirm(`¿Seguro que deseas eliminar a ${cliente.nombre}?`)) {
            try {
                await fetch(`${import.meta.env.VITE_BACKEND_URL}/cliente/${cliente.id}`, {
                    method: "DELETE",
                });
                obtenerClientes();
            } catch (error) {
                console.error("Error al eliminar cliente:", error);
            }
        }
    };

    const handleViewMap = (cliente) => {
        if (cliente.latitud && cliente.longitud) {
            setSelectedCliente(cliente);
            setOpenMap(true);
        } else {
            alert("Este cliente no tiene ubicación registrada.");
        }
    };

    const columns = [
        { field: "id", headerName: "ID" },
        { field: "nombre", headerName: "Nombre" },
        { field: "apellido", headerName: "Apellido" },
        { field: "correo", headerName: "Correo" },
        { field: "telefono", headerName: "Teléfono" },
        { field: "nit", headerName: "NIT" },
        { field: "latitud", headerName: "Latitud" },
        { field: "longitud", headerName: "Longitud" },
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Listado de Clientes
            </Typography>

            <Button
                variant="contained"
                color="primary"
                sx={{ mb: 2 }}
                onClick={() => (window.location.href = "/nuevo-cliente")}
            >
                + Nuevo Cliente
            </Button>

            <TableTemplate
                columns={columns}
                data={clientes}
                onEdit={handleViewMap}
                onDelete={handleDelete}
            />

            {/* Modal de mapa */}
            <Modal open={openMap} onClose={() => setOpenMap(false)}>
                <Box sx={modalStyle}>
                    {selectedCliente && (
                        <>
                            <Typography variant="h6" gutterBottom>
                                Ubicación de {selectedCliente.nombre} {selectedCliente.apellido}
                            </Typography>
                            <MapContainer
                                center={[selectedCliente.latitud, selectedCliente.longitud]}
                                zoom={14}
                                style={{ width: "100%", height: "90%", borderRadius: "12px" }}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker
                                    position={[selectedCliente.latitud, selectedCliente.longitud]}
                                    icon={markerIcon}
                                />
                            </MapContainer>
                        </>
                    )}
                </Box>
            </Modal>
        </Box>
    );
};

export default ClientesPage;
