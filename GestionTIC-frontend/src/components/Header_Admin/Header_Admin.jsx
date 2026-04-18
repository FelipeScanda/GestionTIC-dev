import { useState } from "react";
import "./Header_Admin.css";
import Button from "../Button/Button";
import { useNavigate } from "react-router-dom";

function Header_Admin() {
  // Obtenemos el nombre del usuario desde localStorage para mostrarlo en el menú
  const [userName] = useState(() => localStorage.getItem("nombre") || "");
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  // Función para manejar el cierre de sesión, que limpia el localStorage y redirige al login
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("nombre");
    navigate("/");
  };

  return (
    <header className="admin-header">
      <div className="header-content">
        <div className="buttons">
          <div className="logo">
            <img src="/Cesfam.png" alt="Logo" className="logo-img" />
          </div>
          <Button variant="header" onClick={() => navigate("/admin")}>Inicio</Button>
          <Button variant="header" onClick={() => navigate("/admin/solicitudes")}>Solicitudes</Button>
          <Button variant="header" onClick={() => navigate("/admin/inventario")}>Inventario</Button>
          <Button variant="header" onClick={() => navigate("/admin/usuarios")}>Usuarios</Button>
          <Button variant="header" onClick={() => navigate("/admin/calendario")}>Calendario</Button>
        </div>

        <div className="admin-menu">
          <Button
            variant="header"
            onClick={() => setShowMenu(!showMenu)}
          >
            {userName || "Admin"}
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

export default Header_Admin;