import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Header_User.css";
import Button from "../Button/Button";

function Header_User() {
  // Obtener el nombre del usuario desde localStorage
  const [userName] = useState(() => localStorage.getItem("nombre") || "");
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("nombre");
    navigate("/");
  };

  return (
    <header className="user-header">
      <div className="header-content">
        <div className="buttons">
          <div className="logo">
            <img src="/Cesfam.png" alt="Logo" className="logo-img" />
          </div>
          <Button variant="header" onClick={() => navigate("/user")}>Inicio</Button>
          <Button variant="header" onClick={() => navigate("/user/solicitudes")}>Solicitudes</Button>
          <Button variant="header" onClick={() => navigate("/user/calendario")}>Calendario</Button>
        </div>

        <div className="user-menu">
          <Button
            variant="header"
            onClick={() => setShowMenu(!showMenu)}
          >
            {userName || "Usuario"}
          </Button>

          {showMenu && (
            <div className="dropdown">
              <button onClick={handleLogout} className="logout-btn">
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header_User;