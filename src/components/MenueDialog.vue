<template>
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" @click.self="emitCancel">
        <div class="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h2 class="mb-3 text-base font-semibold text-slate-900">
                Menüwahl bestätigen
            </h2>

            <!-- Menü Info -->
            <div class="mb-3 flex items-start gap-3">
                <img :src="localMenueImage" class="h-12 w-12 flex-shrink-0 rounded-md object-cover" alt="Menü" />
                <div class="prose prose-sm max-w-none">
                    <span v-html="localMenue.menue_text"></span>
                </div>
            </div>

            <!-- Allergien -->
            <div v-if="localMenue.allergie_konflikte && localMenue.allergie_konflikte.length > 0"
                class="mb-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
                <p class="font-semibold">Achtung: Allergie-Konflikte</p>
                <p class="mt-1">
                    <span v-for="(allergie, idx) in localMenue.allergie_konflikte" :key="idx">
                        {{ allergie.name }} ({{ allergie.kurzname }})<span
                            v-if="idx < localMenue.allergie_konflikte.length - 1">, </span>
                    </span>
                </p>
            </div>

            <!-- Ersatzkomponenten -->
            <div v-if="localMenue.ersatzkomponenten && localMenue.ersatzkomponenten.length > 0" class="mb-3 text-xs">
                <p class="mb-1 font-medium text-slate-800">Ersatzkomponenten:</p>
                <label v-for="(ersatz, idx) in localMenue.ersatzkomponenten" :key="ersatz.speise_id"
                    class="mb-1 flex items-center gap-2">
                    <input class="h-4 w-4 accent-sky-600" type="checkbox"
                        v-model="localMenue.ersatzkomponenten[idx].ausgewaehlt" />
                    <span>{{ ersatz.bezeichnung }}</span>
                </label>
            </div>

            <!-- Nachricht -->
            <textarea v-if="nachrichtSekretariat === 1" v-model="localNachricht"
                class="mb-3 h-20 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-200"
                placeholder="Wichtige Nachricht an das Sekretariat?"></textarea>

            <!-- Ergebnis -->
            <p v-if="postResult" class="mb-3 text-xs font-medium text-sky-700">
                {{ postResult }}
            </p>

            <!-- Buttons -->
            <div class="flex justify-end gap-2">
                <button type="button"
                    class="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    @click="emitCancel">
                    Abbrechen
                </button>
                <button type="button"
                    class="rounded-xl bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-sky-700"
                    @click="emitOk">
                    OK
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';

/* Props */
const props = defineProps({
    menue: { type: Object, required: true },
    menueImage: { type: String, required: true },
    nachrichtSekretariat: { type: Number, default: 0 },
    menueNachricht: { type: String, default: '' },
    postResult: { type: String, default: '' }
});

const emits = defineEmits(['ok', 'cancel']);

/* Lokaler Zustand statt direktes Mutieren von Props */
const localMenue = ref({});
const localMenueImage = ref('');
const localNachricht = ref('');

/* Props → lokale States übernehmen */
watch(
    () => props.menue,
    (newVal) => {
        localMenue.value = JSON.parse(JSON.stringify(newVal || {}));
    },
    { immediate: true }
);

watch(
    () => props.menueImage,
    (newVal) => (localMenueImage.value = newVal),
    { immediate: true }
);

watch(
    () => props.menueNachricht,
    (newVal) => (localNachricht.value = newVal),
    { immediate: true }
);

/* Emit zurück geben statt Props mutieren */
const emitOk = () => {
    emits('ok', {
        menue: localMenue.value,
        menueNachricht: localNachricht.value,
        ersatzkomponenten: localMenue.value.ersatzkomponenten || []
    });
};

const emitCancel = () => emits('cancel');
</script>
