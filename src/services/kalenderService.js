// @ts-nocheck
// src/services/kalenderService.js
import config from '@/utils/config';
class KalenderService {
    constructor() {
        this.started = false;
        this.needRefresh = true;
        // Nachricht aus Backend
        this.nachricht_sekretariat = "";
        // AngularJS-artige Handler
        this._tagSuccessHandlers = [];
        this._detailSuccessHandlers = [];
        this._tagErrorHandlers = [];
        this._detailErrorHandlers = [];
        // Cache wie früher (key = shift)
        this._weekCache = new Map();
    }
    // INIT 
    init() {
        this.started = true;
        this.needRefresh = false;
    }
    // Registrieren
    addTagSuccessHandler(cb) { this._tagSuccessHandlers.push(cb); }
    addDetailSuccessHandler(cb) { this._detailSuccessHandlers.push(cb); }
    addTagErrorHandler(cb) { this._tagErrorHandlers.push(cb); }
    addDetailErrorHandler(cb) { this._detailErrorHandlers.push(cb); }
    // Dispatcher
    _dispatchTagSuccess() { this._tagSuccessHandlers.forEach(h => h()); }
    _dispatchDetailSuccess() { this._detailSuccessHandlers.forEach(h => h()); }
    _dispatchTagError(code) { this._tagErrorHandlers.forEach(h => h(code)); }
    _dispatchDetailError(code) { this._detailErrorHandlers.forEach(h => h(code)); }
    /**
     * Demo-Woche generieren
     */
    async getWoche(shift = 0) {
        // Cache nutzen
        if (!this.needRefresh && this._weekCache.has(shift)) {
            return this._weekCache.get(shift);
        }

        // --- Montag bestimmen ---
        const heute = new Date();
        const base = new Date(heute);
        base.setDate(heute.getDate() + shift * 7);

        const wd = base.getDay();       // 0=So, 1=Mo
        const monday = new Date(base);
        monday.setDate(base.getDate() + (wd === 0 ? -6 : 1 - wd));

        const tage = [];
        const details = [];

        this.nachricht_sekretariat = "Bitte melden Sie Allergien rechtzeitig im Sekretariat.";

        // --- Mo–So erzeugen ---
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);

            const datumStr = d.toISOString().split("T")[0];

            // TAG
            tage.push({
                datum: datumStr,
                angebote: [
                    {
                        detail_kostenart_id: "5946B518504DCEF79B6D74589C54D4D3",
                        angemeldet: i % 2,
                        menues: [
                            {
                                menue_nr: 1,
                                menue_text: "Schnitzel mit Pommes",
                                preis: 3.5,
                                ausgewaehlt: i === 0 ? "1" : "0",
                                menge_verfuegbar: 5,
                                allergie_konflikte: [],
                                ersatzkomponenten: [],
                                zusatzstoffe: []
                            },
                            {
                                menue_nr: 2,
                                menue_text: "Vegetarische Pasta",
                                preis: 4.2,
                                ausgewaehlt: "0",
                                menge_verfuegbar: 3,
                                allergie_konflikte: [],
                                ersatzkomponenten: [],
                                zusatzstoffe: []
                            }
                        ]
                    }
                ],
                events: i === 3 ? [
                    {
                        beschreibung: "Bastelnachmittag",
                        datum_von: `${datumStr} 14:00`,
                        showTime: true
                    }
                ] : [],
                vertretungsplan: i === 2 ? [
                    {
                        datum: `${datumStr} 10:15`,
                        bemerkung: "Herr Müller vertritt Frau Lange",
                        vertretungsart: "Vertretung"
                    }
                ] : []
            });

            // DETAILS
            details.push({
                datum: datumStr,
                detail_kostenarten: [
                    {
                        detail_kostenart_id: "5946B518504DCEF79B6D74589C54D4D3",
                        kostenarten: [
                            {
                                kostenart_id: "KA-" + i,
                                aenderbar: "1",
                                pflicht: "0",
                                menues: [
                                    {
                                        menue_nr: 1,
                                        menue_text: "Schnitzel mit Pommes",
                                        preis: 3.5,
                                        ausgewaehlt: i === 0 ? "1" : "0",
                                        menge_verfuegbar: 5,
                                        allergie_konflikte: [],
                                        ersatzkomponenten: [],
                                        zusatzstoffe: []
                                    },
                                    {
                                        menue_nr: 2,
                                        menue_text: "Vegetarische Pasta",
                                        preis: 4.2,
                                        ausgewaehlt: "0",
                                        menge_verfuegbar: 3,
                                        allergie_konflikte: [],
                                        ersatzkomponenten: [],
                                        zusatzstoffe: []
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });
        }

        const data = { tage, details };

        this._weekCache.set(shift, data);
        this.needRefresh = false;

        this._dispatchTagSuccess();
        this._dispatchDetailSuccess();

        return data;
    }

    /**
     * Abo speichern
     */
    async saveAbo(aboBitmask, cb) {
        try {
            const res = await fetch(`${config.BASE_URL}/kalender/abo`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ abotage: aboBitmask })
            });
            const data = await res.json();
            if (res.status === 401) {
                return cb({ fehler: -2, fehlermessage: "Session abgelaufen" });
            }
            cb(data);
        }
        catch (err) {
            cb({
                fehler: -1,
                fehlermessage: "Netzwerkfehler"
            });
        }
    }
    /**
     * Menü speichern
     */
    async saveMenue(auswahl, success, error) {
        try {
            const res = await fetch(`${config.BASE_URL}/kalender/menue`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(auswahl)
            });
            const data = await res.json();
            if (res.status === 401) {
                return error?.({
                    fehler: -2,
                    fehlermessage: "Session abgelaufen"
                });
            }
            if (data.fehler && data.fehler !== 0) {
                return error?.(data);
            }
            success(data);
        }
        catch (err) {
            error?.({
                fehler: -1,
                fehlermessage: "Netzwerkfehler"
            });
        }
    }
}
export const kalenderService = new KalenderService();
