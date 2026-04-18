import "./AlertModal.css";
import Button from "../Button/Button";

// Props:
// - isOpen: boolean para controlar si el modal está abierto
// - type: tipo de alerta ("success", "error", "warning", "info") para aplicar estilos específicos (opcional, por defecto "info")
// - message: mensaje a mostrar en el modal
// - onClose: función a ejecutar al cerrar el modal
function AlertModal({ isOpen, type = "info", message, onClose }) {
    // Si el modal no está abierto, no renderizamos nada
    if (!isOpen) return null;

    // Mapeamos el tipo de alerta a una clase CSS para estilos específicos
    const typeClass = {
        success: "alert-success",
        error: "alert-error",
        warning: "alert-warning",
        info: "alert-info"
    };

    return (
        <div className="alert-overlay">
            <div className={`alert-modal ${typeClass[type]}`}>

                <div className="alert-message">
                    {message}
                </div>

                <Button onClick={onClose}>
                    Aceptar
                </Button>

            </div>
        </div>
    );
}

export default AlertModal;