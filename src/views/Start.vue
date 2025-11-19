<template>
	<div class="p-4">

		<!-- Titel -->
		<h1 class="text-xl font-semibold mb-6 text-center">
			Start
		</h1>

		<!-- GRID NAVIGATION -->
		<div class="grid grid-cols-2 gap-4">

			<button @click="goKalender" class="tile">
				<img src="/css/images/essen.png" width="20%" alt="Speiseplan">
				<span>Speiseplan</span>
			</button>

			<button @click="goKurse" class="tile">
				<img src="/css/images/kurse.png" width="20%" alt="Kurse">
				<span>Kurse</span>
			</button>

			<button @click="goKonto" class="tile">
				💳 <span>Kontoauszug</span>
			</button>

			<button @click="goProfile" class="tile">
				<img src="/css/images/icons/icon-user.png" width="20%" alt="Stammdaten">
				<span>Stammdaten</span>
			</button>

			<button @click="goVertretungsplan" class="tile">
				<img src="/css/images/icons/icon-intersection.png" width="20%" alt="Vertretungsplan">
				<span>Vertretungsplan</span>

			</button>

			<button @click="goKontakt" class="tile">
				📞 <span>Kontakt</span>
			</button>

			<!-- LOGOUT - nimmt volle Zeile ein -->
			<button @click="logout" class="col-span-2 tile bg-red-100 text-red-700">
				<img src="/css/images/icons/icon-off.png" width="10%" alt="Logout">
				Abmelden
			</button>

		</div>

	</div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// Badge-Beispiel (später mit API verbinden)
const vertretungen = ref(0);

// Navigation
const goKalender = () => router.push("/kalenda/0");  // neuer Pfad zu Kalenda.vue
const goKurse = () => router.push("/kurse");          // wenn du später eine Kurse.vue hinzufügst
const goKonto = () => router.push("/konto");          // dito
const goProfile = () => router.push("/profile");
const goVertretungsplan = () => router.push("/vertretungsplan");
const goKontakt = () => router.push("/kontakt");


const logout = () => {
	sessionStorage.removeItem("loggedIn");  // <- korrekt!
	sessionStorage.removeItem("sessionKey");
	localStorage.removeItem("rememberUser"); // falls aktiviert
	router.push("/login");
};

</script>

<style>
.tile {
	background-color: white;
	border: 1px solid #e5e7eb;
	border-radius: 0.75rem;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
	padding: 1rem;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	font-size: 1.125rem;
	font-weight: 500;
	transition: background-color 0.2s;
}
</style>
