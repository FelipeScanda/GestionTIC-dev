import { useState } from "react";
import Header_Admin from "../components/Header_Admin/Header_Admin";
import "./Inicio_Admin.css";
import { useEffect } from "react";
import Button from "../components/Button/Button";
import { useNavigate } from "react-router-dom";
import DataTable from "../components/Data_Table/Data_Table";
import socket from "../socket/socket";
import AlertModal from "../components/AlertModal/AlertModal";
import ConfirmModal from "../components/ConfirmModal/ConfirmModal";

function Inicio_Admin() {
    // Estados para solicitudes pendientes y aprobadas
    const [pendientes, setPendientes] = useState([]);
    const [aprobadas, setAprobadas] = useState([]);

    // Estado para alertas y confirmaciones
    const [alert, setAlert] = useState({
        isOpen: false,
        message: "",
        type: "success"
    });

    // Estado para confirmación de acciones
    const [confirm, setConfirm] = useState({
        isOpen: false,
        message: "",
        onConfirm: null
    });

    // Efecto para obtener las solicitudes al cargar el componente
    useEffect(() => {
        const obtenerPrestamos = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await fetch("/api/prestamos/admin", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const data = await response.json();

                setPendientes(data.pendientes || []);
                setAprobadas(data.aprobados || []);
            }
            catch (error) {
                console.error("Error al obtener solicitudes: ", error);
            }
        }

        obtenerPrestamos();
    }, []);

    // Configuración de WebSocket para actualizaciones en tiempo real
    useEffect(() => {
        socket.on("connect", () => { });

        // evitar duplicados si el componente se vuelve a montar
        socket.off("prestamo_creado");
        socket.off("prestamo_actualizado");

        // Escuchar eventos de creación y actualización de préstamos
        socket.on("prestamo_creado", (prestamo) => {
            setPendientes(prev => [prestamo, ...prev]);
        });

        // Manejar actualizaciones de préstamos
        socket.on("prestamo_actualizado", (prestamo) => {
            if (prestamo.estado_prestamo === "APROBADO") {
                setPendientes(prev => prev.filter(p => p.id_prestamo !== prestamo.id_prestamo));
                setAprobadas(prev => [prestamo, ...prev]);
            }

            if (prestamo.estado_prestamo === "RECHAZADO") {
                setPendientes(prev => prev.filter(p => p.id_prestamo !== prestamo.id_prestamo));
            }

            if (prestamo.estado_prestamo === "CANCELADO") {
                setPendientes(prev => prev.filter(p => p.id_prestamo !== prestamo.id_prestamo));
                setAprobadas(prev =>
                    prev.filter(p => p.id_prestamo !== prestamo.id_prestamo)
                );
            }

            if (prestamo.estado_prestamo === "DEVUELTO") {
                setAprobadas(prev =>
                    prev.filter(p => p.id_prestamo !== prestamo.id_prestamo)
                );
            }
        });

        // Limpiar listeners al desmontar el componente
        return () => {
            socket.off("prestamo_creado");
            socket.off("prestamo_actualizado");
        };

    }, []);

    // Función para capitalizar el estado del préstamo
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

    // Navegación
    const navigate = useNavigate();

    // Funciones para aprobar, rechazar, marcar como devuelto y cancelar solicitudes
    const aprobarSolicitud = async (id) => {
        setConfirm({
            isOpen: true,
            message: "¿Deseas aprobar esta solicitud?",
            onConfirm: async () => {
                try {
                    const token = localStorage.getItem("token");

                    const res = await fetch(`/api/prestamos/${id}/aprobar`, {
                        method: "PATCH",
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });

                    if (!res.ok) throw new Error();

                    setAlert({
                        isOpen: true,
                        message: "Solicitud aprobada correctamente",
                        type: "success"
                    });

                } catch {
                    setAlert({
                        isOpen: true,
                        message: "Error al aprobar la solicitud",
                        type: "error"
                    });
                } finally {
                    setConfirm(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    // Función para rechazar una solicitud
    const rechazarSolicitud = async (id) => {
        setConfirm({
            isOpen: true,
            message: "¿Deseas rechazar esta solicitud?",
            onConfirm: async () => {
                try {
                    // Obtener token de autenticación
                    const token = localStorage.getItem("token");

                    // Realizar la solicitud PATCH para rechazar el préstamo
                    const res = await fetch(`/api/prestamos/${id}/rechazar`, {
                        method: "PATCH",
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });

                    // Verificar si la respuesta es exitosa
                    if (!res.ok) throw new Error();

                    // Mostrar alerta de éxito
                    setAlert({
                        isOpen: true,
                        message: "Solicitud rechazada correctamente",
                        type: "success"
                    });

                }
                // Manejar errores y mostrar alerta de error
                catch {
                    setAlert({
                        isOpen: true,
                        message: "Error al rechazar la solicitud",
                        type: "error"
                    });
                } finally {
                    setConfirm(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    // Función para marcar una solicitud como devuelta
    const marcarComoDevuelto = async (id) => {
        setConfirm({
            isOpen: true,
            message: "¿Deseas marcar como devuelto?",
            onConfirm: async () => {
                try {
                    // Obtener token de autenticación
                    const token = localStorage.getItem("token");

                    // Realizar la solicitud PUT para marcar el préstamo como devuelto
                    const res = await fetch(`/api/prestamos/admin/devolver/${id}`, {
                        method: "PUT",
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });

                    // Verificar si la respuesta es exitosa
                    if (!res.ok) throw new Error();

                    // Mostrar alerta de éxito
                    setAlert({
                        isOpen: true,
                        message: "Equipo marcado como devuelto",
                        type: "success"
                    });

                }
                // Manejar errores y mostrar alerta de error
                catch {
                    setAlert({
                        isOpen: true,
                        message: "Error al marcar como devuelto",
                        type: "error"
                    });
                } finally {
                    setConfirm(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    // Función para cancelar una solicitud aprobada
    const cancelarSolicitudAdmin = async (id) => {
        setConfirm({
            isOpen: true,
            message: "¿Deseas cancelar esta solicitud?",
            onConfirm: async () => {
                try {
                    // Obtener token de autenticación
                    const token = localStorage.getItem("token");

                    // Realizar la solicitud PUT para cancelar el préstamo
                    const res = await fetch(`/api/prestamos/admin/cancelar/${id}`, {
                        method: "PUT",
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });

                    //
                    if (!res.ok) throw new Error();

                    // Mostrar alerta de éxito
                    setAlert({
                        isOpen: true,
                        message: "Solicitud cancelada correctamente",
                        type: "success"
                    });

                }
                // Manejar errores y mostrar alerta de error
                catch {
                    setAlert({
                        isOpen: true,
                        message: "Error al cancelar la solicitud",
                        type: "error"
                    });
                } finally {
                    setConfirm(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    return (
        <>
            <Header_Admin />
            <div className="inicio-container">
                <div className="nueva-solicitud-container">
                    <Button onClick={() => navigate("/admin/nueva-solicitud")}>
                        Nueva Solicitud
                    </Button>
                </div>
                <DataTable
                    title="Solicitudes Pendientes"
                    columns={["Nombre", "Equipo", "Fecha Inicio", "Fecha Devolucion", "Acciones"]}
                    data={pendientes}
                    emptyMessage="Sin solicitudes"
                    renderRow={(solicitud) => (
                        <>
                            <div>{solicitud.usuario?.nombre || "Usuario"}</div>
                            <div>{solicitud.equipo?.tipo} {solicitud.equipo?.modelo}</div>
                            <div>{new Date(solicitud.fecha_inicio).toLocaleString()}</div>
                            <div>{new Date(solicitud.fecha_devolucion).toLocaleString()}</div>
                            <div className="acciones">
                                <Button variant="cancelar" onClick={() => rechazarSolicitud(solicitud.id_prestamo)}>Rechazar</Button>
                                <Button variant="aceptar" onClick={() => aprobarSolicitud(solicitud.id_prestamo)}>Aceptar</Button>
                            </div>
                        </>
                    )}
                />

                <DataTable
                    title="Solicitudes Aprobadas"
                    columns={["Nombre", "Equipo", "Fecha Inicio", "Fecha Devolucion", "Estado"]}
                    data={aprobadas}
                    emptyMessage="Sin solicitudes"
                    renderRow={(solicitud) => (
                        <>
                            <div>{solicitud.usuario?.nombre || "Usuario"}</div>
                            <div>{solicitud.equipo?.tipo} {solicitud.equipo?.modelo}</div>
                            <div>{new Date(solicitud.fecha_inicio).toLocaleString()}</div>
                            <div>{new Date(solicitud.fecha_devolucion).toLocaleString()}</div>
                            <div>{capitalize(solicitud.estado_prestamo)}</div>
                        </>
                    )}
                    renderExpanded={(solicitud) => (
                        <div style={{ position: "relative" }}>
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

                            {solicitud.estado_prestamo === "APROBADO" && !solicitud.fecha_devuelto && (
                                <div style={{ position: "absolute", right: 0, top: 0, display: "flex", gap: "8px" }}>
                                    <Button
                                        variant="cancelar"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            cancelarSolicitudAdmin(solicitud.id_prestamo);
                                        }}
                                    >
                                        Cancelar solicitud
                                    </Button>

                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            marcarComoDevuelto(solicitud.id_prestamo);
                                        }}
                                    >
                                        Marcar como devuelto
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                />

                <div className="ver-todas-container">
                    <Button className="btn-ver-todas" onClick={() => navigate("/admin/solicitudes")}>
                        Ver Todas las Solicitudes
                    </Button>
                </div>
            </div>
            <AlertModal
                isOpen={alert.isOpen}
                message={alert.message}
                type={alert.type}
                onClose={() => setAlert(prev => ({ ...prev, isOpen: false }))}
            />
            <ConfirmModal
                isOpen={confirm.isOpen}
                message={confirm.message}
                onConfirm={confirm.onConfirm}
                onCancel={() => setConfirm(prev => ({ ...prev, isOpen: false }))}
            />
        </>
    );
};

export default Inicio_Admin;