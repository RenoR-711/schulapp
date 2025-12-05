import { createRouter, createWebHashHistory } from "vue-router";

import Login from "@/views/Login.vue";
import Start from "@/views/Start.vue";
import Profile from "@/views/Profile.vue";
import Kurse from "@/views/Kurse.vue";
import Vertretungsplan from "@/views/Vertretungsplan.vue";
import MainLayout from "@/layouts/MainLayout.vue";

import { authService } from "@/services/authService";

const routes = [
    // Standard-Route → Login
    { path: "/", redirect: "/login" },
    // Login – nur zugänglich, wenn NICHT eingeloggt
    {
      path: "/login",
      name: "login",
      component: Login,
      meta: { guestOnly: true },
    },
    // Geschützter Bereich
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
            showInProfile: true,
          },
        },
        {
          path: "profile",
          name: "Profile",
          component: Profile,
          meta: { requiresAuth: true, title: "Profile", showInProfile: true },
        },
        {
          path: "kalender",
          name: "Kalender",
          component: () => import("@/views/Kalender.vue"),
          meta: { requiresAuth: true, title: "Kalender", showInProfile: true },
        },
        {
          path: "speiseplan/:shift?/:type?",
          name: "Speiseplan",
          component: () => import("@/views/Speiseplan.vue"),
          meta: {
            requiresAuth: true,
            title: "Speiseplan",
            showInProfile: true,
            hideGlobalNav: true,
          },
        },
        {
          path: "kurse",
          name: "Kurse",
          component: Kurse,
          meta: { requiresAuth: true, title: "Kurse", showInProfile: true },
        },
        {
          path: "vertretungsplan",
          name: "Vertretungsplan",
          component: Vertretungsplan,
          meta: {
            requiresAuth: true,
            title: "Vertretungsplan",
            showInProfile: true,
          },
        },
      ],
    },
    // Catch-All → Login
    { path: "/:pathMatch(.*)*", redirect: "/login" },
  ]
export const router = createRouter({ history: createWebHashHistory(), routes });

/* ------------------------------------------------------------
 * Router Guard
 * ------------------------------------------------------------ */
router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true;
  const logged = await authService.isLoggedIn();
  if (!logged) return "/login";
  await authService.refreshToken();
  return true;
});