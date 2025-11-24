// @ts-nocheck
// src/services/authService.js

// import { BASE_URL } from "../utils/config"; 
// Basis-URL für das Backend (später anpassen)

export const authService = {
    sessionKey: null,
    saved: false,
    cred: null,

    // ------------------------------------------------------------
    // Session laden beim Start
    // ------------------------------------------------------------
    async load(cb) {
        const sk = sessionStorage.getItem("sessionKey");
        const logged = sessionStorage.getItem("loggedIn") === "true";

        // Wenn Session vorhanden → Benutzer eingeloggt
        if (sk && logged) {
            this.sessionKey = sk;
            this.saved = true;
        } else {
            // Falls nicht → sauber zurücksetzen
            this.sessionKey = null;
            this.saved = false;
        }

        cb?.();
    },

    // ------------------------------------------------------------
    // Login: Nur Passwort wird verglichen (Benutzername wird ignoriert)
    // ------------------------------------------------------------
    async login(credentials) {
        console.log("LOGIN:", credentials);

        // 1) Passwort aus localStorage holen
        const storedPassword = localStorage.getItem("userPassword");

        if (!storedPassword) {
            // noch nie im Profil ein Passwort gesetzt
            return { ok: false, error: "Es wurde noch kein Passwort gesetzt." };
        }

        // 2) Nur Passwort vergleichen (Username wird ignoriert)
        if (credentials.password !== storedPassword) {
            return { ok: false, error: "Benutzername oder Passwort falsch." };
        }

        // 3) Session erzeugen
        const sessionKey = "LOCAL-SESSION-" + Date.now();
        this.sessionKey = sessionKey;
        this.saved = true;
        this.cred = credentials;

        sessionStorage.setItem("sessionKey", sessionKey);
        sessionStorage.setItem("loggedIn", "true");

        return { ok: true, data: { sessionKey } };
    },

    // ------------------------------------------------------------
    // Logout
    // ------------------------------------------------------------
    logout() {
        this.sessionKey = null;
        this.saved = false;
        this.cred = null;

        sessionStorage.removeItem("sessionKey");
        sessionStorage.removeItem("loggedIn");
        localStorage.removeItem("rememberUser"); // optional
    },

    // ------------------------------------------------------------
    // Login-Status
    // ------------------------------------------------------------
    isLoggedIn() {
        // nutzt nun sessionStorage, damit Reloads funktionieren
        return sessionStorage.getItem("loggedIn") === "true";
    }
};
