import { useState, useEffect } from "react";
import "./Modal.css";
import Button from "../Button/Button";
import SearchSelect from "../SearchSelect/SearchSelect";

// Props:
// - isOpen: boolean
// - title: string (opcional)
// - fields: array de objetos { name, label, type, options?, placeholder? }
// - onSubmit: función que recibe los datos del formulario
// - onClose: función para cerrar el modal
// - submitText: texto del botón de submit (opcional)
// - cancelText: texto del botón de cancelar (opcional)
// - initialValues: objeto con valores iniciales para el formulario (opcional)
function Modal({
    isOpen,
    title = "",
    fields = [],
    onSubmit,
    onClose,
    submitText = "Confirmar",
    cancelText = "Cancelar",
    initialValues = {}
}) {

    // Estado local para manejar los datos del formulario
    const [formData, setFormData] = useState(initialValues);

    // Actualizar el estado del formulario cuando cambien los valores iniciales
    useEffect(() => {
        setFormData(initialValues);
    }, [initialValues]);

    // Si el modal no está abierto, no renderizar nada
    if (!isOpen) return null;

    // Función para manejar los cambios en los campos del formulario
    const handleChange = (name, value) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // Función para manejar el submit del formulario
    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSubmit) onSubmit(formData);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>

                {title && (
                    <div className="modal-header">
                        <h2>{title}</h2>
                    </div>
                )}

                <form className="modal-body" onSubmit={handleSubmit}>

                    {fields.map((field) => (
                        <div key={field.name} className="modal-field">

                            <label>{field.label}</label>

                            {field.type === "select" ? (

                                <select
                                    value={formData[field.name] || ""}
                                    onChange={(e) => handleChange(field.name, e.target.value)}
                                >
                                    {field.options.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>

                            ) : field.type === "search-select" ? (

                                <SearchSelect
                                    options={field.options || []}
                                    value={formData[field.name] || ""}
                                    onChange={(value) => handleChange(field.name, value)}
                                    placeholder={field.placeholder}
                                />

                            ) : (

                                <input
                                    type={field.type || "text"}
                                    value={formData[field.name] || ""}
                                    onChange={(e) => handleChange(field.name, e.target.value)}
                                />

                            )}

                        </div>
                    ))}

                    <div className="modal-actions">
                        <Button onClick={onClose}>
                            {cancelText}
                        </Button>

                        <Button type="submit">
                            {submitText}
                        </Button>
                    </div>

                </form>

            </div>
        </div>
    );
}

export default Modal;
