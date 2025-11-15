import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Paper,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    nit: "",
    correo: "",
    telefono: "",
    idDepartamento: "",
    idMunicipio: "",
    latitud: "",
    longitud: "",
    idUbicacion: null,
  });
  const [marker, setMarker] = useState(null);
  const [editing, setEditing] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

  // 🔔 Mostrar alertas
  const showAlert = (message, severity = "success") => {
    setAlert({ open: true, message, severity });
    setTimeout(() => setAlert({ open: false, message: "", severity: "success" }), 3000);
  };

  // 🗺️ Mapa: captura clics
  const MapClickHandler = () => {
    useMapEvents({
      async click(e) {
        const { lat, lng } = e.latlng;
        setMarker({ lat, lng });

        try {
          // 1️⃣ Reverse geocoding (usando Nominatim)
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data = await res.json();

          const departamentoNombre = data.address?.state || "";
          const municipioNombre =
            data.address?.county ||
            data.address?.town ||
            data.address?.city ||
            data.address?.village ||
            "";

          console.log("Detectado:", departamentoNombre, municipioNombre);

          // 2️⃣ Buscar el ID del departamento en tu backend
          const depRes = await fetch(`${import.meta.env.VITE_BACKEND_CONFIG}/config/departamento`);
          const depData = await depRes.json();

          const departamento = depData.data.find(
            (d) => d.nombre.toLowerCase() === departamentoNombre.toLowerCase()
          );

          const idDepartamento = departamento ? departamento.id : null;

          // 3️⃣ Buscar el ID del municipio en base al departamento encontrado
          let idMunicipio = null;
          if (idDepartamento) {
            const munRes = await fetch(
              `${import.meta.env.VITE_BACKEND_CONFIG}/config/municipio/departamento/${idDepartamento}`
            );
            const munData = await munRes.json();

            const municipio = munData.data.find(
              (m) => m.nombre.toLowerCase() === municipioNombre.toLowerCase()
            );

            idMunicipio = municipio ? municipio.id : null;
          }

          console.log("IDs encontrados:", idDepartamento, idMunicipio);

          // 4️⃣ Actualizar el formulario con los IDs reales
          setForm((prev) => ({
            ...prev,
            latitud: lat,
            longitud: lng,
            idDepartamento: idDepartamento || "",
            idMunicipio: idMunicipio || "",
          }));

          if (!idDepartamento || !idMunicipio) {
            console.warn("⚠️ No se encontraron IDs para esa ubicación");
          }
        } catch (error) {
          console.error("Error al obtener ubicación o IDs:", error);
        }
      },
    });

    return marker ? <Marker position={marker} icon={markerIcon} /> : null;
  };



  // 📋 Obtener clientes
  const obtenerClientes = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/cliente`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) setClientes(data.data);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
    }
  };

  useEffect(() => {
    obtenerClientes();
  }, []);

  // 🧾 Registrar auditoría
  const registrarAuditoria = async (accion) => {
    try {
      const token = localStorage.getItem("token");
      const decoded = JSON.parse(atob(token.split(".")[1]));
      const userId = decoded.id || decoded.userId || decoded.data?.id;

      await axios.post(
        `${import.meta.env.VITE_BACKEND_CONFIG}/config/auditoria`,
        { idEmpleado: userId, accion },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Error al registrar auditoría:", error);
    }
  };

  // 🧩 Crear o editar cliente (con ubicación)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const decoded = JSON.parse(atob(token.split(".")[1]));
    const userId = decoded.id || decoded.userId || decoded.data?.id;

    try {
      let idUbicacion = form.idUbicacion;

      // 🔹 Si está editando, actualiza la ubicación existente
      if (editing && idUbicacion) {
        await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/cliente/ubicacion/${idUbicacion}`,
          {
            idDepartamento: form.idDepartamento,
            idMunicipio: form.idMunicipio,
            latitud: form.latitud,
            longitud: form.longitud,
            actualizadoPor: userId,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      // 🔹 Si es nuevo cliente, primero crea la ubicación
      else {
        const ubicacionRes = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/cliente/ubicacion`,
          {
            idDepartamento: form.idDepartamento,
            idMunicipio: form.idMunicipio,
            latitud: form.latitud,
            longitud: form.longitud,
            creadoPor: userId,
            actualizadoPor: userId,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        idUbicacion = ubicacionRes.data.data.id;
      }

      // 🧠 Datos del cliente
      const payload = {
        nombre: form.nombre,
        apellido: form.apellido,
        nit: form.nit,
        correo: form.correo,
        telefono: form.telefono,
        idUbicacion,
        creadoPor: userId,
        actualizadoPor: userId,
      };

      // 🧾 Crear o actualizar cliente
      if (editing) {
        await axios.put(`${import.meta.env.VITE_BACKEND_URL}/cliente/${editing.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        await registrarAuditoria(`Editó al cliente ${form.nombre} ${form.apellido}`);
        showAlert("Cliente actualizado correctamente");
      } else {
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/cliente`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        await registrarAuditoria(`Agregó al cliente ${form.nombre} ${form.apellido}`);
        showAlert("Cliente creado correctamente");
      }

      // Resetear formulario
      setForm({
        nombre: "",
        apellido: "",
        nit: "",
        correo: "",
        telefono: "",
        idDepartamento: "",
        idMunicipio: "",
        latitud: "",
        longitud: "",
        idUbicacion: null,
      });
      setMarker(null);
      setEditing(null);
      obtenerClientes();
    } catch (error) {
      console.error("Error al guardar cliente:", error);
      showAlert("Error al guardar cliente", "error");
    }
  };

  // ✏️ Editar cliente
  const handleEdit = (cliente) => {
    setEditing(cliente);
    setForm({
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      nit: cliente.nit,
      correo: cliente.correo,
      telefono: cliente.telefono,
      idDepartamento: cliente.ubicacion?.idDepartamento || "",
      idMunicipio: cliente.ubicacion?.idMunicipio || "",
      latitud: cliente.ubicacion?.latitud || "",
      longitud: cliente.ubicacion?.longitud || "",
    });
    if (cliente.ubicacion?.latitud && cliente.ubicacion?.longitud) {
      setMarker({
        lat: Number(cliente.ubicacion.latitud),
        lng: Number(cliente.ubicacion.longitud),
      });
    }

  };

  // 🗑️ Eliminar cliente
  const handleDelete = async (cliente) => {
    if (!window.confirm(`¿Seguro que deseas eliminar a ${cliente.nombre}?`)) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/cliente/${cliente.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await registrarAuditoria(`Eliminó al cliente ${cliente.nombre} ${cliente.apellido}`);
      showAlert("Cliente eliminado correctamente");
      obtenerClientes();
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      showAlert("Error al eliminar cliente", "error");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Gestión de Clientes
      </Typography>

      {/* 🧾 FORMULARIO */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {["nombre", "apellido", "nit", "correo", "telefono", "idDepartamento", "idMunicipio"].map(
              (field) => (
                <Grid item xs={12} sm={6} key={field}>
                  <TextField
                    label={field.charAt(0).toUpperCase() + field.slice(1)}
                    name={field}
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    fullWidth
                    required={["nombre", "apellido"].includes(field)}
                  />
                </Grid>
              )
            )}
          </Grid>

          <Box sx={{ my: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Selecciona la ubicación del cliente:
            </Typography>
            <MapContainer
              center={[14.6349, -90.5069]}
              zoom={7}
              style={{ width: "100%", height: "400px", borderRadius: "12px" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapClickHandler />
            </MapContainer>
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1">
              <strong>Departamento ID:</strong> {form.idDepartamento || "-"}
            </Typography>
            <Typography variant="body1">
              <strong>Municipio ID:</strong> {form.idMunicipio || "-"}
            </Typography>
          </Box>



          <Button type="submit" variant="contained" color="primary">
            {editing ? "Actualizar Cliente" : "Guardar Cliente"}
          </Button>
        </form>
      </Paper>

      {/* 📋 TABLA */}
      <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h6" gutterBottom>
          Clientes Registrados
        </Typography>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#1976d2", color: "white" }}>
              <th>#</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>NIT</th>
              <th>Latitud</th>
              <th>Longitud</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.length > 0 ? (
              clientes.map((c, i) => (
                <tr key={c.id} style={{ textAlign: "center" }}>
                  <td>{i + 1}</td>
                  <td>{c.nombre}</td>
                  <td>{c.apellido}</td>
                  <td>{c.correo}</td>
                  <td>{c.telefono}</td>
                  <td>{c.nit}</td>
                  <td>{c.ubicacion?.latitud || "-"}</td>
                  <td>{c.ubicacion?.longitud || "-"}</td>

                  <td>
                    <Tooltip title="Editar">
                      <IconButton color="primary" onClick={() => handleEdit(c)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton color="error" onClick={() => handleDelete(c)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: "12px" }}>
                  No hay clientes registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Paper>

      {/* 🔔 ALERTA */}
      <Snackbar
        open={alert.open}
        autoHideDuration={3000}
        onClose={() => setAlert({ open: false, message: "", severity: "success" })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={alert.severity} variant="filled" sx={{ width: "100%" }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Clientes;
