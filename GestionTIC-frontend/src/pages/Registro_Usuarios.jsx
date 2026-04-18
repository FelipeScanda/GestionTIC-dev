import Header_Admin from "../components/Header_Admin/Header_Admin";
import { useState } from "react";
import { useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import DataTable from "../components/Data_Table/Data_Table";

function Registro_Usuarios() {
    // Estado para almacenar las solicitudes del usuario
    const [todas, setTodas] = useState([]);
    const { id } = useParams();
    const location = useLocation();
    const nombreUsuario = location.state?.nombre || "Usuario";

    // Obtener las solicitudes del usuario al cargar el componente
    useEffect(() => {
        const obtenerPrestamos = async () => {
            try {
                // Obtener el token de autenticación del almacenamiento local
                const token = localStorage.getItem("token");

                // Realizar la solicitud a la API para obtener las solicitudes del usuario
                const response = await fetch(`/api/prestamos/admin/usuarios/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const data = await response.json();
                setTodas(data || []);
            }
            // Manejar errores en la solicitud
            catch (error) {
                console.error("Error al obtener solicitudes: ", error);
            }
        };

        obtenerPrestamos();
    }, [id]);

    // Función para capitalizar el estado del préstamo
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

    return (
        <>
            <Header_Admin />
            <div className="inicio-container">
                <DataTable
                    title={`Solicitudes de ${nombreUsuario}`}
                    columns={["Equipo", "Fecha Inicio", "Fecha Devolucion", "Estado"]}
                    data={todas}
                    emptyMessage="Sin solicitudes"
                    renderRow={(solicitud) => (
                        <>
                            <div>{solicitud.equipo.tipo}  {solicitud.equipo.modelo}</div>
                            <div>{new Date(solicitud.fecha_inicio).toLocaleString()}</div>
                            <div>{new Date(solicitud.fecha_devolucion).toLocaleString()}</div>
                            <div>{capitalize(solicitud.estado_prestamo)}</div>
                        </>
                    )}
                    renderExpanded={(solicitud) => (
                        <>
                            <div>
                                <strong>Fecha Aprobación:</strong>{" "}
                                {solicitud.fecha_aprobacion
                                    ? new Date(solicitud.fecha_aprobacion).toLocaleString()
                                    : "-"}
                            </div>
                            <div>
                                <strong>Fecha Devuelto:</strong>{" "}
                                {solicitud.fecha_devuelto
                                    ? new Date(solicitud.fecha_devuelto).toLocaleString()
                                    : "-"}
                            </div>
                        </>
                    )}
                />
            </div>
        </>
    );
}

export default Registro_Usuarios;