import { io } from "socket.io-client";

// Crear una única instancia de socket para toda la aplicación
const SOCKET_URL = `${window.location.protocol}//${window.location.hostname}:3000`;

// Configura el socket para que se conecte automáticamente al cargar la aplicación
const socket = io(SOCKET_URL, {
    autoConnect: true,
    transports: ["websocket"]
});

export default socket;
