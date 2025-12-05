<template>
    <div class="wrapper">

        <!-- HEADER -->
        <header class="header">
            <h1 class="title">ISS Menü+</h1>
        </header>

        <!-- CONTENT -->
        <main class="content">
            <router-view />
        </main>

        <!-- FOOTER / NAVIGATION -->
        <nav v-if="showGlobalNav" class="flex justify-around items-center bg-gray-100 py-0">
            <button @click="$router.push('/start')" class="footer-btn">
                <img :src="iconcircleleft" alt="Start" />
                Start
            </button>

            <button @click="$router.push('/kalender')" class="footer-btn">
                <img :src="iconcalendar" alt="Kalender" />
                Kalender
            </button>

            <button @click="$router.push('/profile')" class="footer-btn">
                <img :src="iconcircleright" alt="Profil" />
                Profil
            </button>
        </nav>

        <footer class="footer">
            <div> 2025 - {{ copyrightMsg }} </div>
        </footer>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute } from "vue-router";

/* Icons */
import iconcircleleft from "@/assets/images/icon-circleleft.png";
import iconcalendar from "@/assets/images/icon-calendar.png";
import iconcircleright from "@/assets/images/icon-circleright.png";


const route = useRoute();

const showGlobalNav = computed(() => !route.meta.hideGlobalNav);

const copyrightMsg = ref(" Renumol Reinhardt ©");
</script>
