<template>
	<div id="profile" class="profile-page">

		<!-- HEADER -->
		<header class="header">
			<nav aria-label="Stammdaten">
				<ul>
					<li>
						<a @click.prevent="start">Start…</a>
					</li>
				</ul>
			</nav>
		</header>

		<!-- CONTENT -->
		<main class="content">

			<!-- USER NAME -->
			<ul class="profile-list">
				<li class="profile-name">
					<span>{{ user.userFullName }}</span>
				</li>

				<!-- PROFILE PICTURE + ACTIONS -->
				<li class="profile-row">

					<!-- Profilbild -->
					<button @click.prevent="fotoMenu" class="profile-pic-btn" title="Bild ändern">
						<img class="profile-pic" :src="user.userPic || defaultPic" alt="Profilbild" />
					</button>

					<!-- Aktionen -->
					<div class="profile-actions">

						<nav aria-label="Profil-Aktionen">
							<ul>
								<li><a @click="editPassword">Passwort ändern</a></li>
							</ul>
						</nav>

						<nav aria-label="Einstellungen">
							<ul>
								<li><a @click="editOptions">Einstellungen</a></li>
							</ul>
						</nav>

					</div>

				</li>

			</ul>

			<!-- FOTO POPUP -->
			<div v-if="popupFoto" class="popup">
				<h1>Bild</h1>

				<div class="popup-buttons">
					<button @click="uploadFoto(1)">Kamera</button>
					<button @click="uploadFoto(2)">Foto wählen</button>
					<button @click="removeFoto">Löschen</button>
					<button @click="closePopup">Schließen</button>
				</div>
			</div>

			<!-- OPTIONEN POPUP -->
			<div v-if="popupOptions" class="popup">
				<h1>Einstellungen</h1>

				<label for="startSeite">Ihre Startseite:</label>
				<select v-model="startSeite" id="startSeite">
					<option v-for="p in pages" :key="p.name" :value="p.name">
						{{ p.title }}
					</option>
				</select>

				<div class="popup-buttons">
					<button @click="saveOptions">OK</button>
					<button @click="closePopup">Abbrechen</button>
				</div>
			</div>

			<!-- PASSWORT POPUP -->
			<div v-if="popupPassword" class="popup">
				<h1>Passwort ändern</h1>

				<label for="pwd1">Neues Passwort:</label>
				<input id="pwd1" v-model="pwd.pwd1" type="password" autocomplete="off" />

				<label for="pwd2">Wiederholung:</label>
				<input id="pwd2" v-model="pwd.pwd2" type="password" autocomplete="off" />

				<p v-if="pwd.error" class="error">{{ pwd.error }}</p>

				<div class="popup-buttons">
					<button @click="savePassword">OK</button>
					<button @click="closePopup">Abbrechen</button>
				</div>
			</div>

		</main>
	</div>
</template>

<script>
export default {
	name: "Profile",

	data() {
		return {
			user: {
				userFullName: "",
				userPic: "",
			},
			defaultPic: "css/images/default.png",

			popupFoto: false,
			popupOptions: false,
			popupPassword: false,

			startSeite: "",
			pages: [],

			pwd: {
				pwd1: "",
				pwd2: "",
				error: "",
			},
		};
	},

	methods: {
		start() {
			console.log("Start klicken → Navigation möglich");
			this.$router.push("/start");
		},

		fotoMenu() {
			this.popupFoto = true;
		},

		uploadFoto(option) {
			console.log("Foto Option:", option);
			// CAMERA / FILELOGIC hier einfügen
		},

		removeFoto() {
			this.user.userPic = "";
			this.popupFoto = false;
		},

		editPassword() {
			this.popupPassword = true;
		},

		editOptions() {
			this.popupOptions = true;
		},

		saveOptions() {
			console.log("Optionen speichern:", this.startSeite);
			this.popupOptions = false;
		},

		savePassword() {
			if (this.pwd.pwd1 !== this.pwd.pwd2) {
				this.pwd.error = "Passwörter stimmen nicht überein!";
				return;
			}
			console.log("Passwort gesetzt");
			this.popupPassword = false;
		},

		closePopup() {
			this.popupFoto = false;
			this.popupOptions = false;
			this.popupPassword = false;
		}
	}
};
</script>

<style scoped>
.profile-row {
	display: flex;
	align-items: center;
	gap: 1rem;
	margin-bottom: 1.5rem;
}

.profile-pic-btn {
	border: none;
	background: none;
	padding: 0;
	cursor: pointer;
}

.profile-pic {
	width: 100px;
	height: 100px;
	border-radius: 8px;
	object-fit: cover;
}

.profile-actions nav {
	margin-bottom: 0.5rem;
}

.profile-actions a {
	cursor: pointer;
	color: #0074d9;
}

.error {
	background: #fee2e2;
	/* sehr helles Rot */
	color: #b91c1c;
	/* dunkles Rot */
	padding: 0.75rem 1rem;
	border-radius: 8px;
	border-left: 4px solid #dc2626;
	font-size: 0.9rem;
	line-height: 1.4;
	margin-top: 0.75rem;
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.error::before {
	content: "⚠️";
	font-size: 1.2rem;
}

@media (prefers-color-scheme: dark) {
	.error {
		background: #7f1d1d;
		color: #fee2e2;
		border-left-color: #ef4444;
	}
}

</style>
