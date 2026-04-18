import { loginUser } from "../services/auth.service.js";

export const login = async (req, res) => {
    try {
        //Obtenemos el RUT y la contraseña del cuerpo de la solicitud
        const { rut, password } = req.body;

        //Si no se proporcionan el RUT o la contraseña, respondemos con un error 400
        if (!rut || !password) {
            return res.status(400).json({
                message: "RUT y contraseña son obligatorios",
            })
        }

        //Intentamos iniciar sesión con el RUT y la contraseña proporcionados
        const result = await loginUser(rut, password);
        //Si el inicio de sesión es exitoso, respondemos con un estado 200 y el resultado
        return res.status(200).json(result);
    }
    //Si ocurre un error durante el proceso de inicio de sesión, respondemos con un estado 401 y el mensaje de error
    catch (error) {
        return res.status(401).json({
            message: error.message,
        })
    }
};