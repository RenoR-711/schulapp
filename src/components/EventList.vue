<template>
    <section>
        <h2 class="mb-1 text-sm font-semibold text-slate-800">Termine</h2>

        <ul class="space-y-2 text-sm">
            <li v-for="(event, idx) in events" :key="idx" class="rounded-lg bg-slate-50 p-2 flex gap-3">
                <img v-if="event.bild_id" class="h-10 w-10 flex-shrink-0 rounded-md object-cover"
                    :src="imgUrl(event.bild_id)" alt="Termin" />

                <div>
                    <p class="font-medium text-slate-900">
                        {{ event.beschreibung }}
                    </p>
                    <p v-if="event.showTime" class="mt-0.5 text-xs text-slate-500">
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

const imgUrl = (id) => `${props.appUrl}/img/${id}.jpg?sk=${props.sessionKey}`;
</script>
