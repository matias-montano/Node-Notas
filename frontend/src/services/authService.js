// Objetivo: Contiene funciones para realizar solicitudes HTTP a la API de autenticación
// Nota: Las funciones de este archivo se utilizan en los componentes de inicio de sesión y registro
const BASE_URL = 'http://localhost:4000/api/v1'; // Cambia localhost si usas otro host

export const login = async (username, password) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();
  if (response.ok) {
    localStorage.setItem('token', data.token); // Guardar el token en localStorage
  }
  return data;
};

// Nueva función para obtener el token del localStorage
export const getToken = () => {
  return localStorage.getItem('token');
};