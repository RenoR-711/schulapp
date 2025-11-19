import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router'; // ← Router laden
import './style.css'; // global styles
import './assets/main.css';// Tailwind
import '../public/css/icon-pack.css'; // eigene styles

const app = createApp(App);
app.use(router);                     // ← Router aktivieren
app.mount('#app');