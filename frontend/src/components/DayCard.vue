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

                <div v-if="tag.ferientag == 1"
                     class="mt-0.5 text-xs font-medium text-sky-700">
                    Ferientag
                </div>
            </div>

            <!-- ICONS -->
            <div class="flex items-center gap-2">
                <img
                    v-if="hasMenues && isAboDay"
                    :src="isAngemeldet ? iconApfelAbo : iconKreuzAbo"
                    class="h-5 w-5"
                    alt="Abo Status"
                />

                <img
                    v-else-if="hasMenues"
                    :src="isSelected ? iconSpoonColor : iconSpoonGray"
                    class="h-5 w-5"
                    alt="Menü Status"
                />

                <img
                    v-if="hasEvents"
                    :src="iconEvent"
                    class="h-5 w-5"
                    alt="Event"
                />

                <img
                    v-if="tag.ferientag == 1"
                    :src="iconFerien"
                    class="h-5 w-5"
                    alt="Ferientag"
                />
            </div>
        </button>

        <!-- DETAILS -->
        <transition name="expand">
            <div
                v-if="open"
                class="px-4 py-3 space-y-4 bg-slate-50/60 border-t border-slate-100"
            >
                <!-- Kein Menü -->
                <div v-if="tag.menues.length === 0"
                     class="px-2 py-4 text-center text-xs text-slate-400">
                    Kein Eintrag für diesen Tag.
                </div>

                <template v-else>
                    <article class="rounded-xl bg-white p-3 shadow-sm">
                        <h2 class="mb-2 text-sm font-semibold text-slate-800">Menüauswahl</h2>

                        <ul class="space-y-2">

                            <!-- MENÜS -->
                            <li
                                v-for="(menue, menueIdx) in tag.menues"
                                :key="menueIdx"
                                class="rounded-lg bg-white p-2 shadow-sm"
                            >
                                <label
                                    class="flex items-start gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer"
                                >
                                    <input
                                        type="radio"
                                        class="mt-1 h-4 w-4 shrink-0 accent-sky-600"
                                        :name="`menue-${tagIdx}`"
                                        :value="menueIdx"
                                        :checked="menue.ausgewaehlt == 1"
                                        :disabled="menue.menge_verfuegbar <= 0"
                                        @change="$emit('select-menue', { tagIdx, menueIdx })"
                                    />

                                    <div class="flex-1 space-y-1">
                                        <div class="flex items-start justify-between gap-2">
                                            <div
                                                class="prose prose-sm max-w-none"
                                                v-html="menue.menue_text"
                                            ></div>

                                            <span
                                                v-if="menue.preis > 0"
                                                class="text-xs font-semibold text-slate-700"
                                            >
                                                {{ formatPreis(menue.preis) }}
                                            </span>
                                        </div>

                                        <span
                                            v-if="menue.menge_verfuegbar <= 0"
                                            class="text-xs rounded-full bg-rose-100 px-2 py-0.5 font-medium text-rose-700"
                                        >
                                            Ausverkauft
                                        </span>
                                    </div>
                                </label>
                            </li>

                            <!-- Abmelden -->
                            <li class="rounded-lg bg-white p-2 shadow-sm">
                                <label
                                    class="flex items-center gap-2 rounded-lg px-3 py-2 text-xs hover:bg-slate-50 cursor-pointer"
                                >
                                    <input
                                        type="radio"
                                        class="h-4 w-4 accent-sky-600"
                                        :name="`menue-${tagIdx}`"
                                        value="-1"
                                        @change="$emit('select-menue', { tagIdx, menueIdx: -1 })"
                                    />
                                    <span class="text-slate-700">vom Essen abmelden</span>
                                </label>
                            </li>

                        </ul>

                        <!-- ABO -->
                        <div
                            v-if="tag.menues.length > 0"
                            class="mt-3 rounded-lg bg-sky-50 px-3 py-2 text-xs border border-sky-100"
                        >
                            <label class="inline-flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    class="h-4 w-4 accent-sky-600"
                                    :checked="abotage[tagIdx]"
                                    @change="$emit('abo-change', { tagIdx, checked: $event.target.checked })"
                                />
                                <span class="text-sky-900">
                                    {{ formatWeekday(tag.datum) }} als Abo wählen
                                </span>
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
import iconEvent from "@/assets/images/event.png";
import iconFerien from "@/assets/images/ferien.png";

const props = defineProps({
    tag: Object,
    tagIdx: Number,
    abotage: Array,
    open: Boolean
});

defineEmits(["toggle", "select-menue", "abo-change"]);

/* Computed */
const hasMenues = computed(() => props.tag.menues?.length > 0);
const isSelected = computed(() => props.tag.menues?.some((m) => m.ausgewaehlt == 1));
const isAboDay = computed(() => props.abotage[props.tagIdx]);
const isAngemeldet = computed(() => isSelected.value && isAboDay.value);

const hasEvents = computed(() => props.tag.events?.length > 0);

/* Utils */
const formatDateLong = (d) =>
    new Date(d).toLocaleDateString("de-DE", {
        weekday: "long",
        month: "short",
        day: "numeric",
    });

const formatWeekday = (d) =>
    new Date(d).toLocaleDateString("de-DE", { weekday: "long" });

const formatPreis = (value) =>
    Number(value).toLocaleString("de-DE", {
        style: "currency",
        currency: "EUR",
    });
</script>
