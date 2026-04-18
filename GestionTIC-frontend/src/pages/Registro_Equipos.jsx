import Header_Admin from "../components/Header_Admin/Header_Admin";
import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import DataTable from "../components/Data_Table/Data_Table";

function Registro_Equipos() {
    // Estado para almacenar todas las solicitudes del equipo
    const [todas, setTodas] = useState([]);
    const { id } = useParams();
    const location = useLocation();
    const nombreEquipo = location.state?.nombre || "Equipo";

    // Cargar las solicitudes del equipo al montar el componente
    useEffect(() => {

        const obtenerPrestamos = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await fetch(`/api/equipos/admin/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const data = await response.json();
                setTodas(data || []);
            } catch (error) {
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
                    title={`Historial de ${nombreEquipo}`}
                    columns={["Usuario", "Fecha Inicio", "Fecha Devolucion", "Estado"]}
                    data={todas}
                    emptyMessage="Sin solicitudes"
                    renderRow={(solicitud) => (
                        <>
                            <div>{solicitud.usuario.nombre}</div>
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

export default Registro_Equipos;