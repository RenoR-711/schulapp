<template>
	<div class="dialog-backdrop" @click.self="$emit('cancel')">

		<div
			class="dialog-box"
			:style="{ top: anchorY + 20 + 'px' }"
		>

			<!-- 🔥 ABMELDEN -->
			<div v-if="mode === 'abmelden'" class="content-wrap">

				<div class="title danger">Vom Essen abmelden?</div>vc

				<p class="subtitle">Möchten Sie für diesen Tag keine Mahlzeit einnehmen?</p>

				<button class="btn btn-danger mt-4" @click="$emit('ok')">
					Abmelden
				</button>

				<button class="btn btn-ghost mt-2" @click="$emit('cancel')">
					Abbrechen
				</button>
			</div>

			<!-- 🔥 MENÜ -->
			<div v-else class="content-wrap">

				<!-- Bild -->
				<div class="img-wrap">
					<img :src="menueImage" class="dish-image" alt="" />
				</div>

				<!-- Gericht -->
				<div class="title">
					<span v-html="menue?.menue_text"></span>
				</div>

				<!-- Allergien -->
				<div v-if="menue?.allergie_konflikte?.length" class="alert alert-warning">
					⚠ Allergiehinweise beachten
				</div>

				<!-- Preis -->
				<div v-if="menue?.preis > 0" class="price">
					{{ formatPreis(menue.preis) }}
				</div>

				<!-- Sekretariats-Nachricht -->
				<p v-if="nachrichtSekretariat" class="note">
					{{ nachrichtSekretariat }}
				</p>

				<button class="btn btn-primary mt-3" @click="$emit('ok')">
					Menü wählen
				</button>

				<button class="btn btn-ghost mt-2" @click="$emit('cancel')">
					Abbrechen
				</button>
			</div>

		</div>
	</div>
</template>

<script setup>
const props = defineProps({
	menue: { type: Object, default: () => ({}) },
	menueImage: String,
	anchorY: Number,
	nachrichtSekretariat: String,
	mode: { type: String, default: "menue" }
});

function formatPreis(v) {
	return Number(v).toLocaleString("de-DE", {
		style: "currency",
		currency: "EUR"
	});
}
</script>

<style scoped>
/* identisch mit deiner Version – NICHT verändert */

.dialog-backdrop {
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.25);
	backdrop-filter: blur(6px);
	display: flex;
	justify-content: center;
	z-index: 9999;
	animation: fadeIn 0.2s ease-out;
}

.dialog-box {
	position: absolute;
	width: 92%;
	max-width: 450px;
	border-radius: 18px;
	overflow: hidden;
	animation: slideUp 0.25s ease-out;
}

.elegant-card {
	background: rgba(255, 255, 255, 0.85);
	backdrop-filter: blur(14px);
	box-shadow:
		0 8px 18px rgba(0, 0, 0, 0.18),
		0 3px 8px rgba(0, 0, 0, 0.08);
	border: 1px solid rgba(255, 255, 255, 0.6);
}

.content-wrap {
	padding: 20px 20px 26px;
	text-align: center;
}

.title {
	font-size: 1.3rem;
	font-weight: 700;
	color: #1d1d1f;
	margin-bottom: 6px;
}
.title.danger { color: #c62828; }

.subtitle {
	font-size: 0.9rem;
	color: #555;
}

.price {
	font-size: 1.1rem;
	color: #111;
	font-weight: 600;
	margin-bottom: 12px;
}

.note {
	font-size: 0.8rem;
	color: #666;
	margin-top: 6px;
}

.img-wrap { display: flex; justify-content: center; margin-bottom: 12px; }
.dish-image {
	width: 120px;
	height: auto;
	border-radius: 14px;
	object-fit: cover;
	box-shadow:
		0 5px 12px rgba(0, 0, 0, 0.15),
		0 0 0 4px rgba(255, 255, 255, 0.3);
}

.alert {
	padding: 6px 12px;
	border-radius: 10px;
	font-size: 0.8rem;
	font-weight: 600;
	margin: 10px auto;
	max-width: 260px;
}
.alert-warning {
	background: #fff4d6;
	color: #a76500;
	border: 1px solid #ffe3a3;
}

.btn {
	width: 100%;
	padding: 12px 0;
	border-radius: 12px;
	font-size: 1rem;
	transition: all 0.15s ease-out;
}
.btn-primary {
	background: linear-gradient(135deg, #3b82f6, #1d4ed8);
	color: white;
	font-weight: 600;
}
.btn-danger {
	background: linear-gradient(135deg, #ef5350, #d32f2f);
	color: white;
	font-weight: 600;
}
.btn-ghost {
	background: #f2f2f7;
	color: #444;
}

@keyframes fadeIn {
	from { opacity: 0; }
	to { opacity: 1; }
}
@keyframes slideUp {
	from { opacity: 0; transform: translateY(20px) scale(0.98); }
	to { opacity: 1; transform: translateY(0) scale(1); }
}
</style>
