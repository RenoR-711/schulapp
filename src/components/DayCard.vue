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

        <!-- Expandierter Bereich -->
        <transition name="expand">
            <div v-if="open" class="px-4 py-3 space-y-4 bg-slate-50/60 border-t border-slate-100">
                <!-- Wenn Tag leer ist -->
                <div v-if="isEmptyDay" class="px-2 py-4 text-center text-xs text-slate-400">
                    Kein Eintrag für diesen Tag.
                </div>

                <!-- Inhalte nur wenn nicht leer -->
                <template v-else>
                    <!-- Detail-Kategorien (Essen / Angebote / Kurse) -->
                    <article v-for="(detail, detailIdx) in (details?.detail_kostenarten || [])" :key="detailIdx"
                        class="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                        <h2 class="mb-2 text-sm font-semibold text-slate-800">
                            {{ getDetailTitle(detail.detail_kostenartart_id) }}
                        </h2>

                        <!-- Menü / Angebote -->
                        <ul class="space-y-2">
                            <li v-for="(angebot, angebotIdx) in detail.kostenarten" :key="angebotIdx"
                                class="rounded-lg bg-white p-2 shadow-sm">
                                <!-- MENÜLISTE -->
                                <div v-if="angebot.menues && angebot.menues.length > 0" class="space-y-2">
                                    <label v-for="(menue, mIdx) in angebot.menues" :key="mIdx"
                                        class="flex cursor-pointer items-start gap-2 rounded-lg border border-slate-100 px-3 py-2 text-sm hover:bg-slate-50">
                                        <input class="mt-1 h-4 w-4 shrink-0 accent-sky-600" type="radio"
                                            :name="`menue-${tagIdx}-${angebotIdx}`" :value="mIdx"
                                            :checked="menue.ausgewaehlt == '1'" :disabled="angebot.aenderbar == '0' ||
                                                menue.menge_verfuegbar <= 0 ||
                                                menue.aenderbar == '0'
                                                " @click="emitMenueSelect(detailIdx, angebotIdx, mIdx)" />

                                        <div class="flex-1 space-y-1">
                                            <div class="flex items-start justify-between gap-2">
                                                <div class="prose prose-sm max-w-none">
                                                    <span v-html="menue.menue_text"></span>
                                                    <span
                                                        v-if="menue.allergie_konflikte && menue.allergie_konflikte.length > 0"
                                                        class="ml-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-amber-100 px-1 text-xs font-semibold text-amber-700">
                                                        !
                                                    </span>
                                                </div>
                                                <span v-if="menue.preis > 0"
                                                    class="text-xs font-semibold text-slate-700">
                                                    {{ menue.preis }} €
                                                </span>
                                            </div>

                                            <div class="flex flex-wrap gap-2 text-xs">
                                                <span v-if="menue.menge_verfuegbar <= 0"
                                                    class="rounded-full bg-rose-100 px-2 py-0.5 font-medium text-rose-700">
                                                    Ausverkauft
                                                </span>
                                            </div>
                                        </div>
                                    </label>

                                    <!-- vom Essen abmelden -->
                                    <label v-if="angebot.pflicht == '0'"
                                        class="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-200 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50">
                                        <input class="h-4 w-4 accent-sky-600" type="radio"
                                            :name="`menue-${tagIdx}-${angebotIdx}`" value="-1" :checked="!isAngemeldet"
                                            :disabled="angebot.aenderbar == '0'"
                                            @click="emitMenueSelect(detailIdx, angebotIdx, angebot.menues.length)" />
                                        <span>vom Essen abmelden</span>
                                    </label>
                                </div>

                                <!-- KURSE -->
                                <div v-for="termin in angebot.termine" :key="termin.kurs_id"
                                    class="mt-2 cursor-pointer rounded-lg bg-sky-50 px-3 py-2 text-sm hover:bg-sky-100"
                                    @click="$emit('kurs-details', termin.kurs_id)">
                                    <h3 class="text-sm font-semibold text-sky-900">
                                        {{ termin.kurs_name }}
                                    </h3>
                                    <div class="mt-1 flex flex-wrap gap-4 text-xs text-slate-700">
                                        <div>Treffpunkt: {{ termin.treffpunkt }}</div>
                                        <div>{{ termin.start }} – {{ termin.ende }}</div>
                                    </div>
                                </div>
                            </li>
                        </ul>

                        <!-- Abo-Auswahl -->
                        <div v-if="isAbotageEnabled(detail)"
                            class="mt-3 rounded-lg border border-sky-100 bg-sky-50 px-3 py-2 text-xs">
                            <label class="inline-flex items-center gap-2">
                                <input class="h-4 w-4 accent-sky-600" type="checkbox" :checked="abotage[tagIdx]"
                                    @change="$emit('abo-change', tagIdx)" />
                                <span class="text-sky-900">
                                    {{ formatWeekday(tag.datum) }} als Abo wählen
                                </span>
                            </label>
                        </div>
                    </article>

                    <!-- EVENTS -->
                    <section v-if="hasEvents">
                        <h2 class="mb-1 text-sm font-semibold text-slate-800">Termine</h2>
                        <ul class="space-y-2 text-sm">
                            <li v-for="event in tag.events" :key="event.beschreibung"
                                class="rounded-lg bg-slate-50 p-2">
                                <p class="font-medium text-slate-900">
                                    {{ event.beschreibung }}
                                </p>
                                <p v-if="event.showTime && event.datum_von" class="mt-0.5 text-xs text-slate-500">
                                    {{ event.datum_von.substring(11, 16) }} Uhr
                                </p>
                            </li>
                        </ul>
                    </section>

                    <!-- Vertretungsplan -->
                    <section v-if="tag.vertretungsplan && tag.vertretungsplan.length">
                        <h2 class="mb-1 text-sm font-semibold text-slate-800">
                            Vertretungen
                        </h2>
                        <ul class="space-y-2 text-sm">
                            <li v-for="vp in tag.vertretungsplan" :key="vp.bemerkung"
                                class="cursor-pointer rounded-lg bg-amber-50 p-2 hover:bg-amber-100"
                                @click="$emit('vertretung', vp)">
                                <h3 class="text-xs font-semibold text-amber-900">
                                    {{ vp.datum.substring(11, 16) }} ({{ vp.vertretungsart }})
                                </h3>
                                <p class="text-xs text-amber-900">
                                    {{ vp.bemerkung }}
                                </p>
                            </li>
                        </ul>
                    </section>
                </template>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    tag: { type: Object, required: true },
    tagIdx: { type: Number, required: true },
    details: { type: Object, required: true },
    icons: { type: Object, required: true },
    ESSEN_ID: { type: String, required: true },
    abotage: { type: Array, required: true },
    abotageOld: { type: Array, required: true },
    open: { type: Boolean, default: false }
})

const emit = defineEmits([
    'toggle',
    'select-menue',
    'abo-change',
    'kurs-details',
    'vertretung'
])

const formatDateLong = (d) => {
    const dt = new Date(d)
    return dt.toLocaleDateString('de-DE', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
    })
}

const formatWeekday = (d) => {
    const dt = new Date(d)
    return dt.toLocaleDateString('de-DE', { weekday: 'long' })
}

const hasMenues = computed(() =>
    (props.tag.angebote || []).some(a => a.detail_kostenart_id === props.ESSEN_ID)
)

const hasCourses = computed(() =>
    (props.tag.angebote || []).some(a => a.detail_kostenart_id !== props.ESSEN_ID)
)

const hasEvents = computed(() =>
    props.tag.events && props.tag.events.length > 0
)

const isAngemeldet = computed(() => {
    return (props.tag.angebote || []).some(
        a => a.detail_kostenart_id === props.ESSEN_ID && a.angemeldet === 1
    )
})

const isAboDay = computed(() => props.abotageOld[props.tagIdx])

const isEmptyDay = computed(() => {
    const offers = (props.tag.angebote || []).length
    const events = (props.tag.events || []).length
    return offers + events === 0
})

const isAbotageEnabled = (detail) =>
    detail.kostenarten && detail.kostenarten.length > 0

const getDetailTitle = (detailKostenartArtId) => {
    // Hier kannst du später echte Titel aus details ergänzen
    return props.details?.title || 'Details'
}

const emitMenueSelect = (detailIdx, angebotIdx, menueIdx) => {
    emit('select-menue', {
        tagIdx: props.tagIdx,
        detailIdx,
        angebotIdx,
        menueIdx
    })
}
</script>

<style scoped>
.expand-enter-active,
.expand-leave-active {
    transition: max-height 0.2s ease, opacity 0.2s ease;
}

.expand-enter-from,
.expand-leave-to {
    max-height: 0;
    opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
    max-height: 1000px;
    opacity: 1;
}
</style>