import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    //Verificar si hay header
    if (!authHeader) {
        return res.status(401).json({ message: "Se requiere header" });
    }

    //Formato: Bearer token
    const token = authHeader.split(" ")[1];

    //Verificar si hay token
    if (!token) {
        return res.status(401).json({ message: "Token invalido" });
    }

    //Verificar token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //Guardar el usuario decodificado
        req.user = decoded;

        next()
    }
    // En caso de error, enviamos un mensaje de error
    catch (error) {
        return res.status(403).json({ message: "Token invalido o expirado" })
    }
}

export const authAdmin = (req, res, next) => {
    //Verificar si el usuario es admin
    if (req.user.rol !== "ADMIN") {
        return res.status(403).json({ message: "Acceso solo para administradores" })
    }

    next();
}