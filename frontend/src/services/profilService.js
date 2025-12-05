// src/services/profilService.js
import { Capacitor } from "@capacitor/core";
import { sqliteService } from "@/services/sqliteService";

class ProfilService {
    constructor() {
        this.isNative = Capacitor.getPlatform() !== "web";
    }

    /* ------------------------------------------------------------
     * Profil laden
     * ------------------------------------------------------------ */
    async getProfile() {
        if (this.isNative) {
            await sqliteService.init();
            return await sqliteService.getUserData();
        } else {
            return {
                username: sessionStorage.getItem("username"),
                password: sessionStorage.getItem("password"),
                key: sessionStorage.getItem("sessionKey"),
                name: sessionStorage.getItem("name"),
            };
        }
    }

    /* ------------------------------------------------------------
     * Profil speichern
     * ------------------------------------------------------------ */
    async saveProfile({ username, password, name, key = null }) {
        if (this.isNative) {
            await sqliteService.setUserData({
                username,
                password,
                name,
                key,
            });
        } else {
            sessionStorage.setItem("username", username);
            sessionStorage.setItem("password", password);
            sessionStorage.setItem("name", name);
            if (key) sessionStorage.setItem("sessionKey", key);
        }
    }

    /* ------------------------------------------------------------
     * Profil löschen
     * ------------------------------------------------------------ */
    async removeProfile() {
        if (this.isNative) {
            await sqliteService.removeUserData();
        } else {
            sessionStorage.removeItem("username");
            sessionStorage.removeItem("password");
            sessionStorage.removeItem("name");
            sessionStorage.removeItem("sessionKey");
        }
    }
}

export const profilService = new ProfilService();
