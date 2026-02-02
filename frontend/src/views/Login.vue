<template>
    <div class="wrapper">

        <!-- HEADER -->
        <header class="header">
            <h1 class="title">Schulportal+</h1>
        </header>

        <!-- CONTENT -->
        <main class="content">

            <label class="form-row ">
                Teilnehmer-Nr.
                <input type="text" v-model="username" placeholder="Username"/>
            </label>

            <label class="form-row">
                Passwort
                <div class="password-container">
                    <input :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="Password"
                        class="password-input" />

                    <!-- Toggle-Icon direkt IM Feld -->
                    <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                        {{ showPassword ? "🙈" : "👁" }}
                    </button>
                </div>
            </label>


            <!-- Checkbox "Angemeldet bleiben" -->
            <label class="remember-row">
                <input type="checkbox" v-model="remember" />
                Angemeldet bleiben
            </label>

            <!-- Logo -->
            <div class="logo-container">
                <img :src="logoSrc" alt="Logo" class="app-logo" />
            </div>

            <!-- Fehler -->
            <p v-if="error" class="error">{{ error }}</p>
        </main>

        <!-- FOOTER / NAVIGATION -->
            <button @click="login" class="col-span-2 bg-red-100 text-red-700 ">Anmelden</button>

        <footer class="footer">
            <div></div>
        </footer>

    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { authService } from "../services/authService";

/* Icons */
import logoSrc from '@/assets/images/logo.png';

const router = useRouter();

const username = ref("");
const password = ref("");
const showPassword = ref(false);
const remember = ref(false);
const error = ref("");

// Auto-Login wenn SessionKey existiert
onMounted(() => {
    authService.load(() => {
        if (authService.isLoggedIn()) {
            console.log("Auto-Login aktiviert → weiter zu /start");
            router.push("/start");
        }
    });

    // Falls rememberUser aktiv → Username vorausfüllen
    const savedUser = localStorage.getItem("rememberUser");
    if (savedUser) {
        username.value = savedUser;
        remember.value = true;
    }
});

async function login() {
    console.log("LOGIN CLICKED");

    error.value = "";

    // Prüfung bleibt bestehen
    if (!username.value || !password.value) {
        error.value = "Bitte Benutzername und Passwort eingeben.";
        return;
    }

    // Login im AuthService
    const result = await authService.login({
        username: username.value,
        password: password.value
    });

if (!result || !result.ok) {
        error.value = result.error || "Benutzername oder Passwort falsch.";
        return;
    }

    // Remember me speichern (nur Username)
    if (remember.value) {
        localStorage.setItem("rememberUser", username.value);
    } else {
        localStorage.removeItem("rememberUser");
    }

    router.push("/start");
}
</script>
