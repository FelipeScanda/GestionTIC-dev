import prisma from "../config/prisma.js";

export const obtenerPrestamosAprobadosAdmin = async (req, res) => {
    try {
        //Obtenemos la lista de préstamos aprobados desde la base de datos utilizando Prisma, incluyendo información del usuario y del equipo asociado a cada préstamo
        const aprobados = await prisma.prestamo.findMany({
            where: {
                estado_prestamo: "APROBADO"
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

        //Respondemos con la lista de préstamos aprobados en formato JSON
        res.json(aprobados);

    }
    //Si ocurre un error durante la obtención de los préstamos aprobados, respondemos con un estado 500 y un mensaje de error
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener los préstamos del usuario" });
    }
};

export const obtenerPrestamosAprobadosUser = async (req, res) => {
    try {
        //Obtenemos los prestamos aprobados del usuario desde la base de datos utilizando Prisma, incluyendo información del equipo asociado a cada préstamo
        const aprobados = await prisma.prestamo.findMany({
            where: {
                estado_prestamo: "APROBADO"
            },
            include: {
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
        //Respondemos con la lista de préstamos aprobados del usuario en formato JSON
        res.json(aprobados);

    }
    //Si ocurre un error durante la obtención de los préstamos aprobados del usuario, respondemos con un estado 500 y un mensaje de error
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener los préstamos del usuario" });
    }
};