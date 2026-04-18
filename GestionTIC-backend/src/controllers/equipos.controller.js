import prisma from "../config/prisma.js";

export const obtenerEquiposDisponibles = async (req, res) => {
    try {
        //Obtenemos la lista de equipos disponibles desde la base de datos utilizando Prisma
        const equipos = await prisma.equipo.findMany({
            where: {
                estado: "DISPONIBLE"
            },
            select: {
                id_equipo: true,
                tipo: true,
                modelo: true,
                estado: true
            }
        });
        //Respondemos con la lista de equipos disponibles en formato JSON
        res.json(equipos);

    }
    //Si ocurre un error durante la obtención de los equipos, respondemos con un estado 500 y un mensaje de error
    catch (error) {
        console.error("Error obteniendo equipos:", error);
        res.status(500).json({
            message: "Error al obtener equipos disponibles"
        });
    }
};

export const obtenerTodosLosEquipos = async (req, res) => {
    try {
        //Obtenemos la lista de todos los equipos desde la base de datos utilizando Prisma
        const equipos = await prisma.equipo.findMany({
            select: {
                id_equipo: true,
                tipo: true,
                modelo: true,
                estado: true
            }
        });
        //Respondemos con la lista de todos los equipos en formato JSON
        res.json(equipos);

    }
    //Si ocurre un error durante la obtención de los equipos, respondemos con un estado 500 y un mensaje de error
    catch (error) {
        console.error("Error obteniendo todos los equipos:", error);
        res.status(500).json({
            message: "Error al obtener los equipos"
        });
    }
};

export const crearEquipo = async (req, res) => {
    try {
        //Obtenemos el tipo, modelo y estado del equipo desde el cuerpo de la solicitud
        const { tipo, modelo, estado } = req.body;

        //Validamos que se hayan proporcionado todos los campos necesarios
        if (!tipo || !modelo || !estado) {
            return res.status(400).json({
                message: "Todos los campos son obligatorios"
            });
        }

        //Validamos que el estado sea válido (DISPONIBLE o MANTENIMIENTO)
        if (!["DISPONIBLE", "MANTENIMIENTO"].includes(estado)) {
            return res.status(400).json({
                message: "Estado inválido"
            });
        }

        //Creamos un nuevo equipo en la base de datos utilizando Prisma
        const nuevoEquipo = await prisma.equipo.create({
            data: {
                tipo,
                modelo,
                estado
            }
        });

        //Respondemos con el nuevo equipo creado en formato JSON y un estado 201
        return res.status(201).json(nuevoEquipo);

    }
    //Si ocurre un error durante la creación del equipo, respondemos con un estado 500 y un mensaje de error
    catch (error) {
        console.error("Error creando equipo:", error);
        return res.status(500).json({
            message: "Error interno del servidor"
        });
    }
};

export const actualizarEquipo = async (req, res) => {
    try {
        //Obtenemos el ID del equipo desde los parámetros de la solicitud y el tipo, modelo y estado desde el cuerpo de la solicitud
        const { id } = req.params;
        const { tipo, modelo, estado } = req.body;

        //Validamos que se hayan proporcionado todos los campos necesarios
        if (!tipo || !modelo || !estado) {
            return res.status(400).json({
                message: "Todos los campos son obligatorios"
            });
        }

        //Validamos que el estado sea válido (DISPONIBLE o MANTENIMIENTO)
        if (!["DISPONIBLE", "MANTENIMIENTO"].includes(estado)) {
            return res.status(400).json({
                message: "Estado inválido"
            });
        }

        //Actualizamos el equipo en la base de datos utilizando Prisma
        const equipoActualizado = await prisma.equipo.update({
            where: {
                id_equipo: Number(id)
            },
            data: {
                tipo,
                modelo,
                estado
            }
        });

        //Respondemos con el equipo actualizado en formato JSON
        return res.json(equipoActualizado);

    }
    //Si ocurre un error durante la actualización del equipo, respondemos con un estado 500 y un mensaje de error
    catch (error) {
        console.error("Error actualizando equipo:", error);
        return res.status(500).json({
            message: "Error al actualizar el equipo"
        });
    }
};

export const obtenerPrestamosPorEquipoAdmin = async (req, res) => {
    try {
        //Obtenemos el ID del equipo desde los parámetros de la solicitud
        const { id } = req.params;

        //Obtenemos la lista de préstamos asociados al equipo desde la base de datos utilizando Prisma, incluyendo información del usuario y del equipo
        const prestamos = await prisma.prestamo.findMany({
            where: {
                equipo_id: Number(id)
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

        //Respondemos con la lista de préstamos en formato JSON
        res.json(prestamos);
    }
    //Si ocurre un error durante la obtención de los préstamos, respondemos con un estado 500 y un mensaje de error
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener préstamos del usuario" });
    }
};
