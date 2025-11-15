import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { styled, useTheme } from '@mui/material/styles';
import {
    Box, Drawer as MuiDrawer, AppBar as MuiAppBar, Toolbar, List, CssBaseline, Typography, Divider, IconButton, ListItem, ListItemButton,
    ListItemIcon, ListItemText, Menu, MenuItem, Avatar,
} from '@mui/material';
import { Menu as MenuIcon, ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon, AccountCircle, PersonOutline, QuestionMark, Logout, Payment } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import '../css/styles.css';
import Swal from "sweetalert2";
import { Biotech, Beenhere, CoPresent, Person, Book, Money, Assessment, BookmarkAdd, Wallet, Star, AttachMoney } from '@mui/icons-material';
import LogoCabeza from "../img/LogocabezaCeleste.svg";
import Empleado from '../page/Empleado';
import Auditoria from '../page/Auditoria'
import Usuario from '../page/usuario';
import Rol from '../page/Rol';
import Permiso from '../page/Permiso'
import RolPermiso from '../page/Rolpermiso'
import TipoServicio from '../page/TipoServicio'
import Estado from '../page/Estado'
import Plantilla from '../page/Plantilla'
import Cliente from '../page/ClienteForm'
import Visita from '../page/VisitasPage'
import Registro from '../page/registroVisita'

const URL = import.meta.env.VITE_BACKEND_USUARIO;
const drawerWidth = 240;

export default function Slide() {
    const [perfil, setPerfil] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPerfil = async () => {
            const token = localStorage.getItem("token");
            if (!token) return navigate("/");

            try {
                const res = await fetch(`${URL}/usuarios/perfil`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });
                const data = await res.json();

                if (res.ok) {
                    setPerfil(data.data);
                    configurarMenu(data.data.idRol);
                } else {
                    Swal.fire("Error", data.error, "error");
                    navigate("/");
                }
            } catch (err) {
                console.error(err);
                Swal.fire("Error de conexión", "No se pudo cargar el perfil", "error");
                navigate("/");
            }
        };

        fetchPerfil();
    }, []);

    const configurarMenu = (rol) => {
        if (rol === 1) {
            setMenuItems(["Inicio", "Clientes", "Usuarios", "Visita", "Reportes", "Empleados", "Auditoria", "Rol", "Permiso", "Rol Permiso", "Tipo Servicio", "Estado", "Plantilla", "Registro"]);
        } else if (rol === 2) {
            setMenuItems(["Inicio", "Visitas Programadas", "Reportes"]);
        } else if (rol === 3) {
            setMenuItems(["Inicio", "Mis Visitas", "Perfil", "Registro"]);
        }
    };

    const openedMixin = (theme) => ({
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
        overflowX: 'hidden',
    });

    const closedMixin = (theme) => ({
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        overflowX: 'hidden',
        width: `calc(${theme.spacing(7)} + 1px)`,
        [theme.breakpoints.up('sm')]: {
            width: `calc(${theme.spacing(8)} + 1px)`,
        },
    });

    const DrawerHeader = styled('div')(({ theme }) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: theme.spacing(0, 1),
        ...theme.mixins.toolbar,
    }));

    const AppBar = styled(MuiAppBar, {
        shouldForwardProp: (prop) => prop !== 'open',
    })(({ theme, open }) => ({
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        ...(open && {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
        }),
    }));

    const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
        ({ theme, open }) => ({
            width: drawerWidth,
            flexShrink: 0,
            whiteSpace: 'nowrap',
            boxSizing: 'border-box',
            ...(open && {
                ...openedMixin(theme),
                '& .MuiDrawer-paper': openedMixin(theme),
            }),
            ...(!open && {
                ...closedMixin(theme),
                '& .MuiDrawer-paper': closedMixin(theme),
            }),
        }),
    );

    const iconMapping = {
        'Inicio': <Star />,
        'Clientes': <Star />,
        'Empleados': <Biotech />,
        'Auditoria': <Beenhere />,
        'Rol': <CoPresent />,
        'Permiso': <CoPresent />,
        'Usuarios': <Person />,
        'Plantilla': <AttachMoney />,
        'Rol Permiso': <Book />,
        'Asignar notas': <Money />,
        'Reportes': <Assessment />,
        'Visita': <Book />,
        'Asignacion de cursos': <BookmarkAdd />,
        'Registro': <Money />,
        'Estado': <Payment />,
        'Tipo Servicio': <Wallet />
    };

    const [anchorEl, setAnchorEl] = React.useState(null);
    const [selectedMenuItem, setSelectedMenuItem] = React.useState(null);


    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const theme = useTheme();
    const [open, setOpen] = React.useState(false);

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };


    const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/'); };

    if (!perfil) return <p>Cargando menú...</p>;

    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />
            <AppBar position="fixed" open={open} style={{ backgroundColor: '#021E50' }}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        sx={{
                            marginRight: 5,
                            ...(open && { display: 'none' }),
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <img src={LogoCabeza} alt="Mi Logo" height="50" />
                    <Typography variant="h6" noWrap>
                        _SKYCONTROL
                    </Typography>

                    <div style={{ flexGrow: 1 }} />
                    <div>
                        <IconButton
                            edge="end"
                            color="inherit"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleMenu}
                            aria-label="account of current user"
                        >
                            <AccountCircle />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                            anchorReference="anchorPosition"
                            anchorPosition={{ top: 5, left: window.innerWidth - 1 }}
                        >

                            <MenuItem onClick={() => {
                                handleClose();
                                setSelectedMenuItem('MiPerfil');
                            }}>
                                <Avatar /> Mi perfil
                            </MenuItem>
                            <Divider style={{ background: 'black' }} />

                            <MenuItem onClick={handleClose}>
                                <ListItemIcon>
                                    <PersonOutline fontSize="small" />
                                </ListItemIcon>
                                Actualización de datos
                            </MenuItem>
                            <MenuItem onClick={handleClose}>
                                <ListItemIcon>
                                    <QuestionMark fontSize="small" />
                                </ListItemIcon>
                                Ayuda
                            </MenuItem>

                            <MenuItem component={Link} to="/" onClick={() => { handleClose(); logout(); }}>
                                <ListItemIcon>
                                    <Logout fontSize="small" />
                                </ListItemIcon>
                                Salir
                            </MenuItem>
                        </Menu>
                    </div>
                </Toolbar>
            </AppBar>

            <Drawer variant="permanent" open={open}>
                <DrawerHeader style={{ backgroundColor: '#021E50' }}>
                    <IconButton onClick={handleDrawerClose} style={{ color: 'white' }}>
                        {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                    </IconButton>
                </DrawerHeader>
                <Divider />
                <List>
                    {menuItems.map((text) => (
                        <ListItem key={text} disablePadding>
                            <ListItemButton
                                className="listItem"
                                sx={{
                                    minHeight: 48,
                                    justifyContent: open ? 'initial' : 'center',
                                    px: 2.5,
                                }} onClick={() => setSelectedMenuItem(text)}
                            >
                                <ListItemIcon className="listItem"
                                    sx={{
                                        minWidth: 0,
                                        mr: open ? 3 : 'auto',
                                        justifyContent: 'center',
                                        color: '#019FE6'
                                    }} onClick={() => setSelectedMenuItem(text)}
                                >
                                    {iconMapping[text]}
                                </ListItemIcon>
                                <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
                <Divider />
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <DrawerHeader />
                {perfil.idRol === 1 && selectedMenuItem === 'Empleados' && (<Empleado />)}
                {perfil.idRol === 1 && selectedMenuItem === 'Auditoria' && (<Auditoria />)}
                {perfil.idRol === 1 && selectedMenuItem === 'Usuarios' && (<Usuario />)}
                {perfil.idRol === 1 && selectedMenuItem === 'Rol' && (<Rol />)}
                {perfil.idRol === 1 && selectedMenuItem === 'Permiso' && (<Permiso />)}
                {perfil.idRol === 1 && selectedMenuItem === 'Rol Permiso' && (<RolPermiso />)}
                {perfil.idRol === 1 && selectedMenuItem === 'Tipo Servicio' && (<TipoServicio />)}
                {perfil.idRol === 1 && selectedMenuItem === 'Estado' && (<Estado />)}
                {perfil.idRol === 1 && selectedMenuItem === 'Plantilla' && (<Plantilla />)}
                {perfil.idRol === 1 && selectedMenuItem === 'Clientes' && (<Cliente />)}
                {perfil.idRol === 1 && selectedMenuItem === 'Visita' && (<Visita />)}
                {perfil.idRol === 1 && selectedMenuItem === 'Registro' && (<Registro />)}

                {perfil.idRol === 3 && selectedMenuItem === 'Registro' && (<Registro />)}
            </Box>
        </Box>
    );
}
