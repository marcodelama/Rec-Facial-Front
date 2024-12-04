// src/services/AuthorizedUser.js
import axios from 'axios';

export default {
  // Obtener el token de autenticación desde el almacenamiento local
  getToken() {
    const tokenString = localStorage.getItem('token');
    return tokenString ? JSON.parse(tokenString) : null;
  },

  // Guardar el token en el almacenamiento local
  saveToken(token) {
    localStorage.setItem('token', JSON.stringify(token));
  },

  // Eliminar el token del almacenamiento local
  deleteToken() {
    localStorage.removeItem('token');
  },

  // Crear la instancia de Axios con la configuración base
  createAxiosInstance() {
    return axios.create({
      baseURL: process.env.VUE_APP_API_URL || 'http://127.0.0.1:8000', // Base URL de la API
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.getToken()}`, // Autorización con el token
      },
    });
  },
};
