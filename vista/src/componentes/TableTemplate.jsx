import React, { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Tooltip,
    TablePagination,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const TableTemplate = ({ columns, data, onEdit, onDelete, acciones = true }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Paper sx={{ borderRadius: 3, boxShadow: 3, overflow: "hidden" }}>
            <TableContainer
                sx={{
                    maxHeight: "60vh",
                    overflowX: "auto",
                }}
            >
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell
                                sx={{
                                    backgroundColor: "#1976d2",
                                    color: "#fff",
                                    fontWeight: "bold",
                                    textAlign: "center",
                                }}
                            >
                                #
                            </TableCell>
                            {columns.map((col) => (
                                <TableCell
                                    key={col.field}
                                    sx={{
                                        backgroundColor: "#1976d2",
                                        color: "#fff",
                                        fontWeight: "bold",
                                        textAlign: "center",
                                    }}
                                >
                                    {col.headerName}
                                </TableCell>
                            ))}
                            {acciones && (
                                <TableCell
                                    sx={{
                                        backgroundColor: "#1976d2",
                                        color: "#fff",
                                        fontWeight: "bold",
                                        textAlign: "center",
                                    }}
                                >
                                    Acciones
                                </TableCell>
                            )}
                        </TableRow>
                    </TableHead>


                    <TableBody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((row, i) => (
                                <TableRow key={i} hover>
                                    <TableCell
                                        sx={{
                                            textAlign: "center",
                                            fontWeight: "bold",
                                            color: "#1976d2",
                                        }}
                                    >
                                        {page * rowsPerPage + i + 1}
                                    </TableCell>
                                    {columns.map((col) => (
                                        <TableCell
                                            key={col.field}
                                            sx={{
                                                textAlign: "center",
                                                padding: "12px 8px",
                                            }}
                                        >
                                            {row[col.field]}
                                        </TableCell>
                                    ))}
                                    {acciones && (
                                        <TableCell align="center">
                                            {onEdit && (
                                                <Tooltip title="Editar">
                                                    <IconButton color="primary" onClick={() => onEdit(row)}>
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            {onDelete && (
                                                <Tooltip title="Eliminar">
                                                    <IconButton color="error" onClick={() => onDelete(row)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={acciones ? columns.length + 2 : columns.length + 1}
                                    align="center"
                                >
                                    No hay registros disponibles
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>

                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[5, 10, 20]}
                component="div"
                count={data.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Filas por página"
            />
        </Paper>
    );
};

export default TableTemplate;
