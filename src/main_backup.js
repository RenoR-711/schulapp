import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router'; // ← Router laden
import './style.css'; // Tailwind + global styles
import './assets/main.css';

const app = createApp(App);
app.use(router);                     // ← Router aktivieren
app.mount('#app');