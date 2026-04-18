import Header_Admin from "../components/Header_Admin/Header_Admin";
import { useState } from "react";
import { useEffect } from "react";
import DataTable from "../components/Data_Table/Data_Table";

function Solicitudes_Admin() {
    // Estado para almacenar todas las solicitudes
    const [todas, setTodas] = useState([]);

    // Obtener todas las solicitudes al cargar el componente
    useEffect(() => {
        const obtenerPrestamos = async () => {
            try {
                // Obtener el token de autenticación del almacenamiento local
                const token = localStorage.getItem("token");

                // Realizar la solicitud a la API para obtener todas las solicitudes
                const response = await fetch("/api/prestamos/admin/todos", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                // Convertir la respuesta a formato JSON
                const data = await response.json();

                setTodas(data || []);
            }
            // Manejar errores en la solicitud
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
            <Header_Admin></Header_Admin>
            <div className="inicio-container">
                <DataTable
                    title="Todas las Solicitudes"
                    columns={["Nombre", "Equipo", "Fecha Inicio", "Fecha Devolucion", "Estado"]}
                    data={todas}
                    emptyMessage="Sin solicitudes"
                    renderRow={(solicitud) => (
                        <>
                            <div>{solicitud.usuario.nombre}</div>
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

export default Solicitudes_Admin;