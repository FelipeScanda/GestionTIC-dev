import prisma from "../config/prisma.js";
import { io } from "../app.js";

export const obtenerPrestamosInicioAdmin = async (req, res) => {
    try {
        // Obtenemos todos los préstamos con información del usuario y equipo
        const prestamos = await prisma.prestamo.findMany({
            include: {
                usuario: {
                    select: {
                        id_usuario: true,
                        nombre: true,
                        rol_usuario: true
                    }
                },
                equipo: {
                    select: {
                        id_equipo: true,
                        tipo: true,
                        modelo: true
                    }
                }
            },
            orderBy: { id_prestamo: "desc" }
        });
        // Separamos préstamos pendientes y aprobados
        const pendientes = prestamos.filter(p => p.estado_prestamo === "PENDIENTE");
        const aprobados = prestamos.filter(p => p.estado_prestamo === "APROBADO");

        // Enviamos respuesta en formato JSON con ambos arrays
        res.json({ pendientes, aprobados });

    }
    // En caso de error, enviamos un mensaje de error 
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener los préstamos del usuario" });
    }
};

export const obtenerPrestamosInicioUser = async (req, res) => {
    try {
        // Obtenemos los préstamos del usuario autenticado con información del equipo
        const prestamos = await prisma.prestamo.findMany({
            where: {
                usuario_id: req.user.id
            },
            include: {
                usuario: {
                    select: {
                        id_usuario: true,
                        nombre: true,
                        rol_usuario: true
                    }
                },
                equipo: {
                    select: {
                        id_equipo: true,
                        tipo: true,
                        modelo: true
                    }
                }
            },
            orderBy: { id_prestamo: "desc" }
        });

        // Separamos préstamos pendientes y aprobados
        const pendientes = prestamos.filter(p => p.estado_prestamo === "PENDIENTE");
        const aprobados = prestamos.filter(p => p.estado_prestamo === "APROBADO");

        // Enviamos respuesta en formato JSON con ambos arrays
        res.json({ pendientes, aprobados });

    }
    // En caso de error, enviamos un mensaje de error
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener los préstamos del usuario" });
    }
};

export const aprobarPrestamo = async (req, res) => {
    try {
        // Obtenemos el ID del préstamo desde los parámetros de la URL
        const { id } = req.params;

        //Actualizamos el estado del préstamo a "APROBADO" y registramos la fecha de aprobación
        const prestamo = await prisma.prestamo.update({
            where: {
                id_prestamo: Number(id)
            },
            data: {
                estado_prestamo: "APROBADO",
                fecha_aprobacion: new Date()
            },
            include: {
                usuario: {
                    select: {
                        id_usuario: true,
                        nombre: true
                    }
                },
                equipo: {
                    select: {
                        id_equipo: true,
                        tipo: true,
                        modelo: true
                    }
                }
            }
        });

        // Emitimos un evento a través de Socket.IO para notificar a los clientes que el préstamo ha sido actualizado
        io.emit("prestamo_actualizado", prestamo);

        // Enviamos la respuesta con el préstamo actualizado en formato JSON
        res.json(prestamo);
    }
    // En caso de error, enviamos un mensaje de error
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al aprobar solicitud" });
    }
};

export const rechazarPrestamo = async (req, res) => {
    try {
        // Obtenemos el ID del préstamo desde los parámetros de la URL
        const { id } = req.params;

        //Actualizamos el estado del préstamo a "RECHAZADO" y registramos la fecha de aprobación (aunque no se apruebe, se registra la fecha de decisión)
        const prestamo = await prisma.prestamo.update({
            where: {
                id_prestamo: Number(id)
            },
            data: {
                estado_prestamo: "RECHAZADO",
                fecha_aprobacion: new Date()
            },
            include: {
                usuario: {
                    select: {
                        id_usuario: true,
                        nombre: true
                    }
                },
                equipo: {
                    select: {
                        id_equipo: true,
                        tipo: true,
                        modelo: true
                    }
                }
            }
        });

        // Emitimos un evento a través de Socket.IO para notificar a los clientes que el préstamo ha sido actualizado
        io.emit("prestamo_actualizado", prestamo);

        // Enviamos la respuesta con el préstamo actualizado en formato JSON
        res.json(prestamo);
    }
    // En caso de error, enviamos un mensaje de error
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al aprobar solicitud" });
    }
};

export const cancelarPrestamo = async (req, res) => {
    try {
        // Obtenemos el ID del préstamo desde los parámetros de la URL
        const { id } = req.params;

        // Buscamos el préstamo
        const prestamo = await prisma.prestamo.findUnique({
            where: {
                id_prestamo: Number(id)
            }
        });

        // Validamos que el préstamo exista
        if (!prestamo) {
            return res.status(404).json({ message: "Préstamo no encontrado" });
        }

        // Validamos que pertenece al usuario
        if (prestamo.usuario_id !== req.user.id) {
            return res.status(403).json({ message: "No autorizado para cancelar este préstamo" });
        }

        // Validamos que esté en estado pendiente
        if (prestamo.estado_prestamo !== "PENDIENTE") {
            return res.status(400).json({ message: "Solo se pueden cancelar solicitudes pendientes" });
        }

        // Actualizamos el estado del préstamo a "CANCELADO"
        const prestamoActualizado = await prisma.prestamo.update({
            where: {
                id_prestamo: Number(id)
            },
            data: {
                estado_prestamo: "CANCELADO"
            },
            include: {
                usuario: {
                    select: {
                        id_usuario: true,
                        nombre: true
                    }
                },
                equipo: {
                    select: {
                        id_equipo: true,
                        tipo: true,
                        modelo: true
                    }
                }
            }
        });

        // Emitimos un evento a través de Socket.IO para notificar a los clientes que el préstamo ha sido actualizado
        io.emit("prestamo_actualizado", prestamoActualizado);

        // Enviamos la respuesta con el préstamo actualizado en formato JSON
        res.json(prestamoActualizado);

    }
    // En caso de error, enviamos un mensaje de error
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al cancelar la solicitud" });
    }
};

export const cancelarPrestamoAdmin = async (req, res) => {
    try {
        // Obtenemos el ID del préstamo desde los parámetros de la URL
        const { id } = req.params;

        // Buscamos el préstamo
        const prestamo = await prisma.prestamo.findUnique({
            where: {
                id_prestamo: Number(id)
            }
        });

        // Validamos que el préstamo exista
        if (!prestamo) {
            return res.status(404).json({ message: "Préstamo no encontrado" });
        }

        // Permitir cancelar si está PENDIENTE o APROBADO
        if (prestamo.estado_prestamo !== "PENDIENTE" && prestamo.estado_prestamo !== "APROBADO") {
            return res.status(400).json({ message: "No se puede cancelar este préstamo" });
        }

        // Actualizamos el estado del préstamo a "CANCELADO"
        const prestamoActualizado = await prisma.prestamo.update({
            where: {
                id_prestamo: Number(id)
            },
            data: {
                estado_prestamo: "CANCELADO"
            },
            include: {
                usuario: {
                    select: {
                        id_usuario: true,
                        nombre: true
                    }
                },
                equipo: {
                    select: {
                        id_equipo: true,
                        tipo: true,
                        modelo: true
                    }
                }
            }
        });

        // Emitimos un evento a través de Socket.IO para notificar a los clientes que el préstamo ha sido actualizado
        io.emit("prestamo_actualizado", prestamoActualizado);

        // Enviamos la respuesta con el préstamo actualizado en formato JSON
        res.json(prestamoActualizado);

    }
    // En caso de error, enviamos un mensaje de error
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al cancelar la solicitud (admin)" });
    }
};
