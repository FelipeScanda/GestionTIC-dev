import Header_User from "../components/Header_User/Header_User";
import { useState } from "react";
import { useEffect } from "react";
import DataTable from "../components/Data_Table/Data_Table";

function Solicitudes_Usuario() {
    // Estado para almacenar las solicitudes del usuario
    const [todas, setTodas] = useState([]);

    // useEffect para obtener las solicitudes del usuario al cargar el componente
    useEffect(() => {
        const obtenerPrestamos = async () => {
            try {
                // Obtener el token de autenticación del localStorage
                const token = localStorage.getItem("token");

                // Realizar la solicitud a la API para obtener las solicitudes del usuario
                const response = await fetch("/api/prestamos/user/todos", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                // Verificar si la respuesta es exitosa
                const data = await response.json();

                setTodas(data || []);
            }
            // Manejo de errores en caso de que la solicitud falle
            catch (error) {
                console.error("Error al obtener solicitudes: ", error);
            }
        }

        obtenerPrestamos();
    }, []);

    // Función para capitalizar el estado del préstamo
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

    return (
        <>
            <Header_User />
            <div className="inicio-container">
                <DataTable
                    title="Mis Solicitudes"
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

export default Solicitudes_Usuario;