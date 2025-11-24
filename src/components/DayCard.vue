<template>    
<div class="mb-0 rounded-2xl bg-white shadow-sm" :id="`daycard-${tagIdx}`">

    <!-- HEADER -->
    <button
        type="button"
        @click="$emit('toggle', tagIdx)"
        :class="[
            'flex w-full items-start justify-between gap-5 px-4 py-2 text-left transition-all duration-200 border border-[#375c86]',
            open
                ? 'bg-gradient-to-b from-[#6d98bd] to-white text-slate-900'
                : 'bg-gradient-to-t from-[#476b9b] to-[#6d98bd] text-white',
            tagIdx === 0 ? 'rounded-t-2xl' : '',
            tagIdx === 6 ? 'rounded-b-2xl' : ''
        ]"
    >
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

        <!-- ICONS -->
        <div class="flex items-center gap-2">
            <template v-if="hasMenues">
                <template v-if="isAboDay">
                    <img v-if="isAngemeldet" :src="icons.apfelAbo" class="h-5 w-5" alt="Abo aktiv">
                    <img v-else :src="icons.kreuzAbo" class="h-5 w-5" alt="Abo nicht aktiv">
                </template>

                <template v-else>
                    <img v-if="!isSelected" :src="icons.spoonGray" class="h-5 w-5" alt="Menü nicht ausgewählt" />
                    <img v-else :src="icons.spoonColor" class="h-5 w-5" alt="Menü ausgewählt" />
                </template>
            </template>

            <img v-if="hasCourses" :src="icons.kurse" class="h-5 w-5" alt="Kurse" />
            <img v-if="hasEvents" :src="icons.info" class="h-5 w-5" alt="Info" />
            <img v-if="tag.ferientag == 1" :src="icons.ferien" class="h-5 w-5" alt="Ferientag" />
        </div>
    </button>

    <!-- CONTENT -->
    <transition name="expand">
        <div v-if="open" class="px-4 py-3 space-y-4 bg-slate-50/60 border-t border-slate-100">

            <!-- LEER -->
            <div v-if="isEmptyDay" class="px-2 py-4 text-center text-xs text-slate-400">
                Kein Eintrag für diesen Tag.
            </div>

            <template v-else>

                <!-- DETAIL-KATEGORIEN -->
                <article
                    v-for="(detail, detailIdx) in details?.detail_kostenarten || []"
                    :key="detailIdx"
                    class="rounded-xl bg-white p-3 shadow-sm"
                >
                    <h2 class="mb-2 text-sm font-semibold text-slate-800">
                        {{ getDetailTitle(detail.detail_kostenartart_id) }}
                    </h2>

                    <ul class="space-y-2">
                        <li
                            v-for="(angebot, angebotIdx) in detail.kostenarten"
                            :key="angebotIdx"
                            class="rounded-lg bg-white p-2 shadow-sm"
                        >

                            <!-- MENÜLISTE -->
                            <div v-if="angebot.menues && angebot.menues.length" class="space-y-2">

                                <label
                                    v-for="(menue, mIdx) in angebot.menues"
                                    :key="mIdx"
                                    class="flex items-start gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer"
                                >
                                    <input
                                        class="mt-1 h-4 w-4 shrink-0 accent-sky-600"
                                        type="radio"
                                        :name="`menue-${tagIdx}-${angebotIdx}`"
                                        :value="mIdx"
                                        :checked="menue.ausgewaehlt == '1'"
                                        :disabled="angebot.aenderbar == '0' || menue.menge_verfuegbar <= 0 || menue.aenderbar == '0'"
                                        @click="emitMenueSelect(detailIdx, angebotIdx, mIdx)"
                                    />

                                    <div class="flex-1 space-y-1">
                                        <div class="flex items-start justify-between gap-2">
                                            <div class="prose prose-sm max-w-none">
                                                <span v-html="menue.menue_text"></span>
                                                <span
                                                    v-if="menue.allergie_konflikte?.length"
                                                    class="ml-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-amber-100 px-1 text-xs font-semibold text-amber-700"
                                                >
                                                    !
                                                </span>
                                            </div>

                                            <span
                                                v-if="menue.preis > 0"
                                                class="text-xs font-semibold text-slate-700"
                                            >
                                                {{ formatPreis(menue.preis) }}
                                            </span>
                                        </div>

                                        <div class="flex flex-wrap gap-2 text-xs">
                                            <span
                                                v-if="menue.menge_verfuegbar <= 0"
                                                class="rounded-full bg-rose-100 px-2 py-0.5 font-medium text-rose-700"
                                            >
                                                Ausverkauft
                                            </span>
                                        </div>
                                    </div>
                                </label>

                                <!-- ABMELDEN -->
                                <label
                                    v-if="angebot.pflicht == '0'"
                                    class="flex items-center gap-2 rounded-lg px-3 py-2 text-xs hover:bg-slate-50 cursor-pointer"
                                >
                                    <input
                                        class="h-4 w-4 accent-sky-600"
                                        type="radio"
                                        :name="`menue-${tagIdx}-${angebotIdx}`"
                                        value="-1"
                                        :checked="isAbgemeldet"
                                        :disabled="angebot.aenderbar == '0'"
                                        @click="emitMenueSelect(detailIdx, angebotIdx, -1)"
                                    />
                                    <span class="text-slate-700">vom Essen abmelden</span>
                                </label>
                            </div>

                            <!-- KURSE -->
                            <div
                                v-for="termin in angebot.termine"
                                :key="termin.kurs_id"
                                class="mt-2 rounded-lg bg-sky-50 px-3 py-2 text-sm hover:bg-sky-100 cursor-pointer"
                                @click="$emit('kurs-details', termin.kurs_id)"
                            >
                                <h3 class="text-sm font-semibold text-sky-900">{{ termin.kurs_name }}</h3>

                                <div class="mt-1 flex flex-wrap gap-4 text-xs text-slate-700">
                                    <div>Treffpunkt: {{ termin.treffpunkt }}</div>
                                    <div>{{ termin.start }} – {{ termin.ende }}</div>
                                </div>
                            </div>
                        </li>
                    </ul>

                    <!-- ABO -->
                    <div
                        v-if="isAbotageEnabled(detail)"
                        class="mt-3 rounded-lg bg-sky-50 px-3 py-2 text-xs border border-sky-100"
                    >
                        <label class="inline-flex items-center gap-2">
                            <input
                                class="h-4 w-4 accent-sky-600"
                                type="checkbox"
                                :checked="abotage[tagIdx]"
                                @change="$emit('abo-change', { tagIdx, checked: $event.target.checked })"
                            />
                            <span class="text-sky-900">{{ formatWeekday(tag.datum) }} als Abo wählen</span>
                        </label>
                    </div>
                </article>

                <!-- EVENTS -->
                <section v-if="hasEvents">
                    <h2 class="mb-1 text-sm font-semibold text-slate-800">Termine</h2>
                    <ul class="space-y-2 text-sm">
                        <li
                            v-for="event in tag.events"
                            :key="event.beschreibung"
                            class="rounded-lg bg-slate-50 p-2"
                        >
                            <p class="font-medium text-slate-900">{{ event.beschreibung }}</p>
                            <p
                                v-if="event.showTime && event.datum_von"
                                class="text-xs text-slate-500 mt-0.5"
                            >
                                {{ event.datum_von.substring(11, 16) }} Uhr
                            </p>
                        </li>
                    </ul>
                </section>

                <!-- VERTRETUNG -->
                <section v-if="tag.vertretungsplan?.length">
                    <h2 class="mb-1 text-sm font-semibold text-slate-800">Vertretungen</h2>
                    <ul class="space-y-2 text-sm">
                        <li
                            v-for="vp in tag.vertretungsplan"
                            :key="vp.bemerkung"
                            class="rounded-lg bg-amber-50 p-2 hover:bg-amber-100 cursor-pointer"
                            @click="$emit('vertretung', vp)"
                        >
                            <h3 class="text-xs font-semibold text-amber-900">
                                {{ vp.datum.substring(11, 16) }} ({{ vp.vertretungsart }})
                            </h3>
                            <p class="text-xs text-amber-900">{{ vp.bemerkung }}</p>
                        </li>
                    </ul>
                </section>

            </template>
        </div>
    </transition>
</div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
    tag: Object,
    tagIdx: Number,
    details: Object,
    icons: Object,
    ESSEN_ID: String,
    abotage: Array,
    abotageOld: Array,
    open: Boolean
});

const emit = defineEmits(["toggle", "select-menue", "abo-change", "kurs-details", "vertretung"]);

const formatDateLong = (d) => {
    const dt = new Date(d);
    return dt.toLocaleDateString("de-DE", {
        weekday: "long",
        month: "short",
        day: "numeric"
    });
};

const formatWeekday = (d) => new Date(d).toLocaleDateString("de-DE", { weekday: "long" });

function formatPreis(value) {
    return Number(value).toLocaleString("de-DE", {
        style: "currency",
        currency: "EUR"
    });
}

/* MENÜ STATES */
const hasMenues = computed(() =>
    (props.tag.angebote || []).some(a => a.detail_kostenart_id === props.ESSEN_ID)
);

const hasCourses = computed(() =>
    (props.tag.angebote || []).some(a => a.detail_kostenart_id !== props.ESSEN_ID)
);

const isSelected = computed(() =>
    (props.tag.angebote || []).some(a =>
        a.menues?.some(m => m.ausgewaehlt == "1")
    )
);

const isAbgemeldet = computed(() => {
    // Finde nur die ESSEN-Kostenart
    const essenAngebot = (props.tag.angebote || []).find(a =>
        a.detail_kostenart_id === props.ESSEN_ID
    );

    if (!essenAngebot || !essenAngebot.menues?.length) return false;

    // Abgemeldet nur wenn KEIN Menü => ausgewaehlt = "1"
    const hatAuswahl = essenAngebot.menues.some(m => m.ausgewaehlt == "1");

    return !hatAuswahl;
});

const hasEvents = computed(() => props.tag.events?.length > 0);

const isAngemeldet = computed(() =>
    (props.tag.angebote || []).some(
        a => a.detail_kostenart_id === props.ESSEN_ID && a.angemeldet === 1
    )
);

const isAboDay = computed(() => props.abotageOld[props.tagIdx]);

const isEmptyDay = computed(() =>
    (props.tag.angebote?.length || 0) + (props.tag.events?.length || 0) === 0
);

const isAbotageEnabled = (detail) =>
    detail.kostenarten && detail.kostenarten.length > 0;

const getDetailTitle = () => "Details";

const emitMenueSelect = (detailIdx, angebotIdx, index) => {
    emit("select-menue", {
        tagIdx: props.tagIdx,
        detailIdx,
        angebotIdx,
        index,
        date: props.tag.datum
    });
};
</script>


<style scoped>

/* ---------------------------------------- */
/* CARD WRAPPER */
/* ---------------------------------------- */
#daycard {
	background: rgba(255, 255, 255, 0.85);
	backdrop-filter: blur(6px);
	border-radius: 18px;
	overflow: hidden;
	box-shadow:
		0 6px 14px rgba(0, 0, 0, 0.12),
		0 2px 6px rgba(0, 0, 0, 0.06);
	border: 1px solid rgba(255, 255, 255, 0.6);
}

/* ---------------------------------------- */
/* HEADER BUTTON */
/* ---------------------------------------- */
button {
	transition: background 0.25s ease, transform 0.15s ease;
}

button:active {
	transform: scale(0.99);
}

/* ---------------------------------------- */
/* ICONS */
/* ---------------------------------------- */
.h-5.w-5 {
	filter: drop-shadow(0 1px 1px rgba(0,0,0,0.15));
}

/* ---------------------------------------- */
/* EXPANDED AREA */
/* ---------------------------------------- */
.bg-slate-50\/60 {
	background: rgba(248, 250, 252, 0.7);
	backdrop-filter: blur(3px);
}

/* ---------------------------------------- */
/* INNER CARDS */
/* ---------------------------------------- */
article,
li {
	border-radius: 16px !important;
	box-shadow:
		0 4px 10px rgba(0, 0, 0, 0.06),
		0 1px 4px rgba(0, 0, 0, 0.04);
	background: rgba(255, 255, 255, 0.9) !important;
}

/* ---------------------------------------- */
/* HOVER FÜR OPTIONEN */
/* ---------------------------------------- */
.hover\:bg-slate-50:hover {
	background: rgba(245, 247, 250, 0.7) !important;
}

/* ---------------------------------------- */
/* RADIO BUTTON IMPROVED */
/* ---------------------------------------- */
input[type="radio"] {
	transform: scale(1.15);
	cursor: pointer;
}

/* ---------------------------------------- */
/* EXPAND TRANSITION */
/* ---------------------------------------- */
.expand-enter-active,
.expand-leave-active {
	transition: all 0.25s ease;
}

.expand-enter-from,
.expand-leave-to {
	opacity: 0;
	transform: translateY(-6px);
}

/* ---------------------------------------- */
/* EVENTS & VERTRETUNGEN */
/* ---------------------------------------- */
.bg-amber-50 {
	background: rgba(255, 243, 209, 0.6) !important;
	backdrop-filter: blur(4px);
	border: 1px solid rgba(255, 220, 140, 0.5);
}

/* ---------------------------------------- */
/* ABO-AREA */
/* ---------------------------------------- */
.bg-sky-50 {
	background: rgba(235, 245, 255, 0.6) !important;
	border: 1px solid rgba(180, 210, 255, 0.5);
	backdrop-filter: blur(4px);
}

/* ---------------------------------------- */
/* TEXT STYLING */
/* ---------------------------------------- */
.text-slate-800,
.text-slate-700,
.text-slate-900 {
	-webkit-font-smoothing: antialiased;
}

</style>
