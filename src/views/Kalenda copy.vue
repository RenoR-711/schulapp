console.log("Kalender VUE wurde geladen");

<template>
    <div class="kalender-page" v-if="dataReady">
        <!-- EIGENER HEADER -->
        <header class="kalender-header">
            <button class="back-btn" @click="start">⟵ Start</button>
            <h1>Kalender</h1>
            <span class="header-spacer"></span>
        </header>

        <!-- CONTENT -->
        <main class="kalender-content"
        v-touch:swipe.left="nextWoche"
        v-touch:swipe.right="prevWoche"
    >
    <!-- Tage -->
            <div
                v-for="(tag, idx) in kalend.tage"
                :key="idx"
                class="day-card"
            >
            <!-- Kopfzeile -->
                <div class="day-header">
                    <span>{{ tag.datum }}</span>
                    <span v-if="isToday(tag.datum)">Heute</span>
                    <span v-if="isAbotag(idx)">Abo</span>
                    <span v-if="isAngemeldet(tag)">Angemeldet</span>
                </div>

                <div v-if="hasMenues(tag)">
                    <h4>Menüs</h4>
                    <div
                        v-for="(angebot, aIdx) in tag.angebote"
                        :key="aIdx"
                        v-if="angebot.detail_kostenart_id === ESSEN_ID"
                    >
                        <div
                            v-for="(menue, mIdx) in getMenuesFor(tag, angebot)"
                            :key="mIdx"
                        >
                            <button @click="selectMenue(idx, 0, aIdx, mIdx)">
                                {{ menue.menue_text || 'Menü ' + menue.menue_nr }}
                            </button>
                        </div>
                    </div>
                </div>

                <div v-if="hasCourses(tag)">
                    <h4>Kurse</h4>
                </div>

                <div v-if="hasEvents(tag)">
                    <h4>Events</h4>
                </div>
            </div>
        </main>

        <!-- FUSS-NAVIGATION -->
        <footer class="kalender-footer">
            <button id="prev" @click="prevWoche">‹Woche</button>
            <button id="aktuel" @click="aktWoche">Heute</button>
            <button id="next" @click="nextWoche">Woche›</button>
        </footer>

        <!-- Menüauswahl-Dialog -->
        <div v-if="showMenueDialog" class="dialog-backdrop">
            <div class="dialog">
                <h3>Menü auswählen</h3>
                <img
                    :src="selectedMenue.selectedMenueImage"
                    :class="selectedMenue.selectedMenueClass"
                    alt="Menübild"
                />
                <p>{{ selectedMenue.menue.menue_text }}</p>

                <textarea
                    v-model="selectedMenue.menueNachricht"
                    placeholder="Nachricht an Sekretariat"
                ></textarea>

                <p v-if="nachrichtSekretariat">
                    {{ nachrichtSekretariat }}
                </p>

                <p v-if="postResult" class="error">{{ postResult }}</p>

                <div class="dialog-buttons">
                    <button @click="menueOk">OK</button>
                    <button @click="menueCancel">Abbrechen</button>
                </div>
            </div>
        </div>

        <!-- Abo-Dialog -->
        <div v-if="showAboDialog" class="dialog-backdrop">
            <div class="dialog">
                <h3>Abo ändern</h3>
                <p>{{ aboText }}</p>
                <div class="dialog-buttons">
                    <button @click="aboOk">OK</button>
                    <button @click="aboCancel">Abbrechen</button>
                </div>
            </div>
        </div>
    </div>

    <div v-else class="loading">Lade Daten …</div>
</template>

<script>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { kalenderService } from "../services/kalenderService";
import { authService } from "../services/authService";
import { teilnehmerService } from "../services/teilnehmerService";
import { settingsService } from "../services/settingsService";
import { createDate, formatDate } from "../utils/date";
import { BASE_URL } from "../utils/config";

const ESSEN_ID = "5946B518504DCEF79B6D74589C54D4D3";

export default {
    name: "Kalenda",

    setup() {
        console.log("Kalender VUE wurde geladen"); // <--- dein Log

        const route = useRoute();
        const router = useRouter();

        const shift = ref(parseInt(route.params.shift || "0", 10));
        const type = ref(route.params.type || "");

        const kalend = ref({ tage: [], details: [] });
        const dataReady = ref(false);

        const selectedMenue = ref({
            menue: {},
            selectedMenueImage: "css/images/essen.png",
            selectedMenueClass: "menue-default",
            selectedMenueId: 0,
            selectedMenueDate: "",
            menueNachricht: "",
        });

        const emptyMenue = {
            menue_nr: -1,
            bild_id: "",
            menue_text: "vom Essen abmelden",
            preis: 0,
            ausgewaehlt: true,
            allergie_konflikte: [],
            ersatzkomponenten: [],
            zusatzstoffe: [],
        };

        const selectedDate = ref(
            settingsService.getDate() || settingsService.getToday()
        );
        const timeoutId = ref(null);

        const anmeldungText =
            "Hiermit melde ich mich jeden %tags%, bis auf Widerruf, dauerhaft verbindlich und kostenpflichtig („Abo“) zum Essen an.";
        const abmeldungText =
            "Hiermit widerrufe ich meine dauerhafte Anmeldung („Abo“) zum Essen am %tags%.";

        const aboText = ref("");
        const aboTag = ref(0);
        const abotage = ref([false, false, false, false, false, false, false]);
        const abotageOld = ref([false, false, false, false, false, false, false]);
        const aboTyp = ref(0);

        const showMenueDialog = ref(false);
        const showAboDialog = ref(false);
        const nachrichtSekretariat = ref("");
        const postResult = ref("");

        const appUrl = BASE_URL;

        // --- Init-Funktion ---
        const init = () => {
            authService.load(async () => {
                abotage.value = [false, false, false, false, false, false, false];
                abotageOld.value = [false, false, false, false, false, false, false];
                aboTyp.value = 0;

                await teilnehmerService.getProfile(
                    (data) => {
                        const abotageValue = data.teilnehmer.abotage || 0;
                        const newAbotage = [
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                        ];
                        newAbotage.forEach((_, key) => {
                            const isAbotag = abotageValue & Math.pow(2, key);
                            if (isAbotag) {
                                newAbotage[key] = true;
                            }
                        });
                        abotage.value = [...newAbotage];
                        abotageOld.value = [...newAbotage];
                        aboTyp.value = data.teilnehmer.essenabotyp || 0;
                    },
                    () => {
                        router.push("/error");
                    }
                );

                const wShift = parseInt(route.params.shift || "0", 10);
                shift.value = wShift;
                type.value = route.params.type || "";

                // selectedMenue reset
                cleanMenueDialog();

                if (authService.sessionKey) {
                    if (!kalenderService.started || kalenderService.needRefresh) {
                        if (!kalenderService.cacheRefreshHandler) {
                            kalenderService.cacheRefreshHandler = () => {
                                kalenderService.init();
                            };
                        }
                        kalenderService.init();
                        kalenderService.addTagSuccessHandler(successTagHandler);
                        kalenderService.addDetailSuccessHandler(successDetailHandler);
                        kalenderService.addTagErrorHandler(errorHandler);
                        kalenderService.addDetailErrorHandler(errorHandler);

                        kalenderService.getWoche(wShift).then((data) => {
                            kalend.value = data;
                        });
                    } else {
                        kalenderService.getWoche(wShift).then((wResult) => {
                            kalend.value = wResult;
                        });
                    }
                } else {
                    router.push("/login");
                }
            });
        };

        // --- Handler ---
        const successTagHandler = () => {
            const res = kalenderService._weekCache.get(shift.value);
            if (res) {
                kalend.value = res;
                dataReady.value = true;
            }
        };

        const successDetailHandler = () => {
            const res = kalenderService._weekCache.get(shift.value);
            if (res) {
                kalend.value = res;
                dataReady.value = true;
                if (
                    kalend.value.details &&
                    kalend.value.details.length > 0 &&
                    kalend.value.details[0].detail_kostenarten
                ) {
                    selectedMenue.value.menue =
                        kalend.value.details[0].detail_kostenarten[0].kostenarten[0].menues[0];
                }
            }
        };

        const errorHandler = (errCode) => {
            settingsService.setDate(selectedDate.value);
            if (errCode === -2) {
                if (authService.saved) {
                    authService.login(
                        authService.cred,
                        () => {
                            authService.save();
                            kalenderService.needRefresh = true;
                            dataReady.value = false;
                            timeoutId.value = globalThis.setTimeout(init, 100);
                        },
                        () => {
                            authService.clear();
                            kalenderService.needRefresh = true;
                            router.push("/login");
                        }
                    );
                } else {
                    authService.clear();
                    kalenderService.needRefresh = true;
                    router.push("/login");
                }
            } else if (errCode === 2) {
                router.push({
                    name: "kalend",
                    params: { shift: shift.value, type: type.value || "" },
                });
            } else {
                router.push("/error");
                kalenderService.needRefresh = true;
            }
        };

        // --- Navigation der Wochen ---
        const prevWoche = () => {
            settingsService.setDate(selectedDate.value);
            if (timeoutId.value) globalThis.clearTimeout(timeoutId.value);
            router.push({
                name: "kalend",
                params: { shift: shift.value - 1, type: type.value || "" },
            });
        };

        const nextWoche = () => {
            settingsService.setDate(selectedDate.value);
            if (timeoutId.value) globalThis.clearTimeout(timeoutId.value);
            router.push({
                name: "kalend",
                params: { shift: shift.value + 1, type: type.value || "" },
            });
        };

        const aktWoche = () => {
            const today = settingsService.getToday();
            settingsService.setDate(today);
            selectedDate.value = today;
            if (timeoutId.value) globalThis.clearTimeout(timeoutId.value);
            router.push({
                name: "kalend",
                params: { shift: 0, type: type.value || "" },
            });
        };

        const start = () => {
            settingsService.setDate(selectedDate.value);
            if (timeoutId.value) globalThis.clearTimeout(timeoutId.value);
            router.push("/start");
        };

        const vertretungsplan = () => {
            settingsService.setDate(selectedDate.value);
            if (timeoutId.value) globalThis.clearTimeout(timeoutId.value);
            router.push("/vertretungsplan");
        };

        const kurseDetails = (id) => {
            settingsService.setDate(selectedDate.value);
            if (timeoutId.value) globalThis.clearTimeout(timeoutId.value);
            router.push({ name: "kursedetail", params: { kursId: id } });
        };

        // --- Template-Helfer ---
        const isToday = (d) => {
            const savedDate = settingsService.getDate();
            let td = new Date();
            if (savedDate) td = createDate(savedDate);
            const rd = createDate(d);
            return td.toDateString() === rd.toDateString();
        };

        const isEmptyDay = (t) => {
            const al = t.angebote.length;
            const el = t.events.length;
            return al + el === 0;
        };

        const isAngemeldet = (tag) => {
            for (const angebot of tag.angebote) {
                if (
                    angebot.detail_kostenart_id === ESSEN_ID &&
                    angebot.angemeldet === 1
                ) {
                    return true;
                }
            }
            return false;
        };

        const isAbotag = (tagIdx) => {
            const d = createDate(kalend.value.tage[tagIdx].datum);
            const td = new Date();
            return abotageOld.value[tagIdx] && d >= td;
        };

        const hasCourses = (tag) => {
            for (const angebot of tag.angebote) {
                if (angebot.detail_kostenart_id !== ESSEN_ID) {
                    return true;
                }
            }
            return false;
        };

        const hasMenues = (tag) => {
            for (const angebot of tag.angebote) {
                if (angebot.detail_kostenart_id === ESSEN_ID) {
                    return true;
                }
            }
            return false;
        };

        const hasEvents = (t) => {
            return t.events.length > 0;
        };

        const getImageSrc = (menue) => {
            if (menue.bild_id) {
                return `${appUrl}/img/cache/customer${settingsService.getCustomerID()}/${menue.bild_id}.jpg?sk=${authService.sessionKey}`;
            }

            return "css/images/essen.png";
        };

        const getMenuesFor = (tag, angebot) => {
            return angebot.menues || [];
        };

        // --- Menüauswahl & Dialog ---
        const selectMenue = (tagIdx, detailIdx, angebotIdx, index) => {
            settingsService.setDate(selectedDate.value);

            const menues =
                kalend.value.details[tagIdx].detail_kostenarten[detailIdx].kostenarten[
                    angebotIdx
                ].menues;

            const l = menues.length;
            for (let i = 0; i < l; i++) {
                if (i !== index) menues[i].ausgewaehlt = "0";
            }

            if (index < l) {
                menues[index].ausgewaehlt = "1";
                selectedMenue.value.menue = { ...menues[index] };
                selectedMenue.value.selectedMenueImage = getImageSrc(menues[index]);
                selectedMenue.value.selectedMenueClass = menues[index].bild_id
                    ? "menue-pic"
                    : "menue-default";
            } else {
                selectedMenue.value.menue = { ...emptyMenue };
                selectedMenue.value.selectedMenueImage = "css/images/essen.png";
                selectedMenue.value.selectedMenueClass = "menue-default";
            }

            selectedMenue.value.selectedMenueId =
                kalend.value.details[tagIdx].detail_kostenarten[detailIdx].kostenarten[
                    angebotIdx
                ].kostenart_id;

            const d = createDate(selectedDate.value);
            selectedMenue.value.selectedMenueDate = formatDate(d);

            selectedMenue.value.menueNachricht = "";
            nachrichtSekretariat.value = kalenderService.nachricht_sekretariat;
            postResult.value = "";

            showMenueDialog.value = true;
        };

        const menueCancel = () => {
            showMenueDialog.value = false;
            cleanMenueDialog();
            kalenderService.needRefresh = true;
            dataReady.value = false;
            init();
        };

        const menueOk = () => {
            postResult.value = "";

            const auswahl = {
                kostenart_id: selectedMenue.value.selectedMenueId,
                nachricht: selectedMenue.value.menueNachricht,
                essen: {
                    datum: selectedMenue.value.selectedMenueDate,
                    menue_nr: 1 * selectedMenue.value.menue.menue_nr,
                    komponenten: [],
                },
            };

            if (selectedMenue.value.menue.ersatzkomponenten) {
                selectedMenue.value.menue.ersatzkomponenten.forEach((k) => {
                    if (k.ausgewaehlt === true || k.ausgewaehlt === 1) {
                        auswahl.essen.komponenten.push(k.speise_id);
                    }
                });
            }

            kalenderService.saveMenue(
                auswahl,
                (data) => {
                    if (data.fehler && data.fehler !== 0) {
                        postResult.value = data.fehlermessage;
                    } else {
                        showMenueDialog.value = false;
                        cleanMenueDialog();
                        kalenderService.needRefresh = true;
                        dataReady.value = false;
                        init();
                    }
                },
                (data) => {
                    if (data.fehlermessage) {
                        postResult.value = data.fehlermessage;
                    }
                }
            );
        };

        const cleanMenueDialog = () => {
            selectedMenue.value = {
                menue: {},
                selectedMenueImage: "css/images/essen.png",
                selectedMenueClass: "menue-pic",
                selectedMenueId: 0,
                selectedMenueDate: "",
                menueNachricht: "",
            };
        };

        // --- Abo-Logik ---
        const aboChange = (tagIdx) => {
            aboTag.value = tagIdx;
            settingsService.setDate(selectedDate.value);
            const datum = kalend.value.tage[tagIdx].datum;
            const d = createDate(datum);
            const tagName = d.toLocaleDateString("de-DE", { weekday: "long" });
            const isAnmeldung = abotage.value[tagIdx];
            aboText.value = isAnmeldung ? anmeldungText : abmeldungText;
            aboText.value = aboText.value.replace("%tags%", tagName);
            showAboDialog.value = true;
        };

        const aboModalClose = () => {
            kalenderService.needRefresh = true;
            dataReady.value = false;
            showAboDialog.value = false;
            init();
        };

        const aboCancel = () => {
            teilnehmerService.refresh();
            aboModalClose();
        };

        const aboOk = () => {
            let abotageVal = 0;
            abotage.value.forEach((val, key) => {
                abotageVal += val ? Math.pow(2, key) : 0;
            });

            kalenderService.saveAbo(abotageVal, (data) => {
                if (data.fehler) {
                    abotage.value[aboTag.value] = abotageOld.value[aboTag.value];
                    if (data.fehler === -2) {
                        aboText.value = data.fehlermessage;
                        teilnehmerService.clearProfileData();
                        aboModalClose();
                    } else {
                        aboText.value = data.fehlermessage;
                    }
                } else {
                    abotageOld.value[aboTag.value] = abotage.value[aboTag.value];
                    teilnehmerService.clearProfileData();
                    aboModalClose();
                }
            });
        };

        const datumSelect = (e, d) => {
            selectedDate.value = d;
        };

        onMounted(() => {
            init();
        });

        return {
            ESSEN_ID,

            kalend,
            dataReady,

            prevWoche,
            nextWoche,
            aktWoche,
            start,
            vertretungsplan,
            kurseDetails,

            isToday,
            isEmptyDay,
            isAngemeldet,
            isAbotag,
            hasCourses,
            hasMenues,
            hasEvents,
            getMenuesFor,

            selectMenue,
            menueCancel,
            menueOk,
            showMenueDialog,
            selectedMenue,
            nachrichtSekretariat,
            postResult,

            aboChange,
            aboOk,
            aboCancel,
            showAboDialog,
            aboText,

            datumSelect,
        };
    },
};
</script>

<style scoped>
.kalender-page {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

.kalender-header {
    background: #333333;
    padding: 0.6rem 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: white;
}

.back-btn {
    background: none;
    border: none;
    background-image: url('/public/css/images/icons/white/icon-homealt.png') ;
    background-repeat: no-repeat;
    color: white;
}

.kalender-logo {
    height: 32px;
    opacity: 0.9;
}

.header-spacer {
    width: 24px;
}

.kalender-content {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
}

.kalender-footer {
    background: #333333;
    padding: 0.5rem;
    display: flex;
    justify-content: space-around;
}

.kalender-footer button {
    padding: 0.5rem 1rem;
    border-radius: 6px;
    background: white;
    border: 1px solid #ccc;
}

.day-card {
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 0.75rem;
    margin-bottom: 0.75rem;
}

.dialog-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
}

.dialog {
    background: #fff;
    padding: 1rem;
    border-radius: 8px;
    width: 90%;
    max-width: 400px;
}

.dialog-buttons {
    margin-top: 1rem;
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
}

.menue-pic {
    max-width: 100%;
    border-radius: 6px;
}

.error {
    color: red;
}

.loading {
    padding: 2rem;
    text-align: center;
}
</style>
