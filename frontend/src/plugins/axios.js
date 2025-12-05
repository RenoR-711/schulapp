// src/plugins/axios.js
import axios from "axios";
import { authService } from "@/services/authService";

// Basis-URL auf Laravel API
axios.defaults.baseURL = "http://127.0.0.1:8000/api";

// Mit Credentials senden (für Sanctum / Cookies, falls genutzt)
axios.defaults.withCredentials = true;

// Für Laravel / Sanctum üblich
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

// Request Interceptor: Token automatisch setzen
axios.interceptors.request.use(
    (config) => {
        const token = authService.sessionKey || sessionStorage.getItem("sessionKey");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response-Interceptor für Fehler-Handling
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        if (status === 401) {
            console.warn("Nicht authentifiziert (401) – evtl. Session abgelaufen.");

            // Optional: Session im Frontend aufräumen
            if (authService.logout) {
                authService.logout();
            } else if (authService.clearSession) {
                authService.clearSession();
            }

            // Hier könntest du auch auf /login routen, falls gewünscht
            // router.push({ name: "login" });
        }

        console.error("API Error:", error.response?.data || error.message || error);
        return Promise.reject(error);
    }
);

export default axios;