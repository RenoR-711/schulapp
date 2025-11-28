<template>
    <div class="mb-0 rounded-2xl bg-white shadow-sm" :id="`daycard-${tagIdx}`">
        <!-- HEADER -->
        <button type="button" @click="$emit('toggle', tagIdx)" :class="[
            'flex w-full items-start justify-between gap-5 px-4 py-2 text-left transition-all duration-200 border border-[#375c86]',
            open
                ? 'bg-gradient-to-b from-[#6d98bd] to-white text-slate-900'
                : 'bg-gradient-to-t from-[#476b9b] to-[#6d98bd] text-white',
            tagIdx === 0 ? 'rounded-t-2xl' : '',
            tagIdx === 6 ? 'rounded-b-2xl' : ''
        ]">
            <div>
                <div class="text-sm font-semibold leading-tight">{{ formatDateLong(tag.datum) }}</div>
                <div v-if="tag.feiertag_name" class="text-xs text-amber-600">{{ tag.feiertag_name }}</div>
                <div v-if="tag.ferientag == 1" class="mt-0.5 text-xs font-medium text-sky-700">Ferientag</div>
            </div>

            <div class="flex items-center gap-2">
                <template v-if="hasMenues">
                    <template v-if="isAboDay">
                        <img v-if="isAngemeldet" :src="iconApfelAbo" class="h-5 w-5" alt="Abo aktiv" />
                        <img v-else :src="iconKreuzAbo" class="h-5 w-5" alt="Abo nicht aktiv" />
                    </template>
                    <template v-else>
                        <img v-if="!isSelected" :src="iconSpoonGray" class="h-5 w-5" alt="nichts ausgewählt" />
                        <img v-else :src="iconSpoonColor" class="h-5 w-5" alt="menü gewählt" />
                    </template>
                </template>
                <img v-if="hasCourses" :src="iconKurse" class="h-5 w-5" alt="Kurse" />
                <img v-if="hasEvents" :src="iconEvent" class="h-5 w-5" alt="Event" />
                <img v-if="tag.ferientag == 1" :src="iconFerien" class="h-5 w-5" alt="Ferientag" />
            </div>
        </button>

        <!-- DETAILS -->
        <transition name="expand">
            <div v-if="open" class="px-4 py-3 space-y-4 bg-slate-50/60 border-t border-slate-100">
                <div v-if="isEmptyDay" class="px-2 py-4 text-center text-xs text-slate-400">
                    Kein Eintrag für diesen Tag.
                </div>
                <template v-else>
                    <article v-for="(detail, detailIdx) in details?.detail_kostenarten || []" :key="detailIdx"
                        class="rounded-xl bg-white p-3 shadow-sm">
                        <h2 class="mb-2 text-sm font-semibold text-slate-800">
                            {{ getDetailTitle(detail.detail_kostenart_id) }}</h2>
                        <ul class="space-y-2">
                            <li v-for="(angebot, angebotIdx) in detail.kostenarten" :key="angebotIdx"
                                class="rounded-lg bg-white p-2 shadow-sm">
                                <div v-if="angebot.menues?.length" class="space-y-2">
                                    <label v-for="(menue, mIdx) in angebot.menues" :key="mIdx"
                                        class="flex items-start gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer">
                                        <input class="mt-1 h-4 w-4 shrink-0 accent-sky-600" type="radio"
                                            :name="`menue-${tagIdx}-${angebotIdx}`" :value="mIdx"
                                            :checked="menue.ausgewaehlt == '1'"
                                            :disabled="angebot.aenderbar == '0' || menue.menge_verfuegbar <= 0 || menue.aenderbar == '0'"
                                            @click="$emit('select-menue', { detailIdx, angebotIdx, index: mIdx, tagIdx, date: tag.datum })" />
                                        <div class="flex-1 space-y-1">
                                            <div class="flex items-start justify-between gap-2">
                                                <div class="prose prose-sm max-w-none"><span
                                                        v-html="menue.menue_text"></span></div>
                                                <span v-if="menue.preis > 0"
                                                    class="text-xs font-semibold text-slate-700">{{ formatPreis(menue.preis) }}</span>
                                            </div>
                                            <span v-if="menue.menge_verfuegbar <= 0"
                                                class="text-xs rounded-full bg-rose-100 px-2 py-0.5 font-medium text-rose-700">Ausverkauft</span>
                                        </div>
                                    </label>
                                    <label v-if="angebot.pflicht == '0'"
                                        class="flex items-center gap-2 rounded-lg px-3 py-2 text-xs hover:bg-slate-50 cursor-pointer">
                                        <input class="h-4 w-4 accent-sky-600" type="radio"
                                            :name="`menue-${tagIdx}-${angebotIdx}`" value="-1"
                                            @click="$emit('select-menue', { detailIdx, angebotIdx, index: -1, tagIdx, date: tag.datum })" />
                                        <span class="text-slate-700">vom Essen abmelden</span>
                                    </label>
                                </div>

                                <div v-for="termin in angebot.termine || []" :key="termin.kurs_id"
                                    class="mt-2 rounded-lg bg-sky-50 px-3 py-2 text-sm hover:bg-sky-100 cursor-pointer"
                                    @click="$emit('kurs-details', termin.kurs_id)">
                                    <h3 class="text-sm font-semibold text-sky-900">{{ termin.kurs_name }}</h3>
                                    <div class="mt-1 flex flex-wrap gap-4 text-xs text-slate-700">
                                        <div>Treffpunkt: {{ termin.treffpunkt }}</div>
                                        <div>{{ termin.start }} – {{ termin.ende }}</div>
                                    </div>
                                </div>
                            </li>
                        </ul>

                        <div v-if="isAbotageEnabled(detail)"
                            class="mt-3 rounded-lg bg-sky-50 px-3 py-2 text-xs border border-sky-100">
                            <label class="inline-flex items-center gap-2">
                                <input class="h-4 w-4 accent-sky-600" type="checkbox" :checked="abotage[tagIdx]"
                                    @change="$emit('abo-change', { tagIdx, checked: $event.target.checked })" />
                                <span class="text-sky-900">{{ formatWeekday(tag.datum) }} als Abo wählen</span>
                            </label>
                        </div>
                    </article>
                </template>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { computed } from "vue";
import iconApfelAbo from "@/assets/images/apfel_abo.png";
import iconKreuzAbo from "@/assets/images/kreuz_abo.png";
import iconSpoonColor from "@/assets/images/icon_spoon_color.png";
import iconSpoonGray from "@/assets/images/icon_spoon_gray.png";
import iconKurse from "@/assets/images/kurse.png";
import iconEvent from "@/assets/images/event.png";
import iconFerien from "@/assets/images/ferien.png";

const props = defineProps({
    tag: Object,
    tagIdx: Number,
    details: Object,
    ESSEN_ID: String,
    abotage: Array,
    abotageOld: Array,
    open: Boolean
});

const emit = defineEmits(["toggle", "select-menue", "abo-change", "kurs-details", "vertretung"]);

const essenAngebot = computed(() => (props.details?.detail_kostenarten || [])
    .find(a => a.detail_kostenart_id === props.ESSEN_ID));

const isSelected = computed(() => essenAngebot.value?.menues?.some(m => m.ausgewaehlt == "1"));
const isAngemeldet = computed(() => essenAngebot.value?.angemeldet === 1 && isSelected.value);
const isAbgemeldet = computed(() => !isSelected.value);
const hasMenues = computed(() => !!essenAngebot.value);
const isAboDay = computed(() => props.abotageOld[props.tagIdx]);
const hasCourses = computed(() => (props.details?.detail_kostenarten || []).some(a => a.detail_kostenart_id !== props.ESSEN_ID));
const hasEvents = computed(() => props.tag.events?.length > 0);
const isEmptyDay = computed(() => (props.details?.detail_kostenarten?.length || 0) + (props.tag.events?.length || 0) === 0);
const isAbotageEnabled = detail => detail.kostenarten && detail.kostenarten.length > 0;

const getDetailTitle = () => "Details";

const formatDateLong = d => new Date(d).toLocaleDateString("de-DE", { weekday: "long", month: "short", day: "numeric" });
const formatWeekday = d => new Date(d).toLocaleDateString("de-DE", { weekday: "long" });
const formatPreis = value => Number(value).toLocaleString("de-DE", { style: "currency", currency: "EUR" });
</script>