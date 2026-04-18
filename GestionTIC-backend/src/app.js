import dotenv from "dotenv";
import express from "express";
import prisma from "./config/prisma.js";
import cors from "cors";
import { authenticateToken } from "./middlewares/auth.middleware.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import http from "http";
import { Server } from "socket.io";

dotenv.config();

import authRoutes from "./routes/auth.routes.js"
import prestamoRoutes from "./routes/prestamo.routes.js"
import equiposRoutes from "./routes/equipos.routes.js";
import usuariosRoutes from "./routes/usuarios.routes.js";

//Crear el servidor
const app = express();

//Crear el servidor HTTP y el servidor de WebSocket
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

// Middleware para compartir io en todas las rutas
app.use((req,res,next)=>{
    req.io = io;
    next();
});

//Middleware para leer los JSON
app.use(express.json());

//CORS para servir al frontend
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Rutas públicas (login, etc.)
app.use("/api/auth", authRoutes);
app.use("/api/prestamos",prestamoRoutes);
app.use("/api/equipos", equiposRoutes);
app.use("/api/usuarios", usuariosRoutes);

// Middleware global para proteger todas las rutas privadas
app.use("/api", authenticateToken);

//
io.on("connection", (socket) => {
    console.log("Cliente conectado:", socket.id);

    socket.on("disconnect", () => {
        console.log("Cliente desconectado:", socket.id);
    });
});

app.use(express.static(path.join(__dirname, "../dist")));

app.use((req, res) => {
    res.sendFile(path.join(__dirname, "../dist/index.html"));
});

//Puerto
const PORT = 3000;

server.listen(PORT, '0.0.0.0', async () => {
    try {
        await prisma.$connect();
        console.log("Conectado a base de datos");
        console.log(`Servidor corriendo en puerto ${PORT}`);
    }
    catch (error){
        console.error("Error conectando con la base de datos", error);
    }
});

export { io };