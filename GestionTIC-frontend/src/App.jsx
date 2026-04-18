import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Login from "./pages/Login";
import Inicio_Admin from "./pages/Inicio_Admin";
import Inicio_Usuario from "./pages/Inicio_Usuario"
import Solicitudes_Admin from "./pages/Solicitudes_Admin";
import Solicitudes_Usuario from "./pages/Solicitudes_Usuario";
import Nueva_Solicitud_Usuario from "./pages/Nueva_Solicitud_Usuario";
import Nueva_Solicitud_Admin from "./pages/Nueva_Solicitud_Admin";
import Inventario from "./pages/Inventario";
import Usuarios from "./pages/Usuarios";
import Calendario_Admin from "./pages/Calendario_Admin";
import Calendario_User from "./pages/Calendario_User";
import Registro_Usuarios from "./pages/Registro_Usuarios";
import Registro_Equipos from "./pages/Registro_Equipos";
import PrivateRoute from "./routes/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/admin"
          element={
            <PrivateRoute requiredRole="ADMIN">
              <Outlet />
            </PrivateRoute>
          }
        >
          <Route index element={<Inicio_Admin />} />
          <Route path="solicitudes" element={<Solicitudes_Admin />} />
          <Route path="nueva-solicitud" element={<Nueva_Solicitud_Admin />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="inventario/:id" element={<Registro_Equipos/>} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="usuarios/:id" element={<Registro_Usuarios />} />
          <Route path="calendario" element={<Calendario_Admin />} />
        </Route>
        <Route
          path="/user"
          element={
            <PrivateRoute requiredRole="USER">
              <Outlet />
            </PrivateRoute>
          }
        >
          <Route index element={<Inicio_Usuario />} />
          <Route path="solicitudes" element={<Solicitudes_Usuario />} />
          <Route path="nueva-solicitud" element={<Nueva_Solicitud_Usuario />} />
          <Route path="calendario" element={<Calendario_User />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;