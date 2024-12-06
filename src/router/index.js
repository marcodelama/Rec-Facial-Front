import { createRouter, createWebHistory } from 'vue-router';
import WelcomePage from '../components/WelcomePage.vue'; // Asegúrate de que la ruta sea correcta
import RegistroFacial from '../components/RegistroFacial.vue'; // Asegúrate de que la ruta sea correcta

const routes = [
  {
    path: '/',
    name: 'WelcomePage',
    component: WelcomePage
  },
  {
    path: '/registro',
    name: 'RegistroFacial',
    component: RegistroFacial
  }
];

const MyRouter = createRouter({
  history: createWebHistory(),
  routes
});

export default MyRouter;
