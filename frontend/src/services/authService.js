// src/services/authService.js
import { Capacitor } from "@capacitor/core";
import { sqliteService } from "./sqliteService";
import axios from "axios";


export const authService = {
    sessionKey: null,
    saved: false,
    user: null,
    isNative: Capacitor.getPlatform() !== "web",

    // ------------------------------
    // INIT / LOAD
    // ------------------------------
    async load() {
        if (this.isNative) {
            await sqliteService.init();
            const row = await sqliteService.getAuth();
            if (row) {
                this.sessionKey = row.key;
                this.user = row.user;
                this.saved = true;
            }
            return;
        }

        const sk = sessionStorage.getItem("sessionKey");
        const logged = sessionStorage.getItem("loggedIn") === "true";
        const user = JSON.parse(localStorage.getItem("user") || "null");

        if (sk && logged && user) {
            this.sessionKey = sk;
            this.user = user;
            this.saved = true;
        }
    },

    // ------------------------------
    // LOGIN
    // ------------------------------
    async login({ username, password }) {
        const result = { ok: false, data: null, error: null };

        try {
            // --- Backend-Login ---
            const res = await axios.post("/login", { username, password });

            if (res.data?.token && res.data?.user) {
                const { token, user } = res.data;

                this.saveSession(token, user);
                result.ok = true;
                result.data = { token, user };
                return result;
            }

            result.error = res.data?.message || "Login fehlgeschlagen";
            return result;
        } catch (err) {
            console.warn(
                "Login fehlgeschlagen, versuche Offline-Login:",
                err.message
            );

            // ------------------------------
            // OFFLINE LOGIN
            // ------------------------------
            const offline = await this.tryOfflineLogin(username, password);

            if (offline.ok) return offline;
            return { ok: false, error: "Benutzername oder Passwort falsch." };
        }
    },

    // ------------------------------
    // OFFLINE LOGIN (Web + Native)
    // ------------------------------
    async tryOfflineLogin(username, password) {
        // Native (Capacitor + SQLite)
        if (this.isNative) {
            const row = await sqliteService.getAuth();
            if (row?.user?.username === username && row.user.password === password) {
                this.saveSession(row.key, row.user);
                return { ok: true, data: { token: row.key, user: row.user } };
            }
            return { ok: false };
        }

        // Web
        const user = JSON.parse(localStorage.getItem("user") || "null");
        const sk = sessionStorage.getItem("sessionKey");

        if (user?.username === username && user?.password === password && sk) {
            this.saveSession(sk, user);
            return { ok: true, data: { token: sk, user } };
        }

        return { ok: false };
    },

    // ------------------------------
    // SPEICHERN DER SESSION
    // ------------------------------
    async saveSession(token, user) {
        this.sessionKey = token;
        this.user = user;
        this.saved = true;

        if (this.isNative) {
            await sqliteService.setAuth(token, user);
            return;
        }

        sessionStorage.setItem("sessionKey", token);
        sessionStorage.setItem("loggedIn", "true");
        localStorage.setItem("user", JSON.stringify(user));
    },

    // ------------------------------
    // LOGOUT
    // ------------------------------
    async logout() {
        this.sessionKey = null;
        this.saved = false;
        this.user = null;

        if (this.isNative) {
            await sqliteService.removeAuth();
            return;
        }

        sessionStorage.removeItem("sessionKey");
        sessionStorage.removeItem("loggedIn");
        localStorage.removeItem("user");
    },

    // ------------------------------
    // CHECK LOGIN STATUS
    // ------------------------------
    async isLoggedIn() {
        if (this.isNative) {
            await sqliteService.init();
            const row = await sqliteService.getAuth();
            return !!row?.key;
        }
        return sessionStorage.getItem("loggedIn") === "true";
    },

    // ------------------------------
    // TOKEN REFRESH
    // ------------------------------
    async refreshToken() {
        if (!this.sessionKey || !this.user) return;

        try {
            const res = await axios.post("/refresh-token", {
                token: this.sessionKey,
            });

            if (res.data?.token) {
                await this.saveSession(res.data.token, this.user);
            }
        } catch (err) {
            console.warn("Token Refresh fehlgeschlagen:", err);
        }
    },
};
