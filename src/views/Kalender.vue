<template>
    <div class="wrapper">
        <h1 class="text-2xl font-semibold text-slate-700 mb-4">Kalender</h1>

        <!-- Kalender -->
        <div class="calendar-wrapper">

            <!-- Navigation -->
            <div class="nav">
                <button @click="prevMonth">‹</button>
                <div class="label">{{ monthTitle }}</div>
                <button @click="nextMonth">›</button>
            </div>

            <!-- Wochentage -->
            <div class="grid-weekday">
                <div v-for="w in weekdays" :key="w" class="weekday">{{ w }}</div>
            </div>

            <!-- Monat -->
            <div class="grid-month">
                <div
                    v-for="(day, idx) in monthDays"
                    :key="idx"
                    class="day"
                    :class="{
                        empty: !day.date,
                        today: isToday(day.date),
                        hasData: day.tag,
                    }"
                    @click="selectDay(day)"
                >
                    <template v-if="day.date">
                        <div class="date-number">{{ day.date.getDate() }}</div>

                        <div class="icon-with-count" v-if="day.tag?.events?.length">
                            <img :src="iconKurse" class="calendar-icon" />
                            <span class="count count-blue">{{ day.tag.events.length }}</span>
                        </div>

                        <div class="icon-with-count" v-if="day.tag?.vertretungsplan?.length">
                            <img :src="iconVertretung" class="calendar-icon" />
                            <span class="count count-orange">{{ day.tag.vertretungsplan.length }}</span>
                        </div>
                    </template>
                </div>
            </div>
        </div>

        <!-- DETAILS -->
        <div v-if="selectedTag.tag" class="dialog-box content-wrap">
            <h5><small>{{ formatDateLong(selectedTag.date) }}</small></h5>

            <div class="details-grid">
                <section v-if="selectedTag.tag.events?.length">
                    <ul class="space-y-2">
                        <li
                            v-for="event in selectedTag.tag.events"
                            :key="event.beschreibung"
                            class="p-2 bg-sky-50 rounded-lg"
                        >
                            <strong>{{ event.beschreibung }}</strong>
                        </li>
                    </ul>
                </section>

                <section v-if="selectedTag.tag.vertretungsplan?.length">
                    <ul class="space-y-2">
                        <li
                            v-for="v in selectedTag.tag.vertretungsplan"
                            :key="v.datum"
                            class="p-2 bg-red-50 rounded-lg"
                        >
                            <strong>{{ v.klasse }}</strong><br />
                            <small>{{ v.info }}</small>
                        </li>
                    </ul>
                </section>
            </div>
        </div>

        <p v-else>Keine Daten für diesen Tag.</p>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { kalenderService } from "@/services/kalenderService";

import iconKurse from "@/assets/images/kurse.png";
import iconVertretung from "@/assets/images/event.png";

/* STATE */
const current = ref(new Date());
const kalend = ref({ tage: [], details: [] });
const weekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

const selectedTag = ref({
    tag: null,
    date: null
});

/* Monatstitel */
const monthTitle = computed(() =>
    current.value.toLocaleDateString("de-DE", { month: "long", year: "numeric" })
);

/* Monatstage berechnen */
const monthDays = computed(() => {
    const first = new Date(current.value.getFullYear(), current.value.getMonth(), 1);
    const start = first.getDay() === 0 ? 6 : first.getDay() - 1;

    const days = Array(start).fill({ date: null, tag: null });

    const lastDate = new Date(current.value.getFullYear(), current.value.getMonth() + 1, 0).getDate();

    for (let d = 1; d <= lastDate; d++) {
        const date = new Date(current.value.getFullYear(), current.value.getMonth(), d);
        const iso = date.toISOString().split("T")[0];
        const tag = kalend.value.tage.find(t => t.datum === iso) || null;
        days.push({ date, tag });
    }

    return days;
});

/* Navigation */
const prevMonth = () => {
    current.value = new Date(current.value.getFullYear(), current.value.getMonth() - 1, 1);
    selectedTag.value = { tag: null, date: null };
};
const nextMonth = () => {
    current.value = new Date(current.value.getFullYear(), current.value.getMonth() + 1, 1);
    selectedTag.value = { tag: null, date: null };
};

/* Helfer */
const isToday = date =>
    date && new Date().toDateString() === date.toDateString();

const formatDateLong = d =>
    d ? new Date(d).toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "";

/* Tag auswählen */
const selectDay = (day) => {
    if (!day.date) return;
    selectedTag.value = { date: day.date, tag: day.tag };
};

/* Monat laden */
const loadMonth = async () => {
    const y = current.value.getFullYear();
    const m = current.value.getMonth();

    try {
        kalend.value = await kalenderService.getMonth(y, m);
    } catch {
        kalend.value = await kalenderService.getMonth(y, m); // Demo-Daten
    }

    const todayIso = new Date().toISOString().split("T")[0];
    const today = kalend.value.tage.find(t => t.datum === todayIso);

    selectedTag.value = today
        ? { date: new Date(today.datum), tag: today }
        : { tag: null, date: null };
};

onMounted(loadMonth);
watch(current, loadMonth);
</script>

<style scoped>
/* NAV */
.nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.nav button {
    font-size: 1.6rem;
    padding: 2px 10px;
}

/* GRID */
.grid-weekday,
.grid-month {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
}

.weekday {
    padding: 4px 0;
    text-align: center;
    color: #666;
    font-size: 0.8rem;
    font-weight: 600;
}

.day {
    min-height: 75px;
    padding: 4px;
    background: #fafafa;
    border-radius: 8px;
    border: 1px solid #eee;
    cursor: pointer;
    position: relative;
}

.day.empty {
    background: #eee;
    border: 1px dotted #888;
    opacity: 0.5;
    cursor: default;
}

.day.today {
    background: #eaf3ff;
    border-color: #8bb8ff;
}

.date-number {
    font-size: 0.8rem;
    font-weight: 700;
}

.details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

.calendar-icon {
    width: 22px;
    height: 22px;
    margin-top: 4px;
}

.icon-with-count {
    position: relative;
    display: inline-block;
}

.count {
    position: absolute;
    top: -4px;
    right: -6px;
    background: #333;
    color: #fff;
    font-size: 10px;
    font-weight: 600;
    padding: 0 4px;
    border-radius: 10px;
    min-width: 16px;
    text-align: center;
}

/* Farben */
.count-blue {
    background: #2563eb;
}

.count-orange {
    background: #f59e0b;
}
</style>
