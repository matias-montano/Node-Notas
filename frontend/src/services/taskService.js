// Objetivo: Contiene funciones para realizar solicitudes HTTP a la API de tareas
// Nota: Las funciones de este archivo se utilizan en los componentes de tareas
import { getToken } from './authService';

export const getTasks = async () => {
  const token = getToken();
  const response = await fetch('/tasks', {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.json();
};

export const createTask = async (task) => {
  const token = getToken();
  const response = await fetch('/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(task),
  });

  return response.json();
};

export const updateTask = async (id, updates) => {
  const token = getToken();
  const response = await fetch(`/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  return response.json();
};

export const deleteTask = async (id) => {
  const token = getToken();
  const response = await fetch(`/tasks/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.json();
};