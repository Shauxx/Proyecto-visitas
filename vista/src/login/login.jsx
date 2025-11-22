import { useState } from 'react';
import Logo from '../img/inicio.png';
import Swal from 'sweetalert2';
import '../css/loguinForm.css';
import Login from '../img/LogoCompleto.svg';
import { useNavigate } from 'react-router-dom';

const URL = import.meta.env.VITE_BACKEND_USUARIO;

const MiComponente = () => {
    const estiloDelComponente = {
        backgroundImage: `url(${Logo})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: '100%',
        height: '100vh',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
    };


    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleLogin = async () => {
        try {
            const response = await fetch(`${URL}/usuarios/usuario/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ usuario: username, contra: password }),
            });

            const data = await response.json();
            if (response.ok) {

                const { token } = data.data;

                localStorage.setItem('token', token);

                Swal.fire('BIENVENIDO AL SISTEMA', data.message, 'success');

                navigate('/Menu');

            } else {
                Swal.fire('Error', data.error, 'error');
            }
        } catch (error) {
            console.error('Error al realizar la solicitud:', error);
            Swal.fire('Error de conexión', 'Comuniquese con su operador ', 'error');
        }
    };

    return (
        <div style={estiloDelComponente}>
            <div className="estilo-cuadro-blanco">
                <div className="form-container">
                    <img src={Login} alt="Imagen de logo" height={100} />
                    <h1 className='l-h1'>Inicio de Sesión</h1>
                    <form>
                        <div className="input-group">
                            <label className="input-fill">
                                <input type="text" name="usuario" id="usuario" required onChange={handleUsernameChange} />
                                <span className='input-label'>Usuario</span>
                                <span className="material-icons" >email</span>
                            </label>
                        </div>
                        <div className="input-group">
                            <label className="input-fill">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    id="password"
                                    required
                                    onChange={handlePasswordChange}
                                />
                                <span className='input-label'>Contraseña</span>
                                <span className="material-icons" onClick={togglePasswordVisibility}>
                                    {showPassword ? 'visibility' : 'visibility_off'}
                                </span>
                            </label>
                        </div>
                        <br />
                        <button className='button-login' type="button" onClick={handleLogin}>
                            Iniciar Sesión
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MiComponente;
