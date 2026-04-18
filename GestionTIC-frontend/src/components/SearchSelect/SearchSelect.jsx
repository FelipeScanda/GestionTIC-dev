import "./SearchSelect.css";
import { useState, useMemo, useRef, useEffect } from "react";

// Props:
// - options: array de objetos { value, label }
// - value: valor seleccionado
// - onChange: función que recibe el nuevo valor seleccionado
// - placeholder: texto del placeholder (opcional)
function SearchSelect({
    options = [],
    value = "",
    onChange,
    placeholder = "Buscar...",
}) {
    // Estado local para manejar el texto de búsqueda y si el dropdown está abierto
    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Memoizar el valor seleccionado para evitar cálculos innecesarios
    const selectedOption = useMemo(() => {
        return options.find((opt) => opt.value === value);
    }, [value, options]);

    // Mostrar el texto de búsqueda si el dropdown está abierto, o el label del valor seleccionado si no lo está
    const displayValue = isOpen ? search : (selectedOption?.label || "");

    // Filtrar las opciones según el texto de búsqueda
    const filteredOptions = useMemo(() => {
        if (!search) return options;

        return options.filter((opt) =>
            opt.label.toLowerCase().includes(search.toLowerCase())
        );
    }, [search, options]);

    // Función para manejar la selección de una opción
    const handleSelect = (option) => {
        onChange(option.value);
        setSearch(option.label);
        setIsOpen(false);
        setSearch("");
    };

    // Manejar clics fuera del componente para cerrar el dropdown
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
                setSearch("");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="search-select" ref={containerRef}>
            <input
                type="text"
                className="search-select-input"
                placeholder={placeholder}
                value={displayValue}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
            />

            {isOpen && (
                <div className="search-select-dropdown">
                    {filteredOptions.length === 0 ? (
                        <div className="search-select-empty">
                            Sin resultados
                        </div>
                    ) : (
                        filteredOptions.map((option) => (
                            <div
                                key={option.value}
                                className="search-select-option"
                                onClick={() => handleSelect(option)}
                            >
                                {option.label}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default SearchSelect;