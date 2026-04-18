import { useEffect, useState } from "react";
import Header_User from "../components/Header_User/Header_User";
import DataTable from "../components/Data_Table/Data_Table";
import Button from "../components/Button/Button";
import Modal from "../components/Modal/Modal";
import AlertModal from "../components/AlertModal/AlertModal";

function Nueva_Solicitud_Usuario() {
    // Estado para almacenar los equipos disponibles
    const [equipos, setEquipos] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });
    const [formValues, setFormValues] = useState({});
    const now = new Date().toISOString().slice(0, 16);

    // Cargar los equipos disponibles al montar el componente
    useEffect(() => {
        const obtenerEquipos = async () => {
            try {
                // Obtener el token del localStorage
                const token = localStorage.getItem("token");

                // Realizar la solicitud para obtener los equipos disponibles
                const response = await fetch("/api/equipos/disponibles", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    }
                });

                // Verificar si la respuesta es exitosa
                const data = await response.json();

                setEquipos(data);
            }
            // Manejo de errores
            catch (error) {
                console.error("Error al obtener equipos disponibles:", error);
            }
        };

        obtenerEquipos();
    }, []);

    const columns = [
        "Tipo",
        "Modelo",
        "Estado",
        "Acción"
    ];

    const fields = [
        {
            name: "fecha_inicio",
            label: "Fecha de inicio",
            type: "datetime-local",
            min: now,
            required: true
        },
        {
            name: "fecha_devolucion",
            label: "Fecha de devolución",
            type: "datetime-local",
            min: now,
            required: true
        }
    ];

    // Función para manejar el envío del formulario de solicitud
    const handleSubmitSolicitud = async (data) => {
        setFormValues(data);

        // Validar las fechas antes de enviar la solicitud
        const inicio = new Date(data.fecha_inicio);
        const devolucion = new Date(data.fecha_devolucion);

        // Validaciones
        if (!data.fecha_inicio || !data.fecha_devolucion) {
            setErrorModal({
                isOpen: true,
                message: "Debe ingresar ambas fechas."
            });
            return;
        }

        // Validar que la fecha de devolución sea posterior a la fecha de inicio
        if (devolucion <= inicio) {
            setErrorModal({
                isOpen: true,
                message: "La fecha de devolución debe ser posterior a la fecha de inicio."
            });
            return;
        }

        // Validar que la fecha de inicio no sea en el pasado
        if (inicio < new Date()) {
            setErrorModal({
                isOpen: true,
                message: "La fecha de inicio no puede ser en el pasado."
            });
            return;
        }

        try {
            // Obtener el token del localStorage
            const token = localStorage.getItem("token");

            // Realizar la solicitud para crear la solicitud de préstamo
            const response = await fetch("/api/prestamos/user/crear-prestamo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    equipo_id: equipoSeleccionado?.id_equipo,
                    fecha_inicio: data.fecha_inicio,
                    fecha_devolucion: data.fecha_devolucion
                })
            });

            // Verificar si la respuesta es exitosa
            if (!response.ok) {
                const errorData = await response.json();
                setErrorModal({
                    isOpen: true,
                    message: errorData.message || "No se pudo crear la solicitud"
                });
                return;
            }

            // Mostrar mensaje de éxito
            setConfirmOpen(true);

        }
        // Manejo de errores
        catch (error) {
            console.error("Error creando solicitud:", error);
            setErrorModal({
                isOpen: true,
                message: "Error al crear la solicitud"
            });
        }

        // Cerrar el modal y limpiar el equipo seleccionado
        setModalOpen(false);
        setEquipoSeleccionado(null);
    };

    return (
        <>
            <Header_User />

            <div className="inicio-container">

                <DataTable
                    title="Equipos Disponibles"
                    columns={columns}
                    data={equipos}
                    emptyMessage="No hay equipos registrados"
                    renderRow={(equipo) => (
                        <>
                            <div>{equipo.tipo}</div>
                            <div>{equipo.modelo}</div>
                            <div>{equipo.estado}</div>

                            <div>
                                <Button
                                    disabled={equipo.estado !== "DISPONIBLE"}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEquipoSeleccionado(equipo);
                                        setModalOpen(true);
                                    }}
                                >
                                    Solicitar
                                </Button>
                            </div>
                        </>
                    )}
                />

            </div>

            <Modal
                isOpen={modalOpen}
                title={`Solicitar equipo: ${equipoSeleccionado?.tipo + " " + equipoSeleccionado?.modelo || ""}`}
                fields={fields}
                initialValues={{
                    fecha_inicio: formValues.fecha_inicio ?? "",
                    fecha_devolucion: formValues.fecha_devolucion ?? ""
                }}
                onClose={() => {
                    setFormValues({});
                    setModalOpen(false);
                    setEquipoSeleccionado(null);
                }}
                onSubmit={handleSubmitSolicitud}
                submitText="Enviar solicitud"
                cancelText="Cancelar"
            />

            <AlertModal
                isOpen={confirmOpen}
                type="success"
                message="Tu solicitud fue enviada correctamente y será revisada por un administrador."
                onClose={() => setConfirmOpen(false)}
            />
            <AlertModal
                isOpen={errorModal.isOpen}
                type="error"
                message={errorModal.message}
                onClose={() => setErrorModal({ isOpen: false, message: "" })}
            />
        </>
    );
}

export default Nueva_Solicitud_Usuario;