// Funcion para realizar la solicitud de inicio de sesión al backend
export const loginRequest = async (rut, password) => {
  // Realiza una solicitud POST al endpoint de inicio de sesión del backend
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rut, password }),
  });

  // Convierte la respuesta a formato JSON
  const data = await response.json();

  // Si la respuesta no es exitosa, lanza un error con el mensaje del backend
  if (!response.ok) {
    throw new Error(data.message);
  }

  return data;
};