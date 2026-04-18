import { useState } from "react";
import { loginRequest } from "../services/authService";
import Button from "../components/Button/Button";
import "./Login.css";
import Header from "../components/Header/Header";
import AlertModal from "../components/AlertModal/AlertModal";
import { useNavigate } from "react-router-dom";

function Login() {
  // Estados para almacenar el RUT, la contraseña y el estado del modal de error
  const [rut, setRut] = useState("");
  const [password, setPassword] = useState("");
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });

  // Hook para navegar entre rutas
  const navigate = useNavigate();

  // Función para manejar el envío del formulario de inicio de sesión
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorModal({ isOpen: false, message: "" });

    try {
      // Realizamos la solicitud de inicio de sesión a la API
      const data = await loginRequest(rut, password);

      //Guardamos el token
      localStorage.setItem("token", data.token);

      //Guardamos el nombre
      localStorage.setItem("nombre", data.user.nombre);

      //Guardamos rol
      const rol = data.user.rol;
      localStorage.setItem("rol", rol);

      //Login dependiendo del rol
      if (rol === "ADMIN") {
        navigate("/admin");
      }
      else {
        navigate("/user")
      }
    }
    // Manejar cualquier error que ocurra durante el inicio de sesión
    catch (err) {
      setErrorModal({
        isOpen: true,
        message: err.message || "Error al iniciar sesión"
      });
    }
  };

  return (
    <>
      <Header />
      <div className="login-container">
        <div className="login-box">
          <div className="login-title">Inicio de Sesión</div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>RUT</label>
              <input
                type="text"
                value={rut}
                onChange={(e) => setRut(e.target.value)}
                required
                placeholder="Ingrese su RUT (ej: 12345678-9)"
              />
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Ingrese su contraseña"
              />
            </div>

            <Button variant="ingress-button" type="submit" fullWidth>
              Ingresar
            </Button>
          </form>
        </div>
      </div>
      <AlertModal
        isOpen={errorModal.isOpen}
        type="error"
        message={errorModal.message}
        onClose={() => setErrorModal({ isOpen: false, message: "" })}
      />
    </>
  );
}

export default Login;