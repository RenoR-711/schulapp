<template>
	<div class="wrapper">

		<!-- HEADER -->
		<header class="header">
			<h1 class="text-3xl font-semibold tracking-tight">Profil</h1>
		</header>

		<!-- CONTENT -->
		<main class="content">

			<!-- UNSICHTBARES FILE INPUT -->
			<input type="file" ref="fileInput" accept="image/*" style="display:none" @change="onFileChange" />

			<!-- USER NAME -->
			<ul class="profile-list">
				<li class="profile-name">
					<span>{{ user.userFullName }}</span>
				</li>

				<!-- PROFILE PICTURE + ACTIONS -->
				<li class="profile-row">

					<!-- Profilbild -->
					<button @click.prevent="fotoMenu" class="profile-pic-btn" title="Bild ändern">
						<img class="profile-pic" :src="avatarPic || user.userPic || defaultPic" alt="Profilbild" />
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

			<!-- FOTO ACTION SHEET -->
			<div v-if="popupFoto" class="sheet-backdrop" @click="closePopup">

				<div class="sheet" @click.stop>

					<p class="sheet-title">Profilbild</p>

					<ul class="sheet-list">
						<li>
							<button class="sheet-btn" @click="openCamera">
								📷 Foto aufnehmen
							</button>
						</li>

						<li>
							<button class="sheet-btn" @click="triggerFileInput">
								🖼 Aus Galerie wählen
							</button>
						</li>

						<li v-if="user.userPic">
							<button class="sheet-btn sheet-btn-danger" @click="removeFoto">
								🗑 Bild löschen
							</button>
						</li>
					</ul>

					<button class="sheet-cancel" @click="closePopup">
						Abbrechen
					</button>

				</div>
			</div>

			<!-- CROP POPUP -->
			<div v-if="popupCrop" class="popup">

				<h1>Bild zuschneiden</h1>

				<!-- Vorschau -->
				<img :src="cropImage" alt="Zum Zuschneiden" style="max-width: 50%; margin-bottom:1rem;" />

				<!-- Unsichtbares Canvas zum finalen Crop -->
				<canvas ref="cropCanvas" style="display:none;"></canvas>

				<div class="popup-buttons">
					<button @click="cropImageNow">✔ Zuschneiden</button>
					<button @click="closePopup">❌ Abbrechen</button>
				</div>

			</div>

			<!-- PASSWORT POPUP -->
			<div v-if="popupPassword" class="form-row dialog-box fixed left-1/2 -translate-x-1/2 w-auto max-w-[90%] px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm transition-all z-[10000]"
            :style="{ top: popupTop }">
				<h1>Passwort ändern</h1>

				<label for="pwd1">Neues Passwort:</label>
				<div class="password-container">
					<input id="pwd1" class="password-input" v-model="pwd.pwd1"
						:type="showPassword1 ? 'text' : 'password'" autocomplete="off" />
					<button type="button" class="toggle-password" @click="toggleShowPassword1">
						{{ showPassword1 ? "🙈" : "👁" }}
					</button>
				</div>

				<label for="pwd2">Wiederholung:</label>
				<div class="password-container">
					<input id="pwd2" class="password-input" v-model="pwd.pwd2"
						:type="showPassword2 ? 'text' : 'password'" autocomplete="off" />
					<button type="button" class="toggle-password" @click="toggleShowPassword2">
						{{ showPassword2 ? "🙈" : "👁" }}
					</button>
				</div>

				<p v-if="pwd.error" class="error">{{ pwd.error }}</p>

				<div class="popup-buttons">
					<button @click="savePassword" class="ok">OK</button>

					<button @click="closePopup" class="cansel">Abbrechen</button>
				</div>
			</div>

			<!-- OPTIONEN POPUP -->
			<div v-if="popupOptions" class="dialog-box fixed left-1/2 -translate-x-1/2 w-auto max-w-[90%] px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm transition-all z-[10000]"
            :style="{ top: popupTop }">
				<h1>Einstellungen</h1>

				<label for="startSeite">Ihre Startseite:</label>
				<select v-model="startSeite" id="startSeite" class="tile">
					<option v-for="p in pages" :key="p.name" :value="p.name">
						{{ p.title }}
					</option>
				</select>

				<div class="popup-buttons">
					<button @click="saveOptions" class="ok">OK</button>
					<button @click="closeOptionsPopup" class="cansel">Abbrechen</button>
				</div>
			</div>

		</main>
	</div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import defaultPic from "@/assets/images/default.png";

// ------------------------------------------------------------
// STATE
// ------------------------------------------------------------
const user = reactive({
	userFullName: "",
	userPic: "",
	userPassword: "",
});

// Rundes Avatar später aus Canvas
const avatarPic = ref("");

// Popups
const popupFoto = ref(false);
const popupCrop = ref(false);
const popupPassword = ref(false);

// Crop Bild
const cropImage = ref(null);

// file input ref
const fileInput = ref(null);

// Passwort
const pwd = reactive({
	pwd1: "",
	pwd2: "",
	error: "",
});

// 👁‍🗨 Passwort anzeigen/verbergen
const showPassword1 = ref(false);
const showPassword2 = ref(false);

const toggleShowPassword1 = () => showPassword1.value = !showPassword1.value;
const toggleShowPassword2 = () => showPassword2.value = !showPassword2.value;

// ------------------------------------------------------------
// Helper: Aus Base64 → square + runder Avatar
// ------------------------------------------------------------
const buildAvatarFromBase64 = (base64) => {
	return new Promise((resolve) => {
		const img = new Image();
		img.onload = () => {

			const size = Math.min(img.width, img.height);

			// Quadratisches Canvas
			const squareCanvas = document.createElement("canvas");
			squareCanvas.width = size;
			squareCanvas.height = size;
			const sctx = squareCanvas.getContext("2d");

			sctx.drawImage(
				img,
				(img.width - size) / 2,
				(img.height - size) / 2,
				size,
				size,
				0,
				0,
				size,
				size
			);

			// Rundes Canvas
			const avatarCanvas = document.createElement("canvas");
			avatarCanvas.width = size;
			avatarCanvas.height = size;
			const actx = avatarCanvas.getContext("2d");

			actx.beginPath();
			actx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
			actx.closePath();
			actx.clip();

			actx.drawImage(squareCanvas, 0, 0);

			resolve({
				square: squareCanvas.toDataURL("image/jpeg", 0.9),
				avatar: avatarCanvas.toDataURL("image/png")
			});
		};

		img.src = base64;
	});
};

// ------------------------------------------------------------
// 1) FOTO WÄHLEN (Datei)
// ------------------------------------------------------------
const triggerFileInput = () => {
	fileInput.value.click();
};

const onFileChange = (event) => {
	const file = event.target.files[0];
	if (!file) return;

	const reader = new FileReader();
	reader.onload = () => {
		cropImage.value = reader.result; // Base64
		popupFoto.value = false;
		popupCrop.value = true; // Crop starten
	};
	reader.readAsDataURL(file);
};

// ------------------------------------------------------------
// 2) KAMERA ÖFFNEN (Browser)
// ------------------------------------------------------------
const openCamera = async () => {
	try {
		const stream = await navigator.mediaDevices.getUserMedia({ video: true });
		const video = document.createElement("video");
		video.srcObject = stream;
		await video.play();

		// Screenshot Canvas
		const canvas = document.createElement("canvas");
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;

		const ctx = canvas.getContext("2d");
		ctx.drawImage(video, 0, 0);

		cropImage.value = canvas.toDataURL("image/jpeg");

		// Kamera stoppen
		stream.getTracks().forEach(track => track.stop());

		popupFoto.value = false;
		popupCrop.value = true;
	} catch (err) {
		console.warn("Kamera nicht möglich:", err);
	}
};

// ------------------------------------------------------------
// 3) CROPPING – Bild zuschneiden
// ------------------------------------------------------------
const cropCanvas = ref(null);

const cropImageNow = async () => {
	const canvas = cropCanvas.value;
	const ctx = canvas.getContext("2d");

	const image = new Image();
	image.onload = async () => {

		const size = Math.min(image.width, image.height);
		canvas.width = size;
		canvas.height = size;

		ctx.drawImage(
			image,
			(image.width - size) / 2,
			(image.height - size) / 2,
			size,
			size,
			0,
			0,
			size,
			size
		);

		// → Base64 aus Canvas generieren
		const base64 = canvas.toDataURL("image/jpeg", 0.9);

		// → square + avatar erzeugen
		const result = await buildAvatarFromBase64(base64);

		user.userPic = result.square;
		avatarPic.value = result.avatar;

		// speichern
		localStorage.setItem("userPic", user.userPic);

		popupCrop.value = false;
	};

	image.src = cropImage.value;
};

// ------------------------------------------------------------
// 4) BILD LÖSCHEN
// ------------------------------------------------------------
const removeFoto = () => {
	user.userPic = "";
	avatarPic.value = "";
	cropImage.value = null;
	localStorage.removeItem("userPic");
	popupFoto.value = false;
};

// ------------------------------------------------------------
// 5) BEIM START: Bild aus LocalStorage laden
// ------------------------------------------------------------
onMounted(async () => {
	const savedPic  = localStorage.getItem("userPic");
	if (savedPic) return;

	// quadratisches Bild + Avatar neu generieren
	const { square, avatar } = await buildAvatarFromBase64(savedPic);

	user.userPic = square;
	avatarPic.value = avatar;
});

// ------------------------------------------------------------
// 	BEIM START: Passwort aus LocalStorage laden
// ------------------------------------------------------------
	const savedPwd = localStorage.getItem("userPassword");
	if (savedPwd) {
		user.userPassword = savedPwd;
	}

// ------------------------------------------------------------
// REST: PW, Optionen, Popups
// ------------------------------------------------------------
const fotoMenu = () => {
	popupFoto.value = true;
};

const editPassword = () => {
	popupPassword.value = true;
};

const savePassword = () => {
	if (pwd.pwd1 !== pwd.pwd2) {
		pwd.error = "Passwörter stimmen nicht überein!";
		return;
	}
		// SPEICHERN
	user.userPassword = pwd.pwd1;
	localStorage.setItem("userPassword", user.userPassword);

		// Username (optional)
	if (user.userFullName) {
		localStorage.setItem("rememberUser", user.userFullName);
	}

	// Reset
	pwd.pwd1 = "";
	pwd.pwd2 = "";
	pwd.error = "";

	popupPassword.value = false;
};
	
const closePopup = () => {
	popupFoto.value = false;
	popupCrop.value = false;
	popupOptions.value = false;
	popupPassword.value = false;
};

// ---------------------------------------------
// OPTIONS-POPUP
// ---------------------------------------------
const router = useRouter();
const popupOptions = ref(false);
const startSeite = ref("");

// Views aus dem Router holen
const pages = router.getRoutes()
	.filter(r => r.meta?.showInProfile)
	.map(r => ({
		name: r.name,
		title: r.meta?.title || r.name
	}));

const editOptions = () => popupOptions.value = true;
const saveOptions = () => {
	console.log("Startseite gespeichert:", startSeite.value);
	popupOptions.value = false;
};
const closeOptionsPopup = () => popupOptions.value = false;
</script>


<style scoped>
.sheet-backdrop {
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.4);
	display: flex;
	justify-content: center;
	align-items: flex-end;
	z-index: 2000;
}

.sheet {
	width: 100%;
	max-width: 480px;
	margin: 0 auto 16px auto;
	background: #f2f2f7;
	border-radius: 16px;
	box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
	padding: 8px 0 4px 0;
}

.sheet-title {
	text-align: center;
	font-weight: 600;
	font-size: 15px;
	color: #555;
	padding: 8px 16px 4px 16px;
}

.sheet-list {
	list-style: none;
	margin: 0;
	padding: 0;
}

.sheet-btn {
	width: 100%;
	padding: 14px 16px;
	background: #fff;
	border: none;
	border-bottom: 1px solid #e5e5ea;
	font-size: 16px;
	text-align: left;
	cursor: pointer;
}

.sheet-btn:last-child {
	border-bottom: none;
}

.sheet-btn:active {
	background: #e5e5ea;
}

.sheet-btn-danger {
	color: #ff3b30;
}

.sheet-cancel {
	margin: 8px 8px 4px 8px;
	width: calc(100% - 16px);
	padding: 14px 16px;
	border-radius: 12px;
	border: none;
	background: #fff;
	font-size: 16px;
	font-weight: 600;
	cursor: pointer;
}

.sheet-cancel:active {
	background: #e5e5ea;
}

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
	width: 150px;
	height: 150px;
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
