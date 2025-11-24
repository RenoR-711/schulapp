<!-- Speiseplan.vue -->
<template>
    <div class="wrapper">

        <!-- HEADER -->
        <header class="header">
            <h1 class="text-3xl font-semibold tracking-tight text-slate-700">Speiseplan</h1>
            <div class="w-16 text-right text-xs text-slate-400">
                KW {{ kalendWeek }}
            </div>
        </header>

        <!-- HAUPTINHALT -->
        <main class="content">
            <!-- LADEN -->
            <div v-if="!dataReady" class="flex h-full items-center justify-center">
                <div class="rounded-2xl px-6 py-4 shadow-sm text-slate-500 text-sm">
                    Speiseplan wird geladen…
                    <img src="/src/assets/images/ajax-loader.gif" alt="Ladeanimation">
                </div>
            </div>

            <!-- TAGE -->
            <div v-else>
                <DayCard v-for="(tag, tagIdx) in kalend.tage" :key="tagIdx" :id="`daycard-${tagIdx}`" :tag="tag"
                    :tagIdx="tagIdx" :details="kalend.details[tagIdx]" :icons="icons" :ESSEN_ID="ESSEN_ID"
                    :abotage="abotage" :abotageOld="abotageOld" :open="openDay === tagIdx" :is-first="tagIdx === 0"
                    :is-last="tagIdx === kalend.tage.length - 1" @toggle="toggleDay" @select-menue="handleSelectMenue"
                    @abo-change="aboChange" @kurs-details="kurseDetails" @vertretung="vertretungsplan" />
            </div>

            <!-- MENÜDIALOG -->
            <MenueDialog v-if="showMenueDialog" :anchorY="dialogAnchor" :anchorHeight="dialogAnchorHeight"
                :menue="selectedMenue.menue" :menueImage="selectedMenueImage"
                :nachrichtSekretariat="nachrichtSekretariat" :menueNachricht="selectedMenueNachricht"
                :postResult="postResult" :mode="selectedMenue.mode" @cancel="menueCancel" @ok="menueOk" />

            <!-- Abo Dialog -->
            <AboDialog v-if="showAboDialog" :text="aboText" @ok="aboOk" @cancel="aboCancel" />
        </main>

        <!-- NAVIGATION -->
        <nav class="sticky bottom-0 inset-x-0 z-30 flex items-stretch justify-around bg-white/90  ">
            <button @click="prevWoche" class="nav-btn">
                <img :src="icons.circleLeft" class="h-5 w-5" alt="Woche zurück" />
                Woche -
            </button>
            <button @click="aktWoche" class="nav-btn">
                <img :src="icons.check" class="h-5 w-5" alt="Heute" />
                Heute
            </button>
            <button @click="nextWoche" class="nav-btn">
                <img :src="icons.circleRight" class="h-5 w-5" alt="Woche vor" />
                Woche +
            </button>
        </nav>

        <footer class="footer">
            <div></div>
        </footer>

    </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";

import DayCard from "@/components/DayCard.vue";
import MenueDialog from "@/components/MenueDialog.vue";
import AboDialog from '@/components/AboDialog.vue'

import { kalenderService } from "@/services/kalenderService";
import { authService } from "@/services/authService";
import { teilnehmerService } from "@/services/teilnehmerService";
import { settingsService } from "@/services/settingsService";

import { createDate } from "@/utils/date";
import { BASE_URL } from "@/utils/config";

/* Icons */
import iconApfelAbo from "@/assets/images/apfel_abo.png";
import iconKreuzAbo from "@/assets/images/kreuz_abo.png";
import iconSpoonColor from "@/assets/images/icon_spoon_color.png";
import iconSpoonGray from "@/assets/images/icon_spoon_gray.png";
import iconKurse from "@/assets/images/kurse.png";
import iconInfo from "@/assets/images/info.png";
import iconFerien from "@/assets/images/ferien.png";
import iconCircleLeft from "@/assets/images/icon-circleleft.png";
import iconCheck from "@/assets/images/icon-check.png";
import iconCircleRight from "@/assets/images/icon-circleright.png";
import defaultMenueImage from "@/assets/images/essen.png";

/* Konstanten */
const ESSEN_ID = "5946B518504DCEF79B6D74589C54D4D3";

const route = useRoute();
const router = useRouter();

/* States */
const shift = ref(parseInt(route.params.shift || "0"));
const kalend = ref({ tage: [], details: [] });
const dataReady = ref(false);

const openDay = ref(null);
const toggleDay = (i) => (openDay.value = openDay.value === i ? null : i);

/* Dialog */
const dialogAnchor = ref(0);
const dialogAnchorHeight = ref(0);

const showMenueDialog = ref(false);
const selectedMenue = ref({ menue: {} });
const selectedMenueImage = ref(defaultMenueImage);

const selectedMenueNachricht = ref("");
const postResult = ref("");
const nachrichtSekretariat = ref("");

/* Abo */
const aboText = ref("");
const abotage = ref([false, false, false, false, false]);
const abotageOld = ref([false, false, false, false, false]);
const showAboDialog = ref(false);

/* Icons Objekt */
const icons = {
    apfelAbo: iconApfelAbo,
    kreuzAbo: iconKreuzAbo,
    spoonColor: iconSpoonColor,
    spoonGray: iconSpoonGray,
    kurse: iconKurse,
    info: iconInfo,
    ferien: iconFerien,
    circleLeft: iconCircleLeft,
    check: iconCheck,
    circleRight: iconCircleRight,
};

/* Woche */
const kalendWeek = computed(() => {
    if (!kalend.value.tage.length) return "";
    const dt = createDate(kalend.value.tage[0].datum);
    const oneJan = new Date(dt.getFullYear(), 0, 1);
    const days = Math.floor((dt - oneJan) / 86400000);
    return Math.ceil((days + oneJan.getDay() + 1) / 7);
});

const init = async () => {
    dataReady.value = false;

    await authService.load();
    if (!authService.isLoggedIn()) {
        router.push("/login");
        return;
    }

    await teilnehmerService.getProfile(
        (profile) => {
            const abotageValue = profile.teilnehmer.abotage || 0;
            const flags = Array.from({ length: 7 }, (_, i) =>
                (abotageValue & (1 << i)) !== 0
            );
            abotage.value = [...flags];
            abotageOld.value = [...flags];
        },
        () => router.push("/error")
    );

    const week = parseInt(route.params.shift || "0");
    shift.value = week;

    // 🔥 Service liefert Mo–So fertig sortiert
    kalend.value = await kalenderService.getWoche(week);

    dataReady.value = true;
};

/* Navigation */
const prevWoche = () => router.push(`/speiseplan/${shift.value - 1}`);
const nextWoche = () => router.push(`/speiseplan/${shift.value + 1}`);
const aktWoche = () => router.push(`/speiseplan/0`);
const goStart = () => router.push("/start");
const vertretungsplan = () => router.push("/vertretungsplan");
const kurseDetails = (id) => router.push(`/kursedetail/${id}`);

/* Menü auswählen */
const handleSelectMenue = async ({ tagIdx, detailIdx, angebotIdx, index }) => {
    if (openDay.value !== tagIdx) {
        openDay.value = tagIdx;
        await nextTick();
    }

    const el = document.getElementById(`daycard-${tagIdx}`);
    if (el) {
        const r = el.getBoundingClientRect();
        dialogAnchor.value = r.top + window.scrollY;
        dialogAnchorHeight.value = r.height;
    } else {
        dialogAnchor.value = window.innerHeight * 0.3;
        dialogAnchorHeight.value = 200;
    }

    // 🔥 Sicheres Teilen
    const detailBlock = kalend.value.details?.[tagIdx]?.detail_kostenarten?.[detailIdx];
    const angebotBlock = detailBlock?.kostenarten?.[angebotIdx];

    // 👉 Spezialfall: „Vom Essen abmelden“ (index = -1 oder menues.length)
    if (index === -1 || index === angebotBlock?.menues?.length) {
       selectedMenue.value = {menue: null, mode: "abmelden",tagIdx};
        selectedMenueImage.value = defaultMenueImage;
        showMenueDialog.value = true;
        return;
    }

    // 👉 Normales Menü
    const menue = angebotBlock?.menues?.[index];

    // 👉 Falls Menü fehlt → NICHT crashen
    if (!menue) {
        console.warn("⚠️ Menü nicht gefunden", { tagIdx, detailIdx, angebotIdx, index });
        return;
    }

    selectedMenue.value = {
    menue: { ...menue },
    mode: "menue",
    tagIdx,
    detailIdx,
    angebotIdx,
    index
};


    selectedMenueImage.value = menue.bild_id
        ? `${BASE_URL}/img/cache/customer${settingsService.getCustomerID()}/${menue.bild_id}.jpg`
        : defaultMenueImage;

    showMenueDialog.value = true;
};

const menueCancel = () => (showMenueDialog.value = false);
const menueOk = () => {
    showMenueDialog.value = false;

    // --- Abmelden-Modus ---
if (selectedMenue.value.mode === "abmelden") {
    const tagIdx = selectedMenue.value.tagIdx;

        // Alle Menüs des Tages abwählen
    kalend.value.details[tagIdx]?.detail_kostenarten?.forEach(detail => {
        detail.kostenarten?.forEach(angebot => {
            angebot.menues?.forEach(m => {
                m.ausgewaehlt = "0";
            });
        });
    });

    // DayCard zuklappen
    openDay.value = null;

    return;
}

    // --- Menü wählen ---
    if (selectedMenue.value.mode === "menue") {

        const { tagIdx, detailIdx, angebotIdx, index } = selectedMenue.value;

        const kostenartenBlock =
            kalend.value.details[tagIdx]
                .detail_kostenarten[detailIdx]
                .kostenarten[angebotIdx];

        // zuerst alles abwählen
        kostenartenBlock.menues.forEach(m => (m.ausgewaehlt = "0"));

        // dann gewähltes Menü setzen
        kostenartenBlock.menues[index].ausgewaehlt = "1";
    }
};

/* Abo */
const aboChange = ({ tagIdx, checked }) => {
    const wd = createDate(kalend.value.tage[tagIdx].datum)
        .toLocaleDateString("de-DE", { weekday: "long" });

    // checked = NEUER Zustand nach Klick
    aboText.value = checked
        ? `Hiermit melde ich mich jeden ${wd} dauerhaft verbindlich zum Essen an.`
        : `Ich widerrufe die dauerhafte Anmeldung am ${wd}.`;

    showAboDialog.value = true;
};

const aboOk = () => (showAboDialog.value = false);
const aboCancel = () => {
    abotage.value = [...abotageOld.value];
    showAboDialog.value = false;
};

onMounted(init);
</script>
<style scoped>

/* --------------------------------------------- */
/* PAGE BACKGROUND */
/* --------------------------------------------- */
.wrapper {
    background: linear-gradient(180deg, #f8fafc 0%, #eef4fa 60%);
    min-height: 100vh;
}

/* --------------------------------------------- */
/* HEADER */
/* --------------------------------------------- */
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 18px;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    box-shadow:
        0 4px 12px rgba(0, 0, 0, 0.08),
        0 1px 4px rgba(0, 0, 0, 0.05);
    border-bottom: 1px solid rgba(255, 255, 255, 0.6);
}

/* --------------------------------------------- */
/* BACK BUTTON */
/* --------------------------------------------- */
.back-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: rgba(236, 244, 255, 0.7);
    border-radius: 10px;
    backdrop-filter: blur(4px);
    color: #1e3a8a;
    font-weight: 500;
    border: 1px solid rgba(200, 220, 255, 0.6);
    transition: all 0.2s ease;
}

.back-btn:active {
    transform: scale(0.97);
    background: rgba(226, 236, 255, 0.9);
}

/* --------------------------------------------- */
/* NAVIGATION FOOTER */
/* --------------------------------------------- */
nav {
    backdrop-filter: blur(12px);
    background: rgba(255, 255, 255, 0.9);
    box-shadow:
        0 -4px 12px rgba(0, 0, 0, 0.08),
        0 -1px 4px rgba(0, 0, 0, 0.04);
    padding: 6px 0;
}

.nav-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 6px 0;
    font-size: 0.8rem;
    color: #374151;
    transition: all 0.15s ease;
}

.nav-btn:active {
    transform: scale(0.96);
    color: #1d4ed8;
}

/* --------------------------------------------- */
/* CARD WRAPPER (DayCard Container) */
/* --------------------------------------------- */
#daycard {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(6px);
    border-radius: 18px;
    overflow: hidden;
    box-shadow:
        0 6px 14px rgba(0, 0, 0, 0.12),
        0 2px 6px rgba(0, 0, 0, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.6);
    margin-bottom: 12px;
}

/* --------------------------------------------- */
/* LOADING BOX */
/* --------------------------------------------- */
.shadow-sm {
    box-shadow:
        0 6px 14px rgba(0, 0, 0, 0.10),
        0 2px 4px rgba(0, 0, 0, 0.06);
}

/* --------------------------------------------- */
/* ICON REFINEMENTS */
/* --------------------------------------------- */
.h-5.w-5 {
    filter: drop-shadow(0 1px 1px rgba(0,0,0,0.15));
}

/* --------------------------------------------- */
/* EXPANDED AREA (Hintergrund der Details) */
/* --------------------------------------------- */
.bg-slate-50\/60 {
    background: rgba(248, 250, 252, 0.7);
    backdrop-filter: blur(4px);
}

/* --------------------------------------------- */
/* TRANSITION */
/* --------------------------------------------- */
.expand-enter-active,
.expand-leave-active {
    transition: all 0.25s ease;
}

.expand-enter-from,
.expand-leave-to {
    opacity: 0;
    transform: translateY(-6px);
}
</style>