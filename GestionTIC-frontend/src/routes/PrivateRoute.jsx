import { Navigate } from "react-router-dom";

// Componente de ruta privada que verifica la autenticación y el rol del usuario
function PrivateRoute({ children, requiredRole }) {
  const token = localStorage.getItem("token");
  const rol = localStorage.getItem("rol");

  // Si no hay token, redirige al usuario a la página de inicio de sesión
  if (!token) {
    return <Navigate to="/" />;
  }

  // Si se requiere un rol específico y el rol del usuario no coincide, redirige al usuario a la página de inicio
  if (requiredRole && rol !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
}

export default PrivateRoute;