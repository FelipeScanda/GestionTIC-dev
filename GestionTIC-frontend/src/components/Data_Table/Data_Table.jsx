import { useState, useMemo } from "react";
import "./Data_Table.css";

// Props:
// - title: título de la tabla (opcional)
// - columns: array de nombres de columnas para el encabezado
// - data: array de objetos con los datos a mostrar
// - renderRow: función que recibe un objeto de datos y devuelve un array de celdas para esa fila
// - renderExpanded: función que recibe un objeto de datos y devuelve el contenido expandido para esa fila (opcional)
// - emptyMessage: mensaje a mostrar cuando no hay datos (opcional, por defecto "Sin datos")
function DataTable({
    title,
    columns = [],
    data = [],
    renderRow,
    renderExpanded,
    emptyMessage = "Sin datos"
}) {
    // Estado para el término de búsqueda y la fila expandida
    const [search, setSearch] = useState("");
    const [expandedRow, setExpandedRow] = useState(null);

    // Filtramos los datos según el término de búsqueda, buscando en todas las propiedades del objeto
    const filteredData = useMemo(() => {
        if (!search) return data;

        const searchLower = search.toLowerCase();

        return data.filter((item) => {
            // Convert all values of the object into a searchable string
            const texto = Object.values(item)
                .flatMap((value) => {
                    if (value === null || value === undefined) return [];
                    if (typeof value === "object") {
                        return Object.values(value);
                    }
                    return value;
                })
                .join(" ")
                .toLowerCase();

            return texto.includes(searchLower);
        });
    }, [search, data]);

    return (
        <div className="datatable-section">
            {title && (
                <div className="datatable-title">
                    <h2>{title}</h2>
                    <input
                        type="text"
                        className="datatable-search"
                        placeholder="Buscar"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            )}

            <div className="datatable-card">
                <div
                    className="datatable-header"
                    style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}
                >
                    {columns.map((col, index) => (
                        <div key={index} className="datatable-header-cell">
                            {col}
                        </div>
                    ))}
                </div>

                <div className="datatable-body">
                    {filteredData.length === 0 ? (
                        <div className="datatable-empty">
                            {emptyMessage}
                        </div>
                    ) : (
                        filteredData.map((item, index) => {
                            const rowKey = item.id_prestamo || index;
                            const isExpanded = expandedRow === rowKey;

                            return (
                                <div key={rowKey}>
                                    <div
                                        className={`datatable-row ${renderExpanded ? "clickable" : ""}`}
                                        style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}
                                        onClick={() =>
                                            setExpandedRow(isExpanded ? null : rowKey)
                                        }
                                    >
                                        {renderRow(item)}
                                    </div>

                                    {isExpanded && renderExpanded && (
                                        <div className="datatable-expanded">
                                            {renderExpanded(item)}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

export default DataTable;
