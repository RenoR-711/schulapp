<template>
    <div class="layout-wrapper">

        <!-- HEADER -->
        <header class="header">
            <h1 class="title">ISS Menü+</h1>
        </header>

        <!-- CONTENT -->
        <main class="content">
            <router-view />
        </main>

        <!-- FOOTER / NAVIGATION -->
        <nav class="nav">
            <button @click="$router.push('/start')" class="nav-btn">
                <img src="/css/images/icons/icon-circleleft.png" alt="Start"/>
                Start</button>
            <button @click="$router.push('/kalenda/0')" class="nav-btn">
                <img src="/css/images/icons/icon-calendar.png" alt="Kalender"/>
                Kalender</button>
            <button @click="$router.push('/start/profile')" class="nav-btn">
                <img src="/css/images/icons/icon-groups.png" alt="Start"/>
                Profil</button>
        </nav>
        <footer class="footer">
            <div>2025 Renumol Reinhardt</div>
        </footer>

    </div>
</template>

<script setup>
</script>
