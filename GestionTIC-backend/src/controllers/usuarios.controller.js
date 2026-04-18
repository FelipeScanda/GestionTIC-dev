import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";

export const obtenerUsuarios = async (req, res) => {
    try {
        // Obtenemos todos los usuarios con rol "USER" para mostrar en el formulario de préstamos
        const usuarios = await prisma.usuario.findMany({
            where: {
                rol_usuario: "USER"
            },
            select: {
                id_usuario: true,
                nombre: true
            }
        });

        // Enviamos respuesta en formato JSON con los usuarios
        res.json(usuarios);

    }
    // En caso de error, enviamos un mensaje de error
    catch (error) {
        console.error("Error obteniendo usuarios:", error);
        res.status(500).json({
            error: "Error obteniendo usuarios"
        });
    }
};

export const obtenerTodosLosUsuarios = async (req, res) => {
    try {
        // Obtenemos todos los usuarios con información completa para mostrar en la sección de administración de usuarios
        const usuarios = await prisma.usuario.findMany({
            select: {
                id_usuario: true,
                nombre: true,
                rut: true,
                email: true,
                rol_usuario: true,
                estado: true
            }
        });

        // Enviamos respuesta en formato JSON con todos los usuarios
        res.json(usuarios);

    }
    // En caso de error, enviamos un mensaje de error
    catch (error) {
        console.error("Error obteniendo todos los usuarios:", error);
        res.status(500).json({
            error: "Error obteniendo todos los usuarios"
        });
    }
};

export const crearUsuario = async (req, res) => {
    try {
        // Obtenemos los datos del nuevo usuario desde el cuerpo de la solicitud
        const { nombre, rut, email, password, rol_usuario, estado } = req.body;

        // Validación básica de campos obligatorios
        if (!nombre || !rut || !email || !password) {
            return res.status(400).json({
                message: "Faltan campos obligatorios"
            });
        }

        // Verificar si ya existe un usuario con el mismo email o rut
        const emailExistente = await prisma.usuario.findFirst({
            where: { email }
        });

        // Si el email ya está en uso, respondemos con un error
        if (emailExistente) {
            return res.status(400).json({
                message: "El email ya está en uso"
            });
        }

        const rutExistente = await prisma.usuario.findFirst({
            where: { rut }
        });

        // Si el RUT ya está en uso, respondemos con un error
        if (rutExistente) {
            return res.status(400).json({
                message: "El RUT ya está en uso"
            });
        }

        // Encriptamos la contraseña antes de guardarla en la base de datos
        const hashedPassword = await bcrypt.hash(password, 10);

        // Creamos el nuevo usuario en la base de datos
        const nuevoUsuario = await prisma.usuario.create({
            data: {
                nombre,
                rut,
                email,
                password: hashedPassword,
                rol_usuario: rol_usuario || "USER",
                estado: estado || "ACTIVO"
            },
            select: {
                id_usuario: true,
                nombre: true,
                rut: true,
                email: true,
                rol_usuario: true,
                estado: true
            }
        });

        // Enviamos respuesta en formato JSON con el nuevo usuario creado
        res.status(201).json(nuevoUsuario);

    }
    // En caso de error, enviamos un mensaje de error
    catch (error) {
        console.error("Error creando usuario:", error);
        res.status(500).json({
            message: "Error al crear el usuario"
        });
    }
};

export const cambiarPassword = async (req, res) => {
    try {
        // Obtenemos el ID del usuario desde los parámetros de la ruta y la nueva contraseña desde el cuerpo de la solicitud
        const { id } = req.params;
        const { password } = req.body;

        // Validación básica de la nueva contraseña
        if (!password) {
            return res.status(400).json({
                message: "La contraseña es obligatoria"
            });
        }

        // Encriptamos la nueva contraseña antes de actualizarla en la base de datos
        const hashedPassword = await bcrypt.hash(password, 10);

        // Actualizamos la contraseña del usuario en la base de datos
        await prisma.usuario.update({
            where: {
                id_usuario: Number(id)
            },
            data: {
                password: hashedPassword
            }
        });

        // Enviamos respuesta en formato JSON indicando que la contraseña se ha actualizado correctamente
        res.json({
            message: "Contraseña actualizada correctamente"
        });

    }
    // En caso de error, enviamos un mensaje de error
    catch (error) {
        console.error("Error cambiando contraseña:", error);
        res.status(500).json({
            message: "Error al cambiar la contraseña"
        });
    }
};

export const actualizarUsuario = async (req, res) => {
    try {
        // Obtenemos el ID del usuario desde los parámetros de la ruta y los datos actualizados desde el cuerpo de la solicitud
        const { id } = req.params;
        const { nombre, rut, email, rol_usuario, estado } = req.body;

        // Validación básica de campos obligatorios
        if (!nombre || !rut || !email) {
            return res.status(400).json({
                message: "Nombre, RUT y email son obligatorios"
            });
        }

        // Verificar si otro usuario ya tiene ese email o rut
        const emailExistente = await prisma.usuario.findFirst({
            where: {
                email,
                NOT: {
                    id_usuario: Number(id)
                }
            }
        });

        // Si el email ya está en uso por otro usuario, respondemos con un error
        if (emailExistente) {
            return res.status(400).json({
                message: "El email ya está en uso"
            });
        }

        const rutExistente = await prisma.usuario.findFirst({
            where: {
                rut,
                NOT: {
                    id_usuario: Number(id)
                }
            }
        });

        // Si el RUT ya está en uso por otro usuario, respondemos con un error
        if (rutExistente) {
            return res.status(400).json({
                message: "El RUT ya está en uso"
            });
        }

        // Actualizamos los datos del usuario en la base de datos
        const usuarioActualizado = await prisma.usuario.update({
            where: {
                id_usuario: Number(id)
            },
            data: {
                nombre,
                rut,
                email,
                rol_usuario,
                estado
            },
            select: {
                id_usuario: true,
                nombre: true,
                rut: true,
                email: true,
                rol_usuario: true,
                estado: true
            }
        });

        // Enviamos respuesta en formato JSON con el usuario actualizado
        res.json(usuarioActualizado);

    }
    // En caso de error, enviamos un mensaje de error
    catch (error) {
        console.error("Error actualizando usuario:", error);
        res.status(500).json({
            message: "Error al actualizar el usuario"
        });
    }
};