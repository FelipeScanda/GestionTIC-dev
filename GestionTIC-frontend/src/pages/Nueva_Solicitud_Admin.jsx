import { useEffect, useState } from "react";
import Header_Admin from "../components/Header_Admin/Header_Admin";
import DataTable from "../components/Data_Table/Data_Table";
import Button from "../components/Button/Button";
import Modal from "../components/Modal/Modal";
import AlertModal from "../components/AlertModal/AlertModal";

function Nueva_Solicitud_Admin() {
    // Estado para almacenar los equipos disponibles
    const [equipos, setEquipos] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });
    const [usuarios, setUsuarios] = useState([]);
    const [formValues, setFormValues] = useState({});

    // Obtener la fecha y hora actual en formato compatible con datetime-local
    const now = new Date().toISOString().slice(0, 16);

    // Cargar los equipos disponibles y usuarios al montar el componente
    useEffect(() => {

        const token = localStorage.getItem("token");

        const obtenerDatos = async () => {
            try {
                // Realizar ambas solicitudes en paralelo
                const [equiposRes, usuariosRes] = await Promise.all([
                    fetch("/api/equipos/disponibles", {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    fetch("/api/usuarios", {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                // Procesar la respuesta de equipos
                const equiposData = equiposRes.ok ? await equiposRes.json() : [];
                setEquipos(equiposData);

                // Procesar la respuesta de usuarios
                if (usuariosRes.ok) {
                    const usuariosData = await usuariosRes.json();

                    setUsuarios(
                        usuariosData.map((u) => ({
                            value: u.id_usuario,
                            label: u.nombre
                        }))
                    );
                } else {
                    console.error("No se pudieron cargar los usuarios");
                }

            }
            // Manejo de errores
            catch (error) {
                console.error("Error cargando datos:", error);
            }
        };

        obtenerDatos();

    }, []);

    const columns = [
        "Tipo",
        "Modelo",
        "Estado",
        "Acción"
    ];

    const fields = [
        {
            name: "usuario_id",
            label: "Usuario",
            type: "search-select",
            placeholder: "Buscar usuario...",
            options: usuarios,
            required: true
        },
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
        // Actualizar los valores del formulario en el estado
        setFormValues(data);

        // Validar que se haya seleccionado un usuario y que las fechas sean válidas
        const inicio = new Date(data.fecha_inicio);
        const devolucion = new Date(data.fecha_devolucion);

        // Validaciones
        if (!data.usuario_id) {
            setErrorModal({
                isOpen: true,
                message: "Debe seleccionar un usuario."
            });
            return;
        }

        // Validar que ambas fechas estén presentes
        if (!data.fecha_inicio || !data.fecha_devolucion) {
            setErrorModal({
                isOpen: true,
                message: "Debe ingresar ambas fechas."
            });
            return;
        }

        // Validar que la fecha de inicio no sea anterior a la fecha actual
        if (devolucion <= inicio) {
            setErrorModal({
                isOpen: true,
                message: "La fecha de devolución debe ser posterior a la fecha de inicio."
            });
            return;
        }

        try {
            // Obtener el token de autenticación
            const token = localStorage.getItem("token");

            // Realizar la solicitud POST para crear el préstamo
            const response = await fetch("/api/prestamos/admin/crear-prestamo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    usuario_id: data.usuario_id,
                    equipo_id: equipoSeleccionado?.id_equipo,
                    fecha_inicio: data.fecha_inicio,
                    fecha_devolucion: data.fecha_devolucion
                })
            });

            // Manejar la respuesta de la API
            if (!response.ok) {
                const errorData = await response.json();
                setErrorModal({
                    isOpen: true,
                    message: errorData.message || "No se pudo crear el préstamo"
                });
                return;
            }

            // Mostrar mensaje de éxito
            setConfirmOpen(true);

        }
        // Manejo de errores
        catch (error) {
            console.error("Error creando préstamo:", error);
            setErrorModal({
                isOpen: true,
                message: "Error al crear el préstamo"
            });
        }

        // Cerrar el modal y limpiar el equipo seleccionado
        setModalOpen(false);
        setEquipoSeleccionado(null);
    };

    return (
        <>
            <Header_Admin />

            <div className="inicio-container">

                <DataTable
                    title="Equipos Disponibles"
                    columns={columns}
                    data={equipos}
                    emptyMessage="No hay equipos disponibles"
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
                                    Crear solicitud
                                </Button>
                            </div>
                        </>
                    )}
                />

            </div>

            <Modal
                isOpen={modalOpen}
                title={`Crear solicitud: ${equipoSeleccionado?.tipo + " " + equipoSeleccionado?.modelo || ""}`}
                fields={fields}
                initialValues={{
                    usuario_id: formValues.usuario_id ?? "",
                    fecha_inicio: formValues.fecha_inicio ?? "",
                    fecha_devolucion: formValues.fecha_devolucion ?? ""
                }}
                onClose={() => {
                    setFormValues({});
                    setModalOpen(false);
                    setEquipoSeleccionado(null);
                }}
                onSubmit={handleSubmitSolicitud}
                submitText="Crear solicitud"
                cancelText="Cancelar"
            />

            <AlertModal
                isOpen={confirmOpen}
                type="success"
                message="Solicitud creada correctamente."
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

export default Nueva_Solicitud_Admin;