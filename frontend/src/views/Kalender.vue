<template>
    <div class="wrapper">

        <h1 class="title">Kalender</h1>

        <!-- KALENDER -->
        <div class="calendar-container">

            <!-- Navigation -->
            <div class="month-nav">
                <button class="nav-btn" @click="prevMonth">‹</button>
                <div class="month-label">{{ monthTitle }}</div>
                <button class="nav-btn" @click="nextMonth">›</button>
            </div>

            <!-- Wochentage -->
            <div class="weekday-grid">
                <div v-for="w in weekdays" :key="w" class="weekday">{{ w }}</div>
            </div>

            <!-- Tage -->
            <div class="month-grid">
                <div
                    v-for="(day, i) in days"
                    :key="i"
                    class="day-card"
                    :class="{
                        empty: !day.date,
                        today: isToday(day.date),
                        active: isSelected(day),
                        hasData: day.tag
                    }"
                    @click="selectDay(day)"
                >
                    <template v-if="day.date">
                        <div class="day-number">{{ day.date.getDate() }}</div>

                        <!-- Events -->
                        <div
                            class="icon-count"
                            v-if="day.tag?.events?.length"
                        >
                            <img :src="iconKurse" class="icon" alt="event"/>
                            <span class="bubble blue">{{ day.tag.events.length }}</span>
                        </div>

                        <!-- Vertretungsplan -->
                        <div
                            class="icon-count"
                            v-if="day.tag?.vertretungsplan?.length"
                        >
                            <img :src="iconVertretung" class="icon" alt="Vertretung"/>
                            <span class="bubble orange">{{ day.tag.vertretungsplan.length }}</span>
                        </div>
                    </template>
                </div>
            </div>
        </div>

        <!-- DETAILS -->
        <div v-if="selected.tag" class="details-card">
            <h4 class="details-date">
                {{ formatLong(selected.date) }}
            </h4>

            <div class="details-grid">

                <!-- Events -->
                <section v-if="selected.tag.events?.length">
                    <h5 class="section-title">Events</h5>
                    <ul class="list">
                        <li
                            v-for="ev in selected.tag.events"
                            :key="ev.beschreibung"
                            class="list-item blue-item"
                        >
                            <strong>{{ ev.beschreibung }}</strong>
                        </li>
                    </ul>
                </section>

                <!-- Vertretungsplan -->
                <section v-if="selected.tag.vertretungsplan?.length">
                    <h5 class="section-title">Vertretungsplan</h5>
                    <ul class="list">
                        <li
                            v-for="v in selected.tag.vertretungsplan"
                            :key="v.klasse + v.info"
                            class="list-item orange-item"
                        >
                            <strong>{{ v.klasse }}</strong><br />
                            <small>{{ v.info }}</small>
                        </li>
                    </ul>
                </section>
            </div>
        </div>

        <p v-else class="info">Wähle einen Tag aus…</p>

    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { kalenderService } from "@/services/kalenderService";

import iconKurse from "@/assets/images/kurse.png";
import iconVertretung from "@/assets/images/event.png";

/* State */
const current = ref(new Date());
const data = ref({ tage: [] });   // Backend-Monatsdaten
const weekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

const selected = ref({
    date: null,
    tag: null
});

/* Monatstitel */
const monthTitle = computed(() =>
    current.value.toLocaleDateString("de-DE", {
        month: "long",
        year: "numeric"
    })
);

/* Monatstage berechnen */
const days = computed(() => {
    const y = current.value.getFullYear();
    const m = current.value.getMonth();
    const first = new Date(y, m, 1);
    const start = (first.getDay() + 6) % 7;

    const out = Array(start).fill({ date: null, tag: null });
    const lastDay = new Date(y, m + 1, 0).getDate();

    for (let d = 1; d <= lastDay; d++) {
        const date = new Date(y, m, d);
        const iso = date.toISOString().split("T")[0];

        const tag = data.value.tage.find(t => t.datum === iso) || null;

        out.push({ date, tag });
    }

    return out;
});

/* Helpers */
const isToday = (d) =>
    d && new Date().toDateString() === d.toDateString();

const isSelected = (day) =>
    selected.value.date &&
    day.date &&
    selected.value.date.toDateString() === day.date.toDateString();

const formatLong = (d) =>
    d
        ? d.toLocaleDateString("de-DE", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric"
          })
        : "";

/* Tag-Auswahl */
const selectDay = (day) => {
    if (!day.date) return;

    selected.value = {
        date: day.date,
        tag: day.tag
    };
};

/* Monatsdaten laden */
const load = async () => {
    const y = current.value.getFullYear();
    const m = current.value.getMonth();

    data.value = await kalenderService.getMonth(y, m);

    const todayIso = new Date().toISOString().split("T")[0];
    const today = data.value.tage.find(t => t.datum === todayIso);

    selected.value = today
        ? { date: new Date(today.datum), tag: today }
        : { date: null, tag: null };
};

/* Navigation */
const prevMonth = () => {
    current.value = new Date(
        current.value.getFullYear(),
        current.value.getMonth() - 1,
        1
    );
};

const nextMonth = () => {
    current.value = new Date(
        current.value.getFullYear(),
        current.value.getMonth() + 1,
        1
    );
};

watch(current, load);
onMounted(load);
</script>

<style scoped>
.wrapper {
    padding: 16px;
}

.title {
    font-size: 1.6rem;
    font-weight: 700;
    color: #334155;
    margin-bottom: 16px;
}

/* NAV */
.month-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}
.nav-btn {
    font-size: 1.6rem;
    background: none;
    border: none;
    padding: 4px 10px;
    cursor: pointer;
    color: #475569;
}
.month-label {
    font-weight: 600;
    font-size: 1rem;
    color: #1e293b;
}

/* Wochentage */
.weekday-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
    margin-bottom: 4px;
}
.weekday {
    font-size: 0.75rem;
    font-weight: 600;
    color: #64748b;
}

/* MONTH GRID */
.month-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 6px;
}

.day-card {
    min-height: 70px;
    background: #f8fafc;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    padding: 4px;
    cursor: pointer;
    position: relative;
    transition: 0.2s;
}
.day-card:hover:not(.empty) {
    background: #eef3ff;
}
.day-card.today {
    background: #e5edff;
    border-color: #8daaff;
}
.day-card.active {
    border-color: #2563eb;
    box-shadow: 0 0 0 2px #2563eb40;
}

.day-card.empty {
    background: #e2e8f0;
    opacity: 0.45;
    cursor: default;
}

.day-number {
    font-weight: 700;
    font-size: 0.8rem;
}

/* ICONS */
.icon {
    width: 22px;
    margin-top: 2px;
}
.icon-count {
    position: relative;
    display: inline-block;
}
.bubble {
    position: absolute;
    top: -4px;
    right: -6px;
    font-size: 10px;
    padding: 0 4px;
    border-radius: 10px;
    color: white;
}
.blue { background: #2563eb; }
.orange { background: #f59e0b; }

/* DETAILS */
.details-card {
    margin-top: 16px;
    background: #f8fafc;
    padding: 16px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
}
.details-date {
    font-weight: 600;
    margin-bottom: 12px;
}
.details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}
.section-title {
    font-weight: 600;
    margin-bottom: 8px;
}
.list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.list-item {
    padding: 10px;
    border-radius: 8px;
}
.blue-item { background: #e0edff; }
.orange-item { background: #ffe7d5; }

.info {
    margin-top: 10px;
    color: #64748b;
    font-size: 0.9rem;
}
</style>
