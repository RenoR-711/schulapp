<template>
	<!-- BACKDROP -->
	<div class="dialog-backdrop" @click.self="emitCancel">

		<!-- DIALOGBOX -->
		<div
			ref="dialogBox"
			class="dialog-box elegant-card"
		>
			<div class="content-wrap">

				<h2 class="title">
					Bitte bestätigen
				</h2>

				<p class="subtitle mt-1 mb-4">
					{{ text }}
				</p>

				<!-- BUTTONS -->
				<div class="flex flex-col gap-2 mt-2">

					<button
						type="button"
						class="btn btn-primary"
						@click="emitOk"
					>
						OK
					</button>

					<button
						type="button"
						class="btn btn-ghost"
						@click="emitCancel"
					>
						Abbrechen
					</button>

				</div>

			</div>
		</div>

	</div>
</template>

<script setup>
const props = defineProps({
	text: { type: String, required: true },
});

const emits = defineEmits(["ok", "cancel"]);

const emitOk = () => emits("ok");
const emitCancel = () => emits("cancel");
</script>

<style scoped>

/* ------------------------------ */
/* BACKDROP */
/* ------------------------------ */
.dialog-backdrop {
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.25);
	backdrop-filter: blur(6px);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 9999;
	animation: fadeIn 0.2s ease-out;
}

/* ------------------------------ */
/* DIALOGBOX */
/* ------------------------------ */
.dialog-box {
	position: relative;
	width: 92%;
	max-width: 400px;
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
	padding: 22px 24px 28px;
	text-align: center;
}

/* ------------------------------ */
/* TYPO */
/* ------------------------------ */
.title {
	font-size: 1.25rem;
	font-weight: 700;
	color: #1d1d1f;
	margin-bottom: 4px;
}

.subtitle {
	font-size: 0.95rem;
	color: #444;
}

/* ------------------------------ */
/* BUTTONS */
/* ------------------------------ */
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
.btn-primary:active {
	transform: scale(0.97);
}

.btn-ghost {
	background: #f2f2f7;
	color: #444;
}
.btn-ghost:active {
	background: #e5e5ea;
	transform: scale(0.97);
}

/* ------------------------------ */
/* ANIMATIONS */
/* ------------------------------ */
@keyframes fadeIn {
	from { opacity: 0; }
	to { opacity: 1; }
}

@keyframes slideUp {
	from { opacity: 0; transform: translateY(20px) scale(0.98); }
	to { opacity: 1; transform: translateY(0) scale(1); }
}
</style>
