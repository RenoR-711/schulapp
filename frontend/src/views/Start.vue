<template>
	<div class="wrapper">

		<!-- Titel -->
		<h1 class="text-xl font-semibold mb-6 text-center">
			Start
		</h1>

		<!-- GRID NAVIGATION -->
		<div class="grid grid-cols-2 gap-2 ">

			<button @click="goSpeiseplan" class="nav-btn">
				<img :src="iconessen" width="20%" alt="Speiseplan">
				<span>Speiseplan</span>
			</button>

			<button @click="goKurse" class="nav-btn">
				<img :src="iconKurse" width="20%" alt="Kurse">
				<span>Kurse</span>
			</button>

			<button @click="goKonto" class="nav-btn">
				💳 <span>Kontoauszug</span>
			</button>

			<button @click="goProfile" class="nav-btn">
				<img :src="iconUser" width="20%" alt="Stammdaten">
				<span>Stammdaten</span>
			</button>

			<button @click="goVertretungsplan" class="nav-btn">
				<img :src="iconIntersection" width="20%" alt="Vertretungsplan">
				<span>Vertretungsplan</span>

			</button>

			<button @click="goKontakt" class="nav-btn">
				📞 <span>Kontakt</span>
			</button>

			<!-- LOGOUT - nimmt volle Zeile ein -->
			<button @click="logout" class="col-span-2 tile bg-red-100 text-red-700">
				<img :src="iconOff" width="10%" alt="Logout">
				Abmelden
			</button>

		</div>

	</div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { authService } from "@/services/authService";

/* Icons */
import iconUser from '@/assets/images/icon-user.png';
import iconIntersection from '@/assets/images/icon-intersection.png';
import iconOff from '@/assets/images/icon-off.png';
import iconKurse from '@/assets/images/kurse.png'
import iconessen from '@/assets/images/essen.png'

const router = useRouter();

// Badge-Beispiel (später mit API verbinden)
const vertretungen = ref(0);

// Navigation
const goSpeiseplan = () => router.push("/speiseplan/0");  // neuer Pfad zu Speiseplan.vue
const goKurse = () => router.push("/kurse");          // wenn du später eine Kurse.vue hinzufügst
const goKonto = () => router.push("/konto");          // dito
const goProfile = () => router.push("/profile");
const goVertretungsplan = () => router.push("/vertretungsplan");
const goKontakt = () => router.push("/kontakt");


const logout = () => {
	console.log("LOGOUT FUNKTION WIRD AUSGEFÜHRT!");
	authService.logout();                // Entfernt sessionKey, loggedIn, user-data
	router.replace({ name: "login" });      // Zur Login-Seite
};

</script>


