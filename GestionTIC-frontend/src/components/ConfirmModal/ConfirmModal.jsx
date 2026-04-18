import "./ConfirmModal.css";
import Button from "../Button/Button";

/// props:
// - isOpen: boolean para controlar si el modal está abierto
// - message: mensaje a mostrar en el modal (opcional, por defecto "¿Estás seguro?")
// - onConfirm: función a ejecutar al confirmar
// - onCancel: función a ejecutar al cancelar
function ConfirmModal({
    isOpen,
    message = "¿Estás seguro?",
    onConfirm,
    onCancel
}) {
    // Si el modal no está abierto, no renderizamos nada
    if (!isOpen) return null;

    return (
        <div className="confirm-modal-overlay">
            <div className="confirm-modal">
                <p className="confirm-modal-message">{message}</p>

                <div className="confirm-modal-actions">
                    <Button
                        onClick={onCancel}
                    >
                        Cancelar
                    </Button>

                    <Button
                        onClick={onConfirm}
                    >
                        Confirmar
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;