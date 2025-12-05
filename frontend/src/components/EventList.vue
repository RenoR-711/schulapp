<template>
    <section class="mt-6">
        <!-- Überschrift -->
        <h2 class="mb-2 text-base font-semibold text-slate-800">
            Termine
        </h2>

        <!-- Eventliste -->
        <ul class="space-y-3">
            <li
                v-for="(event, idx) in events"
                :key="idx"
                class="flex items-start gap-3 rounded-xl bg-white p-3 shadow-sm border border-slate-200"
            >
                <!-- Bild -->
                <img
                    v-if="event.bild_id"
                    :src="imgUrl(event.bild_id)"
                    alt="Termin"
                    class="h-12 w-12 flex-shrink-0 rounded-md object-cover"
                />

                <!-- Beschreibung -->
                <div class="flex-1">
                    <p class="font-medium text-slate-900 leading-tight">
                        {{ event.beschreibung }}
                    </p>

                    <p
                        v-if="event.showTime"
                        class="mt-1 text-xs text-slate-500"
                    >
                        {{ event.datum_von.substring(11, 16) }} Uhr
                    </p>
                </div>
            </li>
        </ul>
    </section>
</template>

<script setup>
const props = defineProps({
    events: { type: Array, required: true },
    appUrl: { type: String, required: true },
    sessionKey: { type: String, required: true }
});

// Bild-URL wie im Backend
const imgUrl = (id) => `${props.appUrl}/img/${id}.jpg?sk=${props.sessionKey}`;
</script>
