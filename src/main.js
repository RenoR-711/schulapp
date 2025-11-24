// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import { authService } from './services/authService';
import { router } from './router'

// Tailwind minimal
// import './assets/css/tailwind.css'

// Meine Styles
import './assets/css/style.css' //tailwind overrides
import './assets/css/main.css'
import './assets/css/icon-pack.css'

authService.load(() => {
    const app = createApp(App)

    // Router aktivieren
    app.use(router)

    // App mounten
    app.mount('#app');
});
