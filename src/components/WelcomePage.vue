<template>
  <div class="welcome-container">
    <div class="content">
      <h1 class="title">Bienvenido</h1>
      <p class="subtitle">Sistema de Reconocimiento Facial</p>
      <div class="button-group">
        <button class="btn register" @click="navigateTo('RegistroFacial')">Registro</button>
        <!-- <button class="btn login" @click="navigateTo('login')">Login</button> -->
      </div>
    </div>
  </div>
</template>

<script>
import "../style/welcome.css"
export default {
  name:'WelcomePage',
  methods: {
    navigateTo(route) {
      this.$router.push({ name: route });
    },
  },
};
</script>