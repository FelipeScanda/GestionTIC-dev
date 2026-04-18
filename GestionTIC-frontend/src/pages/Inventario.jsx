import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header_Admin from "../components/Header_Admin/Header_Admin";
import DataTable from "../components/Data_Table/Data_Table";
import Button from "../components/Button/Button";
import Modal from "../components/Modal/Modal";
import AlertModal from "../components/AlertModal/AlertModal";
import "./Inventario.css";

function Inventario() {
    // Estado para almacenar los equipos, controlar la apertura del modal, el modo de edición, el equipo seleccionado, la confirmación y los errores
    const [equipos, setEquipos] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });
    const [search, setSearch] = useState("");
    const [formValues, setFormValues] = useState({});
    const navigate = useNavigate();

    // Función para obtener los equipos desde la API
    const obtenerEquipos = async () => {
        try {
            // Obtener el token de autenticación del localStorage
            const token = localStorage.getItem("token");

            // Realizar la solicitud a la API para obtener los equipos, incluyendo el token en los headers
            const response = await fetch("/api/equipos", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Verificar si la respuesta es exitosa
            const data = await response.json();
            setEquipos(data);

        }
        // Manejar cualquier error que ocurra durante la solicitud
        catch (error) {
            console.error("Error obteniendo equipos:", error);
        }
    };

    // Utilizar useEffect para cargar los equipos al montar el componente
    useEffect(() => {
        obtenerEquipos();
    }, []);

    const columns = ["ID", "Tipo", "Modelo", "Estado"];

    const fields = [
        {
            name: "tipo",
            label: "Tipo",
            type: "text",
            required: true
        },
        {
            name: "modelo",
            label: "Modelo",
            type: "text",
            required: true
        },
        {
            name: "estado",
            label: "Estado",
            type: "select",
            options: [
                { value: "DISPONIBLE", label: "Disponible" },
                { value: "MANTENIMIENTO", label: "Mantenimiento" }
            ],
            required: true
        }
    ];

    // Función para manejar el envío del formulario de creación/edición de equipo
    const handleSubmitEquipo = async (data) => {
        setFormValues(data);
        try {
            // Obtener el token de autenticación del localStorage
            const token = localStorage.getItem("token");

            // Determinar la URL y el método HTTP según si estamos en modo edición o creación
            const url = modoEdicion
                ? `/api/equipos/modificar/${equipoSeleccionado.id_equipo}`
                : "/api/equipos/crear";

            const method = modoEdicion ? "PUT" : "POST";

            // Realizar la solicitud a la API para crear o modificar el equipo, incluyendo el token en los headers y los datos en el body
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            // Verificar si la respuesta es exitosa
            if (!response.ok) {
                throw new Error("Error al guardar equipo");
            }

            setConfirmOpen(true);
            obtenerEquipos();

        }
        // Manejar cualquier error que ocurra durante la solicitud
        catch (error) {
            console.error(error);
            setErrorModal({
                isOpen: true,
                message: "Error al guardar el equipo"
            });
        }

        // Cerrar el modal y resetear el estado de edición y equipo seleccionado
        setModalOpen(false);
        setModoEdicion(false);
        setEquipoSeleccionado(null);
    };

    // Filtrar los equipos según el término de búsqueda ingresado por el usuario
    const equiposFiltrados = equipos.filter((equipo) =>
        `${equipo.id_equipo} ${equipo.tipo} ${equipo.modelo} ${equipo.estado}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    // Función para capitalizar el estado del equipo (por ejemplo, "DISPONIBLE" a "Disponible")
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

    return (
        <>
            <Header_Admin />

            <div className="inicio-container">

                <div className="inventario-actions">
                    <Button
                        onClick={() => {
                            setModoEdicion(false);
                            setEquipoSeleccionado(null);
                            setModalOpen(true);
                        }}
                    >
                        Añadir equipo
                    </Button>
                </div>

                <DataTable
                    title="Inventario de Equipos"
                    columns={columns}
                    data={equiposFiltrados}
                    search={search}
                    setSearch={setSearch}
                    emptyMessage="No hay equipos registrados"
                    renderRow={(equipo) => (
                        <>
                            <div>{equipo.id_equipo}</div>
                            <div>{equipo.tipo}</div>
                            <div>{equipo.modelo}</div>
                            <div>{capitalize(equipo.estado)}</div>
                        </>
                    )}

                    renderExpanded={(equipo) => (
                        <div className="inventario-expanded-actions">

                            <Button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setModoEdicion(true);
                                    setEquipoSeleccionado(equipo);
                                    setModalOpen(true);
                                }}
                            >
                                Editar
                            </Button>

                            <Button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/admin/inventario/${equipo.id_equipo}`, {
                                        state: {
                                            nombre: `${equipo.tipo} ${equipo.modelo}`
                                        }
                                    });
                                }}
                            >
                                Ver solicitudes
                            </Button>

                        </div>
                    )}
                />

            </div>

            <Modal
                isOpen={modalOpen}
                title={
                    modoEdicion
                        ? `Editar equipo: ${equipoSeleccionado?.tipo}`
                        : "Añadir equipo"
                }
                fields={fields}
                initialValues={
                    modoEdicion
                        ? {
                            tipo: formValues.tipo ?? equipoSeleccionado?.tipo ?? "",
                            modelo: formValues.modelo ?? equipoSeleccionado?.modelo ?? "",
                            estado: formValues.estado ?? equipoSeleccionado?.estado ?? "DISPONIBLE"
                        }
                        : {
                            tipo: formValues.tipo ?? "",
                            modelo: formValues.modelo ?? "",
                            estado: formValues.estado ?? "DISPONIBLE"
                        }
                }
                onClose={() => {
                    setFormValues({});
                    setModalOpen(false);
                    setModoEdicion(false);
                    setEquipoSeleccionado(null);
                }}
                onSubmit={handleSubmitEquipo}
                submitText={modoEdicion ? "Guardar cambios" : "Crear equipo"}
                cancelText="Cancelar"
            />

            <AlertModal
                isOpen={confirmOpen}
                type="success"
                message="Operación realizada correctamente"
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

export default Inventario;