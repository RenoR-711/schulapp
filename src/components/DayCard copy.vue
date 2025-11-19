<template>
    <div class="mb-4 rounded-2xl bg-white shadow-sm">
        <!-- Header -->
        <button type="button"
            class="flex w-full items-start justify-between gap-3 rounded-t-2xl border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50"
            @click="$emit('toggle', tagIdx)">
            <div>
                <div class="text-sm font-semibold leading-tight">
                    {{ formatDateLong(tag.datum) }}
                </div>
                <div v-if="tag.feiertag_name" class="text-xs text-amber-600">
                    {{ tag.feiertag_name }}
                </div>
                <div v-if="tag.ferientag == 1" class="mt-0.5 text-xs font-medium text-sky-700">
                    Ferientag
                </div>
            </div>

            <!-- Icons rechts -->
            <div class="flex items-center gap-2">
                <!-- MENÜ / Abo Icons -->
                <template v-if="hasMenues">

                    <!-- Abo-Tage (wie bisher) -->
                    <template v-if="isAboDay">
                        <img v-if="isAngemeldet" :src="icons.apfelAbo" class="h-5 w-5" alt="Abo Apfel" />
                        <img v-else :src="icons.kreuzAbo" class="h-5 w-5" alt="Abo abmelden" />
                    </template>

                    <!-- Nicht-Abo-Tage -->
                    <template v-else>
                        <!-- Default: spoonGray -->
                        <img v-if="!isSelected" :src="icons.spoonGray" class="h-5 w-5" alt="nicht angemeldet" />

                        <!-- Erst nach Auswahl: spoonColor -->
                        <img v-else :src="icons.spoonColor" class="h-5 w-5" alt="angemeldet" />
                    </template>

                </template>

                <img v-if="hasCourses" :src="icons.kurse" class="h-5 w-5" alt="Kurse" />
                <img v-if="hasEvents" :src="icons.info" class="h-5 w-5" alt="Informationen" />
                <img v-if="tag.ferientag == 1" :src="icons.ferien" class="h-5 w-5" alt="Ferientag" />
            </div>
        </button>

        <!-- Content -->
        <section v-if="!isEmpty" class="space-y-4 px-4 py-3">
            <slot name="details" />
            <slot name="events" />
            <slot name="vertretung" />
        </section>

        <div v-else class="px-4 py-4 text-center text-xs text-slate-400">
            Kein Eintrag für diesen Tag.
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    tag: { type: Object, required: true },
    tagIdx: { type: Number, required: true },
    icons: { type: Object, required: true },
    abotageOld: { type: Array, required: true },
    ESSEN_ID: { type: String, required: true }
});

const emits = defineEmits(['select-date']);

const onSelectDate = () => emits('select-date', props.tag.datum);

const formatDateLong = (d) => {
    const dt = new Date(d);
    return dt.toLocaleDateString('de-DE', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
    });
};

const hasMenues = computed(() =>
    props.tag.angebote.some(a => a.detail_kostenart_id === props.ESSEN_ID)
);

const hasCourses = computed(() =>
    props.tag.angebote.some(a => a.detail_kostenart_id !== props.ESSEN_ID)
);

const hasEvents = computed(() => props.tag.events && props.tag.events.length > 0);

const isAngemeldet = computed(() => {
    return props.tag.angebote.some(
        a => a.detail_kostenart_id === props.ESSEN_ID && a.angemeldet === 1
    );
});

const isAboDay = computed(() => props.abotageOld[props.tagIdx]);

const isEmpty = computed(() => props.tag.angebote.length + props.tag.events.length === 0);
</script>
