// @ts-nocheck
import { BASE_URL } from "@/utils/config";

class ApiService {
    constructor(baseURL = BASE_URL) {
        this.baseURL = baseURL;
    }

    // GET Request
    async get(endpoint) {
        try {
            const res = await fetch(`${this.baseURL}${endpoint}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // für Cookies/Session
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (err) {
            console.error("GET Fehler:", err);
            throw err;
        }
    }

    // POST Request
    async post(endpoint, payload) {
        try {
            const res = await fetch(`${this.baseURL}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (err) {
            console.error("POST Fehler:", err);
            throw err;
        }
    }
}

export const apiService = new ApiService();
