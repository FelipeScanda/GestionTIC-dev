import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header_Admin from "../components/Header_Admin/Header_Admin";
import DataTable from "../components/Data_Table/Data_Table";
import Button from "../components/Button/Button";
import Modal from "../components/Modal/Modal";
import AlertModal from "../components/AlertModal/AlertModal";
import "./Usuarios.css";

function Usuarios() {
    // Estados para manejar la lista de usuarios, modales y formularios
    const [usuarios, setUsuarios] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });
    const [search, setSearch] = useState("");
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [formValues, setFormValues] = useState({});
    const navigate = useNavigate();

    // Función para obtener la lista de usuarios desde la API
    const obtenerUsuarios = async () => {
        try {
            // Obtener el token de autenticación del localStorage
            const token = localStorage.getItem("token");

            // Realizar la solicitud a la API para obtener la lista de usuarios
            const response = await fetch("/api/usuarios/todos", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Verificar si la respuesta es exitosa
            const data = await response.json();
            setUsuarios(data);

        }
        // Manejo de errores en caso de que la solicitud falle
        catch (error) {
            console.error("Error obteniendo usuarios:", error);
        }
    };

    // useEffect para obtener la lista de usuarios al cargar el componente
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        obtenerUsuarios();
    }, []);

    const columns = ["Nombre", "RUT", "Email", "Rol", "Estado"];

    const fields = [
        {
            name: "nombre",
            label: "Nombre",
            type: "text",
            required: true
        },
        {
            name: "rut",
            label: "RUT",
            type: "text",
            required: true
        },
        {
            name: "email",
            label: "Email",
            type: "email",
            required: true
        },
        {
            name: "password",
            label: "Contraseña",
            type: "password",
            required: true
        },
        {
            name: "rol_usuario",
            label: "Rol",
            type: "select",
            options: [
                { value: "USER", label: "Usuario" },
                { value: "ADMIN", label: "Administrador" }
            ],
            required: true
        },
        {
            name: "estado",
            label: "Estado",
            type: "select",
            options: [
                { value: "ACTIVO", label: "Activo" },
                { value: "INACTIVO", label: "Inactivo" }
            ],
            required: true
        }
    ];

    // Función para manejar el envío del formulario de creación/edición de usuario
    const handleSubmitUsuario = async (data) => {
        setFormValues(data);
        // Validación de campos requeridos
        if (!modoEdicion && data.password && data.password.length < 6) {
            setErrorModal({
                isOpen: true,
                message: "La contraseña debe tener al menos 6 caracteres"
            });
            return;
        }
        try {
            // Obtener el token de autenticación del localStorage
            const token = localStorage.getItem("token");

            // Determinar la URL y el método HTTP según si estamos en modo edición o creación
            const url = modoEdicion
                ? `/api/usuarios/modificar/${usuarioSeleccionado.id_usuario}`
                : "/api/usuarios/crear";

            // Para edición, no se envía el campo de contraseña si está vacío
            const method = modoEdicion ? "PUT" : "POST";

            // Si estamos en modo edición y el campo de contraseña está vacío, no lo incluimos en el body
            const bodyData = modoEdicion
                // eslint-disable-next-line no-unused-vars
                ? (({ password, ...rest }) => rest)(data)
                : data;

            // Realizar la solicitud a la API para crear o modificar el usuario
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(bodyData)
            });

            // Verificar si la respuesta es exitosa
            if (!response.ok) {
                const errorData = await response.json();
                setErrorModal({
                    isOpen: true,
                    message: errorData.message || "Error al guardar usuario"
                });
                return;
            }

            // Mostrar mensaje de éxito y actualizar la lista de usuarios
            setConfirmOpen(true);
            obtenerUsuarios();

        }
        // Manejo de errores en caso de que la solicitud falle
        catch (error) {
            console.error(error);
            setErrorModal({
                isOpen: true,
                message: error.message || "Error al guardar el usuario"
            });
        }

        // Cerrar el modal y resetear el estado de edición
        setModalOpen(false);
        setModoEdicion(false);
        setUsuarioSeleccionado(null);
    };

    // Función para manejar el cambio de contraseña de un usuario
    const handleChangePassword = async (data) => {
        // Validación de campos de contraseña
        if (!data.password || !data.confirmPassword) {
            setErrorModal({
                isOpen: true,
                message: "Debe completar ambos campos de contraseña"
            });
            return;
        }

        // Validación de longitud de contraseña
        if (data.password.length < 6) {
            setErrorModal({
                isOpen: true,
                message: "La contraseña debe tener al menos 6 caracteres"
            });
            return;
        }

        // Validación de coincidencia de contraseñas
        if (data.password !== data.confirmPassword) {
            setErrorModal({
                isOpen: true,
                message: "Las contraseñas no coinciden"
            });
            return;
        }

        try {
            // Obtener el token de autenticación del localStorage
            const token = localStorage.getItem("token");

            // Realizar la solicitud a la API para cambiar la contraseña del usuario seleccionado
            const response = await fetch(`/api/usuarios/password/${usuarioSeleccionado?.id_usuario}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ password: data.password })
            });

            // Verificar si la respuesta es exitosa
            if (!response.ok) {
                const errorData = await response.json();
                setErrorModal({
                    isOpen: true,
                    message: errorData.message || "Error al cambiar contraseña"
                });
                return;
            }

            // Mostrar mensaje de éxito
            setConfirmOpen(true);
            setPasswordModalOpen(false);

        }
        // Manejo de errores en caso de que la solicitud falle
        catch (error) {
            console.error(error);
            setErrorModal({
                isOpen: true,
                message: error.message || "Error al cambiar la contraseña"
            });
        }
    };

    // Filtrar usuarios según el término de búsqueda ingresado
    const usuariosFiltrados = usuarios.filter((usuario) =>
        `${usuario.nombre} ${usuario.rut} ${usuario.email} ${usuario.rol_usuario} ${usuario.estado}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    // Función para capitalizar el rol y estado del usuario
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

    return (
        <>
            <Header_Admin />

            <div className="inicio-container">

                <div className="usuarios-actions">
                    <Button
                        onClick={() => {
                            setModoEdicion(false);
                            setUsuarioSeleccionado(null);
                            setModalOpen(true);
                        }}
                    >
                        Añadir usuario
                    </Button>

                </div>

                <DataTable
                    title="Usuarios"
                    columns={columns}
                    data={usuariosFiltrados}
                    search={search}
                    emptyMessage="No hay usuarios registrados"
                    setSearch={setSearch}
                    renderRow={(usuario) => (
                        <>
                            <div>{usuario.nombre}</div>
                            <div>{usuario.rut}</div>
                            <div>{usuario.email}</div>
                            <div>{capitalize(usuario.rol_usuario)}</div>
                            <div>{capitalize(usuario.estado)}</div>
                        </>
                    )}

                    renderExpanded={(usuario) => (
                        <div className="usuarios-expanded-actions">

                            <Button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setModoEdicion(true);
                                    setUsuarioSeleccionado(usuario);
                                    setModalOpen(true);
                                }}
                            >
                                Editar
                            </Button>

                            <Button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setUsuarioSeleccionado(usuario);
                                    setPasswordModalOpen(true);
                                }}
                            >
                                Cambiar contraseña
                            </Button>

                            <Button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/admin/usuarios/${usuario.id_usuario}`, {
                                        state: { nombre: usuario.nombre }
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
                        ? `Editar usuario: ${usuarioSeleccionado?.nombre}`
                        : "Añadir usuario"
                }
                fields={
                    modoEdicion
                        ? fields.filter(f => f.name !== "password")
                        : fields
                }
                initialValues={
                    modoEdicion
                        ? {
                            nombre: formValues.nombre ?? usuarioSeleccionado?.nombre ?? "",
                            rut: formValues.rut ?? usuarioSeleccionado?.rut ?? "",
                            email: formValues.email ?? usuarioSeleccionado?.email ?? "",
                            rol_usuario: formValues.rol_usuario ?? usuarioSeleccionado?.rol_usuario ?? "USER",
                            estado: formValues.estado ?? usuarioSeleccionado?.estado ?? "ACTIVO"
                        }
                        : {
                            nombre: formValues.nombre ?? "",
                            rut: formValues.rut ?? "",
                            email: formValues.email ?? "",
                            password: formValues.password ?? "",
                            rol_usuario: formValues.rol_usuario ?? "USER",
                            estado: formValues.estado ?? "ACTIVO"
                        }
                }
                onClose={() => {
                    setFormValues({});
                    setModalOpen(false);
                    setModoEdicion(false);
                    setUsuarioSeleccionado(null);
                }}
                onSubmit={handleSubmitUsuario}
                submitText={modoEdicion ? "Guardar cambios" : "Crear usuario"}
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

            <Modal
                isOpen={passwordModalOpen}
                title={`Cambiar contraseña: ${usuarioSeleccionado?.nombre || ""}`}
                fields={[
                    {
                        name: "password",
                        label: "Nueva contraseña",
                        type: "password",
                        required: true
                    },
                    {
                        name: "confirmPassword",
                        label: "Confirmar contraseña",
                        type: "password",
                        required: true
                    }
                ]}
                initialValues={{
                    password: "",
                    confirmPassword: ""
                }}
                onClose={() => {
                    setPasswordModalOpen(false);
                }}
                onSubmit={(data) => handleChangePassword(data)}
                submitText="Cambiar contraseña"
                cancelText="Cancelar"
            />
        </>
    );
}

export default Usuarios;