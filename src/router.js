import { createRouter, createWebHashHistory } from "vue-router";

import Login from "./views/Login.vue";
import Start from "./views/Start.vue";
import Profile from "./views/Profile.vue";
import Kalenda from "./views/Speiseplan.vue";

import MainLayout from "./layouts/MainLayout.vue";

export const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        { path: "/", redirect: "/login" },

        { path: "/login", name: "login", component: Login },

        {
            path: "/kalenda/:shift?/:type?",
            name: "kalend",
            component: Kalenda,
            meta: { requiresAuth: true }
        },

        {
            path: "/",
            component: MainLayout,
            meta: { requiresAuth: true },
            children: [
                { path: "start", name: "start", component: Start },
                { path: "profile", name: "profile", component: Profile }
            ]
        },

        { path: "/:pathMatch(.*)*", redirect: "/login" }
    ]
});

router.beforeEach((to, from, next) => {
    const logged = sessionStorage.getItem("loggedIn");
    const remember = localStorage.getItem("rememberUser");

    if (remember && !logged) {
        sessionStorage.setItem("loggedIn", "true");
    }

    const isLogged = sessionStorage.getItem("loggedIn");

    if (to.name === "login") return next();

    if (to.meta.requiresAuth && !isLogged) {
        return next("/login");
    }

    next();
});
