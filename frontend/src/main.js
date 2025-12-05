// src/main.js
import axios from "axios";
import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router";
import { authService } from "./services/authService";
import "./plugins/axios"; // Axios global konfigurieren

// Tailwind minimal
// import './assets/css/tailwind.css'

// Meine Styles
import "./assets/css/style.css"; //tailwind overrides
import "./assets/css/main.css";
import "./assets/css/icon-pack.css";

axios.defaults.baseURL = "http://127.0.0.1:8000/api"; // Laravel API-URL

// ----------------- Top-level await -----------------
await authService.load();

const app = createApp(App);
app.use(router);
app.mount("#app");