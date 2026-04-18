import Header_User from "../components/Header_User/Header_User";
import { useEffect } from "react";
import Button from "../components/Button/Button";
import { useNavigate } from "react-router-dom";
import DataTable from "../components/Data_Table/Data_Table";
import { useState } from "react";
import socket from "../socket/socket";
import ConfirmModal from "../components/ConfirmModal/ConfirmModal";
import AlertModal from "../components/AlertModal/AlertModal";
import "./Inicio_Usuario.css";

function Inicio_Usuario() {
    // Estados para solicitudes pendientes y aprobadas
    const [pendientes, setPendientes] = useState([]);
    const [aprobadas, setAprobadas] = useState([]);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
    const [alertModal, setAlertModal] = useState({ isOpen: false, message: "", type: "success" });

    // Efecto para obtener las solicitudes del usuario al cargar el componente
    useEffect(() => {
        const obtenerPrestamos = async () => {
            try {
                // Obtener token del localStorage
                const token = localStorage.getItem("token");

                // Realizar solicitud al backend para obtener las solicitudes del usuario
                const response = await fetch("/api/prestamos/user", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                // Verificar si la respuesta es exitosa
                const data = await response.json();

                // Si la respuesta no es exitosa, mostrar error en consola
                setPendientes(data.pendientes || []);
                setAprobadas(data.aprobados || []);
            }
            // En caso de error, mostrarlo en consola
            catch (error) {
                console.error("Error al obtener solicitudes: ", error);
            }
        }

        obtenerPrestamos();
    }, []);

    // Efecto para configurar listeners de Socket.IO para actualizaciones en tiempo real
    useEffect(() => {
        socket.on("connect", () => { });

        // Evitar duplicados si el componente se vuelve a montar
        socket.off("prestamo_creado");
        socket.off("prestamo_actualizado");

        // Escuchar eventos de creación y actualización de préstamos
        socket.on("prestamo_creado", (prestamo) => {
            if (prestamo.estado_prestamo === "APROBADO") {
                setAprobadas(prev => [prestamo, ...prev]);
            } else {
                setPendientes(prev => [prestamo, ...prev]);
            }
        });

        // Escuchar actualizaciones de préstamos para moverlos entre pendientes y aprobados según su estado
        socket.on("prestamo_actualizado", (prestamo) => {
            if (prestamo.estado_prestamo === "APROBADO") {
                setPendientes(prev => prev.filter(p => p.id_prestamo !== prestamo.id_prestamo));
                setAprobadas(prev => [prestamo, ...prev]);
            }

            if (prestamo.estado_prestamo === "RECHAZADO") {
                setPendientes(prev => prev.filter(p => p.id_prestamo !== prestamo.id_prestamo));
            }

            if (prestamo.estado_prestamo === "DEVUELTO") {
                setAprobadas(prev =>
                    prev.filter(p => p.id_prestamo !== prestamo.id_prestamo)
                );
            }
        });

        // Limpiar listeners al desmontar el componente para evitar fugas de memoria
        return () => {
            socket.off("prestamo_creado");
            socket.off("prestamo_actualizado");
        };

    }, []);

    // Función para capitalizar el estado del préstamo
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

    // Hook de navegación para redirigir a otras páginas
    const navigate = useNavigate();

    // Función para manejar el clic en "Cancelar solicitud", abre el modal de confirmación
    const handleCancelarClick = (solicitud) => {
        setSolicitudSeleccionada(solicitud);
        setConfirmOpen(true);
    };

    // Función para confirmar la cancelación de la solicitud, realiza la petición al backend y actualiza el estado local
    const handleConfirmCancel = async () => {
        try {
            // Obtener token del localStorage
            const token = localStorage.getItem("token");

            // Realizar solicitud al backend para cancelar la solicitud seleccionada
            const response = await fetch(`/api/prestamos/user/cancelar/${solicitudSeleccionada.id_prestamo}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Verificar si la respuesta es exitosa, si no lo es, lanzar un error para mostrarlo en el modal de alerta
            if (!response.ok) {
                throw new Error("No se pudo cancelar la solicitud");
            }

            // Actualizar el estado local para eliminar la solicitud cancelada de la lista de pendientes
            setPendientes(prev =>
                prev.filter(p => p.id_prestamo !== solicitudSeleccionada.id_prestamo)
            );

            // Mostrar un modal de alerta indicando que la solicitud fue cancelada correctamente
            setAlertModal({
                isOpen: true,
                message: "Solicitud cancelada correctamente",
                type: "success"
            });

        }
        // En caso de error, mostrarlo en consola y mostrar un modal de alerta con el mensaje de error
        catch (error) {
            console.error("Error al cancelar solicitud:", error);

            setAlertModal({
                isOpen: true,
                message: error.message || "Error al cancelar la solicitud",
                type: "error"
            });
        }

        // Cerrar el modal de confirmación y limpiar la solicitud seleccionada
        setConfirmOpen(false);
        setSolicitudSeleccionada(null);
    };

    return (
        <>
            <Header_User />
            <div className="inicio-container">
                <div className="nueva-solicitud-container">
                    <Button onClick={() => navigate("/user/nueva-solicitud")}>
                        Nueva Solicitud
                    </Button>
                </div>
                <DataTable
                    title="Solicitudes Pendientes"
                    columns={["Equipo", "Fecha Inicio", "Fecha Devolucion", "Estado"]}
                    data={pendientes}
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
                        <div style={{ display: "flex", justifyContent: "flex-end", marginRight: "70px" }}>
                            <Button variant="cancelar" onClick={() => handleCancelarClick(solicitud)}>
                                Cancelar solicitud
                            </Button>
                        </div>
                    )}
                />

                <DataTable
                    title="Solicitudes Aprobadas"
                    columns={["Equipo", "Fecha Inicio", "Fecha Devolucion", "Estado"]}
                    data={aprobadas}
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

                <div className="ver-todas-container">
                    <Button className="btn-ver-todas" onClick={() => navigate("/user/solicitudes")}>
                        Ver Mis Solicitudes
                    </Button>
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmOpen}
                message="¿Seguro que deseas cancelar esta solicitud?"
                onConfirm={handleConfirmCancel}
                onCancel={() => setConfirmOpen(false)}
            />

            <AlertModal
                isOpen={alertModal.isOpen}
                type={alertModal.type}
                message={alertModal.message}
                onClose={() => setAlertModal({ isOpen: false, message: "", type: "success" })}
            />
        </>
    )
};

export default Inicio_Usuario;