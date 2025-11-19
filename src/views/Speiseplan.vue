<template>
    <div class="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <header class="header ">
            <button @click="goStart" class="back-btn">
                Start...</button>       
        <div>
            <h1 class="text-lg font-semibold tracking-tight">Speiseplan</h1>
            <div class="w-16 text-right text-xs text-slate-400">KW {{ kalendWeek }}</div>
        </div>
 </header>
        <!-- Inhalt -->
        <main class="flex-1 overflow-y-auto px-3 pb-28 pt-4 content" v-touch:swipe.left="nextWoche"
            v-touch:swipe.right="prevWoche">
            <div v-if="!dataReady" class="flex h-full items-center justify-center">
                <div class="rounded-2xl bg-white px-6 py-4 shadow-sm text-slate-500 text-sm">Speiseplan wird geladen …
                    <img src="/src/assets/images/ajax-loader.gif" alt="Ladeanimation">
                </div>
            </div>

            <div v-else>
                <DayCard v-for="(tag, tagIdx) in kalend.tage" :key="tagIdx" :tag="tag" :tagIdx="tagIdx"
                    :details="kalend.details[tagIdx]" :icons="icons" :ESSEN_ID="ESSEN_ID" :abotage="abotage"
                    :abotageOld="abotageOld" :open="openDay === tagIdx" @toggle="toggleDay" @select-date="datumSelect"
                    @select-menue="handleSelectMenue" @abo-change="aboChange" @kurs-details="kurseDetails"
                    @vertretung="vertretungsplan" />
            </div>

            <!-- Menü-Dialog -->
            <MenueDialog v-if="showMenueDialog" :menue="selectedMenue.menue" :menueImage="selectedMenueImage"
                :nachrichtSekretariat="nachrichtSekretariat" :menueNachricht="selectedMenueNachricht"
                :postResult="postResult" @cancel="menueCancel" @ok="menueOk" />

            <!-- Abo Dialog -->
            <div v-if="showAboDialog" class="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
                <div class="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
                    <h2 class="mb-3 text-base font-semibold text-slate-900">Bitte bestätigen:</h2>
                    <p class="mb-4 text-sm text-slate-800">{{ aboText }}</p>
                    <div class="flex justify-end gap-2">
                        <button @click="aboCancel"
                            class="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium">Abbrechen</button>
                        <button @click="aboOk"
                            class="rounded-xl bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white">OK</button>
                    </div>
                </div>
            </div>
        </main>

        <!-- Navigation -->
        <nav
            class="sticky bottom-0 inset-x-0 z-30 flex items-stretch justify-around border-t border-slate-200 bg-white/95 px-2 py-1.5 backdrop-blur">
            <button @click="prevWoche"
                class="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 text-xs font-medium">
                <img :src="icons.circleLeft" class="h-5 w-5" alt="Woche zurück" /> Woche - </button>
            <button @click="aktWoche"
                class="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 text-xs font-semibold text-sky-700">
                <img :src="icons.check" class="h-5 w-5" alt="Heute" /> Heute </button>
            <button @click="nextWoche"
                class="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 text-xs font-medium">
                <img :src="icons.circleRight" class="h-5 w-5" alt="Woche vor" /> Woche + </button>
        </nav>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DayCard from '../components/DayCard.vue'
import MenueDialog from '../components/MenueDialog.vue'
import { kalenderService } from '../services/kalenderService'
import { authService } from '../services/authService'
import { teilnehmerService } from '../services/teilnehmerService'
import { settingsService } from '../services/settingsService'
import { createDate, formatDate } from '../utils/date'
import { BASE_URL } from '../utils/config'


/* Icons */
import iconApfelAbo from '../assets/images/apfel_abo.png'
import iconKreuzAbo from '../assets/images/kreuz_abo.png'
import iconSpoonColor from '../assets/images/icon_spoon_color.png'
import iconSpoonGray from '../assets/images/icon_spoon_gray.png'
import iconKurse from '../assets/images/kurse.png'
import iconInfo from '../assets/images/info.png'
import iconFerien from '../assets/images/ferien.png'
import iconCircleLeft from '../assets/images/icon-circleleft.png'
import iconCheck from '../assets/images/icon-check.png'
import iconCircleRight from '../assets/images/icon-circleright.png'
import defaultMenueImage from '../assets/images/essen.png'

const ESSEN_ID = '5946B518504DCEF79B6D74589C54D4D3'

const route = useRoute()
const router = useRouter()


const shift = ref(parseInt(route.params.shift || '0'))
const kalend = ref({ tage: [], details: [] })
const dataReady = ref(false)

const openDay = ref(null)
const toggleDay = (idx) => {
    openDay.value = openDay.value === idx ? null : idx
}


const selectedMenue = ref({ menue: {} })
const selectedMenueImage = ref(defaultMenueImage)
const selectedMenueNachricht = ref('')
const showMenueDialog = ref(false)
const postResult = ref('')


const selectedDate = ref(settingsService.getDate() || settingsService.getToday())
const aboText = ref('')
const abotage = ref([false, false, false, false, false, false, false])
const abotageOld = ref([false, false, false, false, false, false, false])


const showAboDialog = ref(false)
const nachrichtSekretariat = ref(0)


const appUrl = BASE_URL
const sessionKey = authService.sessionKey


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
    circleRight: iconCircleRight
}

/* KW Anzeige */
const kalendWeek = computed(() => {
    if (!kalend.value.tage.length) return ''
    const dt = createDate(kalend.value.tage[0].datum)
    const oneJan = new Date(dt.getFullYear(), 0, 1)
    const days = Math.floor((dt - oneJan) / 86400000)
    return Math.ceil((days + oneJan.getDay() + 1) / 7)
})

// INIT
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
            const flags = [];
            for (let i = 0; i < 7; i++) {
                flags[i] = (abotageValue & (1 << i)) !== 0;
            }
            abotage.value = [...flags];
            abotageOld.value = [...flags];
        },
        () => router.push("/error")
    );

    const w = parseInt(route.params.shift || "0", 10);
    shift.value = w;

    const week = await kalenderService.getWoche(w);
    kalend.value = week;

    dataReady.value = true;
};

// Template-Helfer
const formatDateLong = (d) => {
    const dt = createDate(d);
    return dt.toLocaleDateString("de-DE", {
        weekday: "long",
        month: "short",
        day: "numeric",
    });
};

const formatWeekday = (d) => {
    const dt = createDate(d);
    return dt.toLocaleDateString("de-DE", { weekday: "long" });
};

const isToday = (d) => {
    const saved = settingsService.getDate();
    const today = saved ? createDate(saved) : new Date();
    return today.toDateString() === createDate(d).toDateString();
};

const isEmptyDay = (tag) =>
    tag.angebote.length + tag.events.length === 0;

const hasMenues = (tag) =>
    tag.angebote.some((a) => a.detail_kostenart_id === ESSEN_ID);

const hasCourses = (tag) =>
    tag.angebote.some((a) => a.detail_kostenart_id !== ESSEN_ID);

const hasEvents = (tag) =>
    tag.events && tag.events.length > 0;

const isAngemeldet = (tag) => {
    for (const a of tag.angebote) {
        if (a.detail_kostenart_id === ESSEN_ID && a.angemeldet === 1) {
            return true;
        }
    }
    return false;
};

const isAbotag = (idx) => abotageOld.value[idx];

const isAbotageEnabled = (idx, detail) =>
    detail.kostenarten && detail.kostenarten.length > 0;

const getDetailTitle = (tagIdx, id) => {
    const d = kalend.value.details?.[tagIdx];
    if (!d) return "Details";
    // ggf. an dein echtes Datenmodell anpassen:
    return d.title || "Details";
};

// Navigation
const prevWoche = () =>
    router.push(`/kalenda/${shift.value - 1}`);
const nextWoche = () =>
    router.push(`/kalenda/${shift.value + 1}`);
const aktWoche = () => router.push(`/kalenda/0`);
const goStart = () => router.push("/start");
const vertretungsplan = () => router.push("/vertretungsplan");
const kurseDetails = (id) =>
    router.push(`/kursedetail/${id}`);

const datumSelect = (d) => {
    selectedDate.value = d;
    settingsService.setDate(d);
};

// Menü-Dialog
const getImageSrc = (menue) => {
    if (menue.bild_id) {
        return `${appUrl}/img/cache/customer${settingsService.getCustomerID()}/${menue.bild_id}.jpg?sk=${sessionKey}`;
    }
    return defaultMenueImage;
};

const selectMenue = (tagIdx, detailIdx, angebotIdx, index) => {
    const menues =
        kalend.value.details[tagIdx].detail_kostenarten[detailIdx]
            .kostenarten[angebotIdx].menues;

    if (index < menues.length) {
        selectedMenue.value.menue = { ...menues[index] };
        selectedMenueImage.value = getImageSrc(menues[index]);
    } else {
        selectedMenue.value.menue = { ...emptyMenue };
        selectedMenueImage.value = defaultMenueImage;
    }

    const d = createDate(selectedDate.value);
    selectedMenueDate.value = formatDate(d);

    showMenueDialog.value = true;
    postResult.value = "";
};

const menueCancel = () => {
    showMenueDialog.value = false;
};

const menueOk = () => {
    // TODO: hier dein ursprüngliches POST / Speichern implementieren
    // postResult.value = 'Erfolgreich gespeichert.';
    showMenueDialog.value = false;
};

// Abo-Dialog
const aboChange = (idx) => {
    const day = kalend.value.tage[idx];
    const wd = formatWeekday(day.datum);

    if (abotage.value[idx]) {
        aboText.value = `Hiermit melde ich mich jeden ${wd} dauerhaft verbindlich zum Essen an.`;
    } else {
        aboText.value = `Ich widerrufe die dauerhafte Anmeldung am ${wd}.`;
    }

    showAboDialog.value = true;
};

const aboOk = () => {
    showAboDialog.value = false;
    // TODO: hier dein ursprüngliches Speichern der Abo-Einstellungen aufrufen
};

const aboCancel = () => {
    // Änderungen zurückrollen
    abotage.value = [...abotageOld.value];
    showAboDialog.value = false;
};

// INIT
onMounted(() => {
    console.log("Speiseplan (Vue) geladen");
    init();
});
</script>
