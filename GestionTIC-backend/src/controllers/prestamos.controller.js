import prisma from "../config/prisma.js";

export const crearPrestamoUser = async (req, res) => {
    try {
        //Obtenemos el ID del equipo, la fecha de inicio y la fecha de devolución del cuerpo de la solicitud
        const { equipo_id, fecha_inicio, fecha_devolucion } = req.body;

        //Obtenemos el ID del usuario desde el token de autenticación
        const usuario_id = req.user.id;

        //Validamos que se hayan proporcionado todos los campos necesarios
        if (!equipo_id || !fecha_inicio || !fecha_devolucion) {
            return res.status(400).json({
                message: "Faltan datos para crear la solicitud"
            });
        }

        // Validamos solapamiento de horarios con préstamos aprobados
        const conflicto = await prisma.prestamo.findFirst({
            where: {
                equipo: {
                    id_equipo: Number(equipo_id)
                },
                estado_prestamo: "APROBADO",
                AND: [
                    {
                        fecha_inicio: {
                            lt: new Date(fecha_devolucion)
                        }
                    },
                    {
                        fecha_devolucion: {
                            gt: new Date(fecha_inicio)
                        }
                    }
                ]
            }
        });

        //Si hay un conflicto de horarios, respondemos con un error 400 indicando que el equipo ya está reservado en ese horario
        if (conflicto) {
            return res.status(400).json({
                message: "El equipo ya está reservado en ese horario"
            });
        }

        //Si no hay conflictos, creamos el préstamo en la base de datos utilizando Prisma y respondemos con el préstamo creado
        const prestamo = await prisma.prestamo.create({
            data: {
                usuario: {
                    connect: {
                        id_usuario: Number(usuario_id)
                    }
                },
                equipo: {
                    connect: {
                        id_equipo: Number(equipo_id)
                    }
                },
                fecha_inicio: new Date(fecha_inicio),
                fecha_devolucion: new Date(fecha_devolucion),
                estado_prestamo: "PENDIENTE"    // El estado inicial del préstamo es "PENDIENTE" para el usuario
            },
            select: {
                id_prestamo: true,
                estado_prestamo: true,
                fecha_inicio: true,
                fecha_devolucion: true,
                fecha_aprobacion: true,
                fecha_devuelto: true,
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

        //Si se creó el préstamo correctamente, emitimos un evento a través de Socket.IO para notificar a los administradores que se ha creado un nuevo préstamo
        if (req.io) {
            req.io.emit("prestamo_creado", prestamo);
        }

        //Respondemos con el préstamo creado en formato JSON
        res.status(201).json(prestamo);

    }
    //Si ocurre un error durante la creación del préstamo, respondemos con un estado 500 y un mensaje de error
    catch (error) {
        console.error("Error creando préstamo:", error);

        res.status(500).json({
            message: "Error al crear la solicitud"
        });
    }
};

export const crearPrestamoAdmin = async (req, res) => {
    try {
        //Obtenemos el ID del equipo, la fecha de inicio, la fecha de devolución y el ID del usuario del cuerpo de la solicitud
        const { equipo_id, fecha_inicio, fecha_devolucion, usuario_id } = req.body;

        //Obtenemos el ID del usuario desde el token de autenticación
        if (!equipo_id || !fecha_inicio || !fecha_devolucion || !usuario_id) {
            return res.status(400).json({
                message: "Faltan datos para crear la solicitud"
            });
        }

        // Validamos solapamiento de horarios con préstamos aprobados
        const conflicto = await prisma.prestamo.findFirst({
            where: {
                equipo: {
                    id_equipo: Number(equipo_id)
                },
                estado_prestamo: "APROBADO",
                AND: [
                    {
                        fecha_inicio: {
                            lt: new Date(fecha_devolucion)
                        }
                    },
                    {
                        fecha_devolucion: {
                            gt: new Date(fecha_inicio)
                        }
                    }
                ]
            }
        });

        //Si hay un conflicto de horarios, respondemos con un error 400 indicando que el equipo ya está reservado en ese horario
        if (conflicto) {
            return res.status(400).json({
                message: "El equipo ya está reservado en ese horario"
            });
        }

        //Si no hay conflictos, creamos el préstamo en la base de datos utilizando Prisma y respondemos con el préstamo creado
        const prestamo = await prisma.prestamo.create({
            data: {
                usuario: {
                    connect: {
                        id_usuario: Number(usuario_id)
                    }
                },
                equipo: {
                    connect: {
                        id_equipo: Number(equipo_id)
                    }
                },
                fecha_inicio: new Date(fecha_inicio),
                fecha_devolucion: new Date(fecha_devolucion),
                fecha_aprobacion: new Date(),
                estado_prestamo: "APROBADO"   // El estado inicial del préstamo es "APROBADO" para el administrador
            },
            select: {
                id_prestamo: true,
                estado_prestamo: true,
                fecha_inicio: true,
                fecha_devolucion: true,
                fecha_aprobacion: true,
                fecha_devuelto: true,
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

        //Si se creó el préstamo correctamente, emitimos un evento a través de Socket.IO para notificar que se ha creado un nuevo préstamo
        if (req.io) {
            req.io.emit("prestamo_creado", prestamo);
        }

        res.status(201).json(prestamo);

    }
    //Si ocurre un error durante la creación del préstamo, respondemos con un estado 500 y un mensaje de error
    catch (error) {
        console.error("Error creando préstamo:", error);

        res.status(500).json({
            message: "Error al crear la solicitud"
        });
    }
};

export const marcarComoDevuelto = async (req, res) => {
    try {
        //Obtenemos el ID del préstamo desde los parámetros de la solicitud
        const { id } = req.params;

        //Actualizamos el préstamo en la base de datos utilizando Prisma, estableciendo el estado del préstamo como "DEVUELTO" y registrando la fecha de devolución
        const prestamo = await prisma.prestamo.update({
            where: {
                id_prestamo: Number(id)
            },
            data: {
                estado_prestamo: "DEVUELTO",
                fecha_devuelto: new Date()
            },
            select: {
                id_prestamo: true,
                estado_prestamo: true,
                fecha_inicio: true,
                fecha_devolucion: true,
                fecha_aprobacion: true,
                fecha_devuelto: true,
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
        //Si se actualizó el préstamo correctamente, emitimos un evento a través de Socket.IO para notificar que se ha actualizado el préstamo
        req.io.emit("prestamo_actualizado", prestamo);

        res.json(prestamo);

    }
    //Si ocurre un error durante la actualización del préstamo, respondemos con un estado 500 y un mensaje de error
    catch (error) {
        console.error("Error devolviendo préstamo:", error);
        res.status(500).json({ error: "Error al devolver préstamo" });
    }
};