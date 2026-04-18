import "./Button.css";

// Props:
// - variant: "primary" (por defecto) o "secondary" para aplicar estilos diferentes
// - children: contenido del botón (texto o elementos)
// - onClick: función a ejecutar al hacer clic
// - type: tipo del botón (por defecto "button")
// - fullWidth: boolean para hacer el botón de ancho completo (opcional, por defecto false)
// - className: clases CSS adicionales para personalizar el estilo (opcional)
function Button({
  variant = "primary",
  children,
  onClick,
  type = "button",
  fullWidth = false,
  className = ""
}) {

  // Creamos una clase CSS basada en el variant para aplicar estilos específicos
  const variantClass = `${variant}-button`;

  return (
    <button
      type={type}
      onClick={onClick}
      className={`primary-button ${variantClass} ${fullWidth ? "full-width" : ""} ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;