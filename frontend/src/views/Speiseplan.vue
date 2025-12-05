<!-- Speiseplan.vue -->
<template>
  <div class="wrapper">
    <!-- HEADER -->
    <header class="header">
      <div @click="$router.push('/start')" class="icon">
        <img :src="iconHome" alt="Start" />
      </div>

      <h1 class="text-3xl font-semibold tracking-tight text-white">
        Speiseplan
      </h1>

      <div class="w-16 text-right text-xs text-slate-400">
        KW {{ kalendWeek }}
      </div>
    </header>

    <!-- INHALT -->
    <main class="content">
      <!-- LOADING -->
      <div v-if="!dataReady" class="flex h-full items-center justify-center">
        <div class="rounded-2xl px-6 py-4 shadow-sm text-slate-500 text-sm">
          Speiseplan wird geladen…
          <img src="/src/assets/images/ajax-loader.gif" alt="Ladeanimation" />
        </div>
      </div>

      <!-- TAGE -->
      <div v-else>
        <DayCard
          v-for="(tag, tagIdx) in kalend.tage"
          :key="tagIdx"
          :id="`daycard-${tagIdx}`"
          :tag="tag"
          :tagIdx="tagIdx"
          :ESSEN_ID="ESSEN_ID"
          :abotage="abotage"
          :abotageOld="abotageOld"
          :open="openDay === tagIdx"
          @toggle="toggleDay"
          @select-menue="handleSelectMenue"
          @abo-change="aboChange"
          @kurs-details="kurseDetails"
          @vertretung="vertretungsplan"
        />
      </div>

      <!-- MENÜ-DIALOG -->
      <MenueDialog
        v-if="showMenueDialog"
        :anchorY="dialogAnchor"
        :menue="selectedMenue.menue"
        :menueImage="selectedMenueImage"
        :nachrichtSekretariat="nachrichtSekretariat"
        :menueNachricht="selectedMenueNachricht"
        :mode="selectedMenue.mode"
        @cancel="menueCancel"
        @ok="menueOk"
      />

      <!-- ABO-DIALOG -->
      <AboDialog
        v-if="showAboDialog"
        :text="aboText"
        @ok="aboOk"
        @cancel="aboCancel"
      />
    </main>

    <!-- SubNAV -->
    <SubNav class="sticky bottom-0 z-30" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import DayCard from "@/components/DayCard.vue";
import MenueDialog from "@/components/MenueDialog.vue";
import AboDialog from "@/components/AboDialog.vue";
import SubNav from "@/components/SubNav.vue";

import { kalenderService } from "@/services/kalenderService";
import { authService } from "@/services/authService";
import { profilService } from "@/services/profilService";
import { settingsService } from "@/services/settingsService";

import { createDate } from "@/utils/date";
import { BASE_URL } from "@/utils/config";

import defaultMenueImage from "@/assets/images/essen.png";
import iconHome from "@/assets/images/icon-home.png";

/* Konstanten */
const ESSEN_ID = "5946B518504DCEF79B6D74589C54D4D3";

/* Route + Router */
const route = useRoute();
const router = useRouter();
const shift = ref(Number(route.params.shift || 0));

/* Kalender State */
const kalend = reactive({ tage: [] });
const dataReady = ref(false);

/* Tage öffnen */
const openDay = ref(null);
const toggleDay = (i) => (openDay.value = openDay.value === i ? null : i);

/* Menüdialog */
const showMenueDialog = ref(false);
const selectedMenue = ref({});
const selectedMenueImage = ref(defaultMenueImage);
const dialogAnchor = ref(0);
const selectedMenueNachricht = ref("");
const nachrichtSekretariat = ref("");

/* Abo */
const showAboDialog = ref(false);
const abotage = ref([false, false, false, false, false]);
const abotageOld = ref([false, false, false, false, false]);
const aboText = ref("");

/* Kalenderwoche */
const kalendWeek = computed(() => {
  if (!kalend.tage.length) return "";
  const dt = createDate(kalend.tage[0].datum);
  const oneJan = new Date(dt.getFullYear(), 0, 1);
  const diffDays = Math.floor((dt - oneJan) / 86400000);
  return Math.ceil((diffDays + oneJan.getDay() + 1) / 7);
});

/* INIT */
const init = async () => {
  dataReady.value = false;

  await authService.load();
  if (!(await authService.isLoggedIn())) {
    router.push("/login");
    return;
  }

  // Abo laden
  try {
    const profile = await profilService.getProfile();
    const raw = profile?.teilnehmer?.abotage ?? 0;
    const flags = Array.from({ length: 7 }, (_, i) => (raw & (1 << i)) !== 0);
    abotage.value = [...flags];
    abotageOld.value = [...flags];
  } catch {
    globalThis.$toast?.("Profil konnte nicht geladen werden.");
    router.push("/start");
    return;
  }

  await loadKalender(shift.value);
};

/* KALENDER LADEN */
const loadKalender = async (currentShift) => {
  dataReady.value = false;
  const woche = await kalenderService.getWoche(currentShift);

  // NUR tage übernehmen
  kalend.tage = woche.tage;

  dataReady.value = true;
};

/* MENÜ-AUSWAHL */
const handleSelectMenue = async ({ tagIdx, menueIdx }) => {
  if (openDay.value !== tagIdx) {
    openDay.value = tagIdx;
    await nextTick();
  }

  const el = document.getElementById(`daycard-${tagIdx}`);
  if (el) {
    const r = el.getBoundingClientRect();
    dialogAnchor.value = r.top + globalThis.scrollY;
  }

  const tag = kalend.tage[tagIdx];
  if (!tag) return;

  /* Abmelden */
  if (menueIdx === -1) {
    selectedMenue.value = { mode: "abmelden", tagIdx };
    selectedMenueImage.value = defaultMenueImage;
    showMenueDialog.value = true;
    return;
  }

  /* Menü wählen */
  const menue = tag.menues[menueIdx];
  if (!menue) return;

  selectedMenue.value = {
    mode: "menue",
    tagIdx,
    menueIdx,
    menue,
  };

  selectedMenueImage.value = menue.bild_id
    ? `${BASE_URL}/img/cache/customer${settingsService.getCustomerID()}/${
        menue.bild_id
      }.jpg`
    : defaultMenueImage;

  showMenueDialog.value = true;
};

/* MENÜ OK */
const menueOk = async () => {
  showMenueDialog.value = false;

  const { tagIdx, mode, menue } = selectedMenue.value;
  const tag = kalend.tage[tagIdx];

  // ABMELDEN
  if (mode === "abmelden") {
    tag.menues.forEach((m) => (m.ausgewaehlt = 0));
    await kalenderService.setMenue(tag.datum, null);
    openDay.value = null;
    return;
  }

  // MENÜ WÄHLEN
  const menueObj = menue;  // <-- dieses Menü wurde im Dialog gewählt

  if (!menueObj) {
    return;
  }

  // 1) Frontend aktualisieren
  tag.menues.forEach((m) => (m.ausgewaehlt = 0));
  menueObj.ausgewaehlt = 1;

  // 2) Backend speichern
  await kalenderService.setMenue(tag.datum, menueObj.id);
};

/* MENÜ CANCEL */
const menueCancel = () => {
  showMenueDialog.value = false;
};

/* ABO */
const aboChange = ({ tagIdx, checked }) => {
  const wd = createDate(kalend.tage[tagIdx].datum).toLocaleDateString("de-DE", {
    weekday: "long",
  });

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

/* Routing */
const vertretungsplan = () => router.push("/vertretungsplan");
const kurseDetails = (id) => router.push(`/kursedetail/${id}`);

/* SHIFT Watch */
watch(shift, async (newShift) => {
  await loadKalender(newShift);
});

/* Mounted */
onMounted(init);
</script>
