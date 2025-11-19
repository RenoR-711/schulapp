// src/services/authService.js
// import { BASE_URL } from "../utils/config"; 
// Basis-URL für das Backend (später anpassen)
export const authService = {
    sessionKey: null,
    saved: false,
    cred: null,

    async load(cb) {
        // Session wiederherstellen
        const sk = sessionStorage.getItem("sessionKey");

        if (sk) {
            this.sessionKey = sk;
            this.saved = true;
        }

        cb?.();
    },

    async login(credentials) {
        console.log("FAKE LOGIN:", credentials);
        // Fake-Login
        const FAKE_USER = "test";
        const FAKE_PASS = "1234";

        if (
            credentials.username === FAKE_USER &&
            credentials.password === FAKE_PASS
        ) {
            const fakeSession = "FAKE-SESSION-KEY";

            this.sessionKey = fakeSession;
            this.cred = credentials;
            this.saved = true;

            sessionStorage.setItem("sessionKey", fakeSession);

            return { ok: true, data: { sessionKey: fakeSession } };
        }

        /*
        =====================================================
        🧩 HIER kommt später das echte Backend-Login hin:
        =====================================================
        
        try {
            const res = await fetch(`${BASE_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(credentials)
            });

            if (!res.ok) throw new Error("Ungültige Login-Daten");

            const data = await res.json();

            this.sessionKey = data.sessionKey;
            sessionStorage.setItem("sessionKey", data.sessionKey);

            return { ok: true, data };
        } catch (err) {
            return { ok: false, error: err.message };
        }
        */

        return { ok: false, error: "Ungültige Login-Daten" };
    },

    logout() {
        this.sessionKey = null;
        this.saved = false;
        this.cred = null;

        sessionStorage.removeItem("sessionKey");
    },

    isLoggedIn() {
        return !!this.sessionKey;
    }
};