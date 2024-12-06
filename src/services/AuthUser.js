// src/services/AuthorizedUser.js

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
};
