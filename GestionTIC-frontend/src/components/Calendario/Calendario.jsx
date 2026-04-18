import FullCalendar from "@fullcalendar/react";
import { useState } from "react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./Calendario.css";

/**
 * props:
 * - eventos: array de préstamos
 * - esAdmin: boolean
 */
function Calendario({ eventos = [], esAdmin = false }) {
    // Estado para controlar qué evento está expandido (mostrando detalles)
    const [expandedId, setExpandedId] = useState(null);

    // Función para asignar un color basado en el ID del usuario, para diferenciar visualmente los eventos
    const getColorByUser = (userId) => {
        if (!userId) return "#3788d8"; // fallback
        const hue = (userId * 137) % 360; // distribución pseudoaleatoria
        return `hsl(${hue}, 70%, 60%)`;
    };

    // Mapeamos los préstamos a eventos de FullCalendar, formateando el título y asignando colores
    const mapEventos = Array.isArray(eventos)
        ? eventos.map((prestamo) => {
            const inicio = new Date(prestamo.fecha_inicio).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            });

            const titulo = `${inicio} ${prestamo.equipo.tipo} ${prestamo.equipo.modelo}`;

            return {
                id: prestamo.id_prestamo,
                title: titulo,
                start: prestamo.fecha_inicio,
                end: prestamo.fecha_devolucion,
                backgroundColor: getColorByUser(prestamo.usuario_id),
                borderColor: getColorByUser(prestamo.usuario_id),
                extendedProps: {
                    fecha_inicio: prestamo.fecha_inicio,
                    fecha_devolucion: prestamo.fecha_devolucion,
                    usuario_nombre: prestamo.usuario?.nombre || ""
                }
            };
        })
        : [];

    return (
        <div className="calendario-container">
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locale="es"
                headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay"
                }}
                events={mapEventos}
                eventContent={(arg) => {
                    const isExpanded = arg.event.id === expandedId;

                    const inicio = new Date(arg.event.extendedProps.fecha_inicio).toLocaleString();
                    const fin = new Date(arg.event.extendedProps.fecha_devolucion).toLocaleString();

                    return (
                        <div>
                            <div><strong>{arg.event.title}</strong></div>
                            {isExpanded && (
                                <div>
                                    {esAdmin && arg.event.extendedProps.usuario_nombre && (
                                        <div><strong>Usuario:</strong> {arg.event.extendedProps.usuario_nombre}</div>
                                    )}
                                    <div>Inicio: {inicio}</div>
                                    <div>Fin: {fin}</div>
                                </div>
                            )}
                        </div>
                    );
                }}
                height="auto"
                eventClick={(info) => {
                    const id = info.event.id;
                    setExpandedId(prev => (prev === id ? null : id));
                }}
            />
        </div>
    );
}

export default Calendario;
