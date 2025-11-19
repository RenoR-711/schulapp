// src/services/navigationService.js
import { router } from "@/router";

export const navigationService = {
    current: null,

    setCurrent(obj) {
        this.current = obj;
    },

    go(nameOrPath, params) {
        // Beispiel: name-basierte Navigation
        if (typeof nameOrPath === "string" && !nameOrPath.startsWith("/")) {
            router.push({ name: nameOrPath, params: params || {} }).catch(() => { });
        } else {
            router.push(nameOrPath).catch(() => { });
        }
    }
};
