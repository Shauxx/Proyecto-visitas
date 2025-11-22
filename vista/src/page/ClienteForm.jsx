//vista\src\page\ClienteForm.jsx
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
import { TablePagination } from "@mui/material";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
    ubicacion: "",
    latitud: "",
    longitud: "",
    idUbicacion: null,
  });
  const [marker, setMarker] = useState(null);
  const [editing, setEditing] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  const [departamentos, setDepartamentos] = useState([]);
  const [municipios, setMunicipios] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);


  // 🔔 Mostrar alertas
  const showAlert = (message, severity = "success") => {
    setAlert({ open: true, message, severity });
    setTimeout(() => setAlert({ open: false, message: "", severity: "success" }), 3000);
  };

  // 🗺️ Mapa: captura clics
  // 🗺️ Mapa: captura clics
  const MapClickHandler = () => {
    useMapEvents({
      async click(e) {
        const { lat, lng } = e.latlng;
        setMarker({ lat, lng });

        try {
          // 1️⃣ Reverse geocoding
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data = await res.json();

          // 2️⃣ Nombres RAW que devuelve Nominatim
          const rawDep = data.address?.state || "";
          const rawMuni =
            data.address?.county ||
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            "";

          // 3️⃣ Normalizar
          const depNormalizado = rawDep
            .replace("Departamento de ", "")
            .replace("departmento de ", "")
            .trim();

          const muniNormalizado = rawMuni
            .replace("Ciudad de ", "")
            .replace("city of ", "")
            .trim();

          // 4️⃣ Buscar el ID del departamento
          const depRes = await fetch(
            `${import.meta.env.VITE_BACKEND_CONFIG}/config/departamento`
          );
          const depData = await depRes.json();

          const departamento = depData.data.find(
            (d) => d.nombre.toLowerCase() === depNormalizado.toLowerCase()
          );

          const idDepartamento = departamento ? departamento.id : null;

          // 5️⃣ Buscar el ID del municipio SOLO si se encontró el departamento
          let idMunicipio = null;
          if (idDepartamento) {
            const munRes = await fetch(
              `${import.meta.env.VITE_BACKEND_CONFIG}/config/municipio/departamento/${idDepartamento}`
            );
            const munData = await munRes.json();

            const municipio = munData.data.find(
              (m) => m.nombre.toLowerCase() === muniNormalizado.toLowerCase()
            );

            idMunicipio = municipio ? municipio.id : null;
          }

          // 6️⃣ Actualizar formulario
          setForm((prev) => ({
            ...prev,
            latitud: lat,
            longitud: lng,
            idDepartamento: idDepartamento || "",
            idMunicipio: idMunicipio || "",
          }));

          console.log("📍 Ubicación normalizada:");
          console.log("Departamento:", depNormalizado, "→", idDepartamento);
          console.log("Municipio:", muniNormalizado, "→", idMunicipio);

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
    const cargarCatalogos = async () => {
      try {
        const depRes = await fetch(`${import.meta.env.VITE_BACKEND_CONFIG}/config/departamento`);
        const depData = await depRes.json();
        setDepartamentos(depData.data);

        // Cargar municipios por cada departamento
        let muniMap = {};
        for (let dep of depData.data) {
          const muniRes = await fetch(
            `${import.meta.env.VITE_BACKEND_CONFIG}/config/municipio/departamento/${dep.id}`
          );
          const muniData = await muniRes.json();
          muniMap[dep.id] = muniData.data;
        }

        setMunicipios(muniMap);

      } catch (error) {
        console.error("Error cargando catálogos:", error);
      }
    };

    cargarCatalogos();
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
    const usuarioId = decoded.id || decoded.userId || decoded.data?.id;

    try {
      const finalData = {
        nombre: form.nombre,
        apellido: form.apellido,
        nit: form.nit,
        correo: form.correo,
        telefono: form.telefono,
        idDepartamento: form.idDepartamento,
        idMunicipio: form.idMunicipio,
        longitud: form.longitud,
        latitud: form.latitud,
        ubicacion: form.ubicacion,
        creadoPor: usuarioId,
        actualizadoPor: usuarioId,
      };

      console.log("📤 Datos a enviar:", finalData);

      let response;

      // 🔹 SI ESTAMOS EDITANDO → USAR PUT
      if (editing) {
        response = await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/cliente/${editing.id}`,
          finalData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          showAlert("Cliente actualizado correctamente", "success");
          await registrarAuditoria(`Actualizó al cliente ${form.nombre} ${form.apellido}`);
          obtenerClientes();
        }
      }
      // 🔹 SI ES NUEVO → POST
      else {
        response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/cliente`,
          finalData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          await registrarAuditoria(`Registró al cliente ${form.nombre} ${form.apellido}`);
          showAlert("Cliente creado correctamente", "success");
          obtenerClientes();
        }
      }

      // Limpiar formulario
      setForm({
        nombre: "",
        apellido: "",
        nit: "",
        correo: "",
        telefono: "",
        idDepartamento: "",
        idMunicipio: "",
        ubicacion: "",
        latitud: "",
        longitud: "",
        idUbicacion: null,
      });
      setEditing(null);
      setMarker(null);

    } catch (error) {
      console.error("Error guardar:", error);
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
      ubicacion: cliente.ubicacion?.ubicacion || "",
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };




  const generarPDF = () => {
    const doc = new jsPDF();

    // 1️⃣ Título del PDF
    doc.setFontSize(18);
    doc.text("SkyNet S.A.", 14, 22);

    // 2️⃣ Tabla con los datos de clientes
    const tableColumn = ["#", "Nombre", "Apellido", "Correo", "Teléfono", "NIT", "Ubicación"];
    const tableRows = [];

    clientes.forEach((c, index) => {
      const depId = Number(c.ubicacion?.idDepartamento);
      const muniId = Number(c.ubicacion?.idMunicipio);

      const dep = departamentos.find(d => Number(d.id) === depId);
      const muniList = municipios[depId] || [];
      const muni = muniList.find(m => Number(m.id) === muniId);

      const rowData = [
        index + 1,
        c.nombre,
        c.apellido,
        c.correo,
        c.telefono,
        c.nit,
        `${dep?.nombre || "Sin depto"}, ${muni?.nombre || "Sin muni"}, ${c.ubicacion?.ubicacion || ""}`
      ];
      tableRows.push(rowData);
    });

    // 3️⃣ Crear la tabla
    autoTable(doc, {
      startY: 30,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [25, 118, 210], textColor: 255 },
      styles: { fontSize: 10 },
    });

    // 4️⃣ Guardar PDF
    doc.save("Clientes_SkyNet.pdf");
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
            {["nombre", "apellido", "nit", "correo", "telefono", "ubicacion"].map(
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
          <Button type="submit" variant="contained" color="primary" disabled={!form.latitud || !form.longitud}>
            {editing ? "Actualizar Cliente" : "Guardar Cliente"}

          </Button>
        </form>
      </Paper>

      {/* 📋 TABLA */}
      <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Clientes Registrados
          </Typography>
          <Button variant="outlined" color="secondary" onClick={generarPDF}>
            Descargar PDF
          </Button>
        </Box>



        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#1976d2", color: "white" }}>
              <th>#</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>NIT</th>
              <th>Ubicacion</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.length > 0 ? (
              clientes
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((c, i) => (
                  <tr key={c.id} style={{ textAlign: "center" }}>
                    <td>{page * rowsPerPage + i + 1}</td>
                    <td>{c.nombre}</td>
                    <td>{c.apellido}</td>
                    <td>{c.correo}</td>
                    <td>{c.telefono}</td>
                    <td>{c.nit}</td>
                    <td>
                      {(() => {
                        const depId = Number(c.ubicacion?.idDepartamento);
                        const muniId = Number(c.ubicacion?.idMunicipio);

                        const dep = departamentos.find(d => Number(d.id) === depId);
                        const muniList = municipios[depId] || [];
                        const muni = muniList.find(m => Number(m.id) === muniId);

                        return `${dep?.nombre || "Sin depto"}, ${muni?.nombre || "Sin muni"}, ${c.ubicacion?.ubicacion || ""}`;
                      })()}
                    </td>
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
        <TablePagination
          component="div"
          count={clientes.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />

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
