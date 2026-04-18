import prisma from "../config/prisma.js";

export const obtenerTodosPrestamosAdmin = async (req, res) => {
    try {
        // Obtenemos todos los préstamos con información del usuario y equipo
        const todos = await prisma.prestamo.findMany({
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

        // Enviamos respuesta en formato JSON con todos los préstamos
        res.json(todos);
    }
    // En caso de error, enviamos un mensaje de error
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener todos los préstamos" });
    }
};

export const obtenerTodosPrestamosUser = async (req, res) => {
    try {
        // Obtenemos todos los préstamos del usuario autenticado con información del equipo
        const todos = await prisma.prestamo.findMany({
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

        // Enviamos respuesta en formato JSON con todos los préstamos del usuario
        res.json(todos);
    }
    // En caso de error, enviamos un mensaje de error
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener todos los préstamos" });
    }
};

export const obtenerPrestamosPorUsuarioAdmin = async (req, res) => {
    try {
        // Obtenemos el ID del usuario desde los parámetros de la ruta
        const { id } = req.params;

        // Obtenemos los préstamos del usuario con información del equipo
        const prestamos = await prisma.prestamo.findMany({
            where: {
                usuario_id: Number(id)
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

        // Enviamos respuesta en formato JSON con los préstamos del usuario
        res.json(prestamos);
    }
    // En caso de error, enviamos un mensaje de error
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener préstamos del usuario" });
    }
};
