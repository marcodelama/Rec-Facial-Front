<template>
  <div id="app">
    <TablaPersonas />
  </div>
</template>

<script>
// Importa el componente tabla.vue
import TablaPersonas from './components/tabla.vue'

export default {
  name: 'App',
  components: {
    TablaPersonas // Usa el componente TablaPersonas
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>