Gestión TIC

Sistema web para la gestión de préstamos de equipos tecnológicos, con roles de usuario y administrador, calendario de disponibilidad y control en tiempo real.

⸻

Tecnologías
	•	Frontend: React (Vite)
	•	Backend: Node.js + Express
	•	Base de datos: PostgreSQL + Prisma ORM
	•	Tiempo real: Socket.IO
	•	Gestión de procesos: PM2

⸻

Instalación (desde cero)

1. Clonar repositorio

Para SSH:
git clone git@github.com:FelipeScanda/GestionTIC-dev.git

Para HTTPS:
git clone https://github.com/FelipeScanda/GestionTIC-dev.git


⸻

2. Backend

cd GestionTIC-backend

npm install

Crear archivo .env y copiar lo siguiente dentro de el

DATABASE_URL="file:./dev.db"

JWT_SECRET=super_secret_key

Migraciones Prisma

npx prisma migrate deploy

npx prisma generate


⸻

3. Frontend

cd GestionTIC-frontend

npm install


Ejecutar aplicación

1. Primero se debe buildear el frontend de la siguiente manera:

cd GestionTIC-frontend

npm run build

Esto generará la carpeta dist, la cual se debe copiar dentro de la carpeta del backend

Modo normal

cd GestionTIC-backend

node src/app.js

Con PM2 (recomendado)

pm2 start src/app.js --name gestiontic

pm2 save


⸻

Acceso

Desde el dispositivo servidor (si aplica):

http://localhost:3000

Desde cualquier dispositivo en la red:

http://IP_DEL_SERVIDOR:3000


⸻

HTTPS (opcional)

Se puede habilitar HTTPS usando certificados locales con mkcert.

⸻

Funcionalidades

Usuario
	•	Solicitar préstamos de equipos
	•	Cancelar solicitudes
	•	Ver calendario de disponibilidad

Administrador
	•	Aprobar / rechazar solicitudes
	•	Cancelar préstamos (incluso aprobados)
	•	Marcar como devuelto
	•	Gestión de usuarios
	•	Gestión de equipos
	•	Visualización avanzada en calendario

⸻

Tiempo real

El sistema utiliza Socket.IO para actualizar automáticamente:
	•	solicitudes
	•	estados de préstamos
	•	vistas del administrador

⸻

Requisitos
	•	Node.js 20
	•	SQLite
	•	Git

⸻

Notas
	•	Asegúrate de abrir el puerto 3000 en el firewall
	•	No subir .env, node_modules, ni certificados al repositorio

⸻

Autor

Felipe Scanda

⸻

Estado del proyecto

Listo para uso en LAN
Preparado para despliegue
Arquitectura fullstack funcional
