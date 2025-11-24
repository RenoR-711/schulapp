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
        <nav class="flex justify-around items-center bg-gray-100 py-0">
            <button @click="$router.push('/start')" class="footer-btn">
                <img src="/css/images/icons/icon-circleleft.png" alt="Start"/>
                Start</button>
            <button @click="$router.push('/kalenda/0')" class="footer-btn">
                <img src="/css/images/icons/icon-calendar.png" alt="Kalender"/>
                Kalender</button>
            <button @click="$router.push('/start/profile')" class="footer-btn">
                <img src="/css/images/icons/icon-groups.png" alt="Start"/>
                Profil</button>
        </nav>
        <footer class="footer">
            <div> 2025 -  {{ copyrightMsg }} </div>
        </footer>

    </div>
</template>

<script setup>
import { ref } from "vue";
const copyrightMsg = ref(" Renumol Reinhardt ©");
</script>
