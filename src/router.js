// src/router.js
import { createRouter, createWebHashHistory } from "vue-router";

import Login from "@/views/Login.vue";
import Start from "@/views/Start.vue";
import Profile from "@/views/Profile.vue";
import Speiseplan from "@/views/Speiseplan.vue";
import Kurse from "@/views/Kurse.vue";
import Vertretungsplan from "@/views/Vertretungsplan.vue";
import MainLayout from "@/layouts/MainLayout.vue";

import { authService } from "@/services/authService";

// ------------------------------------------------------------
// ROUTES
// ------------------------------------------------------------
const routes = [
    // Standard-Route: immer zuerst auf Login
    {
        path: "/",
        redirect: "/login",
    },

    // Login-Seite (nur für nicht eingeloggte Benutzer)
    {
        path: "/login",
        name: "login",
        component: Login,
        meta: { guestOnly: true },
    },

    // Geschützter Bereich mit MainLayout
    {
        path: "/",
        component: MainLayout,
        meta: { requiresAuth: true },
        children: [
            {
                path: "start",
                name: "Start",
                component: Start,
                meta: {
                    requiresAuth: true,
                    title: "Startseite",
                    showInProfile: true
                }
            },
            {
                path: "profile",
                name: "Profile",
                component: Profile,
                meta: {
                    requiresAuth: true,
                    title: "Profile",
                    showInProfile: true
                }
            },
            {
                // Speiseplan (Kalender) mit optionalen Parametern
                path: "speiseplan/:shift?/:type?",
                name: "Speiseplan",
                component: Speiseplan,
                meta: {
                    requiresAuth: true,
                    title: "Speiseplan",
                    showInProfile: true
                }
            },
            {
                path: "kurse",
                name: "Kurse",
                component: Kurse,
                meta: {
                    requiresAuth: true,
                    title: "Kurse",
                    showInProfile: true
                }
            },
            {
                path: "vertretungsplan",
                name: "Vertretungsplan",
                component: Vertretungsplan,
                meta: {
                    requiresAuth: true,
                    title: "Vertretungsplan",
                    showInProfile: true
                }
            },
        ],
    },

    // Fallback: Unbekannte Route → Login
    {
        path: "/:pathMatch(.*)*",
        redirect: "/login",
    },
];

// ------------------------------------------------------------
// ROUTER
// ------------------------------------------------------------
export const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

// ------------------------------------------------------------
// GLOBALER NAVIGATIONSGUARD
// ------------------------------------------------------------
let authLoaded = false;

router.beforeEach(async (to, from, next) => {
    // Auth-Status einmalig beim ersten Navigation-Aufruf laden
    if (!authLoaded) {
        await authService.load();
        authLoaded = true;
    }

    const loggedIn = authService.isLoggedIn();

    // 1) Seiten, die Login erfordern
    if (to.meta.requiresAuth && !loggedIn) {
        // nicht eingeloggt → zurück zur Login-Seite
        return next({
            name: "login",
            replace: true,
            query: { redirect: to.fullPath },
        });
    }

    // 2) Login-Seite nur für Gäste
    if (to.meta.guestOnly && loggedIn) {
        // schon eingeloggt → direkt zur Startseite
        return next({
            name: "Start",
            replace: true,
        });
    }

    // 3) alles ok → weiter
    next();
});
