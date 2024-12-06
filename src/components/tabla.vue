<template>
  <div class="table-container">
    <h2 class="text-center">Lista de Personas</h2>
    <table class="table">
      <thead>
        <tr>
          <th>Foto</th>
          <th>Nombre</th>
          <th>Apellidos</th>
          <th>DNI</th>
          <th>Asistencia</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="persona in personas" :key="persona.dni">
          <td>
            <img :src="persona.imagen" alt="Foto de la persona" class="person-photo" />
          </td>
          <td>{{ persona.nombre }}</td>
          <td>{{ persona.apellido_paterno }} {{ persona.apellido_materno }}</td>
          <td>{{ persona.dni }}</td>
          <td>
            <div v-if="persona.asistencias.length > 0">
              <p v-for="asistencia in persona.asistencias" :key="asistencia.dia_registrado">
                Día: {{ asistencia.dia_registrado }}<br />
                Entrada: {{ asistencia.hora_entrada }}<br />
                Salida: {{ asistencia.hora_salida }}
              </p>
            </div>
            <div v-else>No hay asistencia registrada</div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'TablaPersonas',
  data() {
    return {
      personas: [], // Lista vacía que almacenará los datos de la API
    };
  },
  methods: {
    async obtenerPersonas() {
      try {
        const response = await axios.get('http://127.0.0.1:8000/personas/');
        this.personas = response.data.data; // Asignar los datos de la API
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      }
    },
  },
  mounted() {
    this.obtenerPersonas(); // Llamar al método cuando se monta el componente
  },
};
</script>

<style scoped>
.table-container {
  width: 80%;
  margin: 20px auto;
}
.table {
  width: 100%;
  border-collapse: collapse;
}
.table th, .table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
.table th {
  background-color: #f2f2f2;
}
.text-center {
  text-align: center;
}
.person-photo {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 50%;
}
</style>
