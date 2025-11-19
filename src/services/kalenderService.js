// src/services/kalenderService.js
import { BASE_URL } from "@/utils/config";

class KalenderService {
    constructor() {
        this.started = false;
        this.needRefresh = true;
        this.nachricht_sekretariat = "";
        this.cacheRefreshHandler = undefined;

        this._weekCache = new Map(); // key: shift, value: { tage, details }
        this._tagSuccessHandlers = [];
        this._detailSuccessHandlers = [];
        this._tagErrorHandlers = [];
        this._detailErrorHandlers = [];
    }

    init() {
        // TODO: ggf. Initiallogik (z.B. Laden von Stammdaten)
        this.started = true;
        this.needRefresh = false;
    }

    addTagSuccessHandler(cb) {
        this._tagSuccessHandlers.push(cb);
    }

    addDetailSuccessHandler(cb) {
        this._detailSuccessHandlers.push(cb);
    }

    addTagErrorHandler(cb) {
        this._tagErrorHandlers.push(cb);
    }

    addDetailErrorHandler(cb) {
        this._detailErrorHandlers.push(cb);
    }

    /**
     * Lädt eine Woche vom Server (oder aus Cache)
     * @param {number} shift - Wochenverschiebung (0 = aktuelle, -1 = vorige, +1 = nächste)
     */
    async getWoche(shift) {

        // Beispielwoche generieren
        const heute = new Date();
        const start = new Date(heute);
        start.setDate(heute.getDate() + shift * 7);

        const tage = [];
        const details = [];

        for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);

            const datumStr = d.toISOString().split("T")[0];

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
                                bild_id: "",
                                ausgewaehlt: i === 0 ? "1" : "0",
                                ersatzkomponenten: [],
                                zusatzstoffe: [],
                                allergie_konflikte: []
                            },
                            {
                                menue_nr: 2,
                                menue_text: "Vegetarische Pasta",
                                bild_id: "",
                                ausgewaehlt: "0",
                                ersatzkomponenten: [],
                                zusatzstoffe: [],
                                allergie_konflikte: []
                            }
                        ]
                    }
                ],
                events: [],
                vertretungsplan: []
            });

            details.push({
                detail_kostenarten: [
                    {
                        detail_kostenartart_id: "X",
                        kostenarten: [
                            {
                                kostenart_id: "KA1",
                                menues: [
                                    {
                                        menue_nr: 1,
                                        menue_text: "Schnitzel mit Pommes",
                                        bild_id: "",
                                        ausgewaehlt: i === 0 ? "1" : "0",
                                        ersatzkomponenten: [],
                                        zusatzstoffe: [],
                                        allergie_konflikte: []
                                    },
                                    {
                                        menue_nr: 2,
                                        menue_text: "Vegetarische Pasta",
                                        bild_id: "",
                                        ausgewaehlt: "0",
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

        this._tagSuccessHandlers.forEach(cb => cb());
        this._detailSuccessHandlers.forEach(cb => cb());

        return data;
    }

    /**
     * Speichert Abo-Tage
     * @param {number} aboBitmask
     * @param {function} cb
     */
    async saveAbo(aboBitmask, cb) {
        try {
            // TODO: echten API-Call bauen
            // const res = await fetch(`${BASE_URL}/kalender/abo`, { ... });
            // const data = await res.json();
            const data = { fehler: 0 }; // Platzhalter

            cb(data);
        } catch (err) {
            cb({ fehler: -1, fehlermessage: "Netzwerkfehler" });
        }
    }

    /**
     * Speichert Menüauswahl
     * @param {object} auswahl
     * @param {function} success
     * @param {function} error
     */
    async saveMenue(auswahl, success, error) {
        try {
            // TODO: echten API-Call bauen
            // const res = await fetch(`${BASE_URL}/kalender/menue`, {...});
            // const data = await res.json();
            const data = { fehler: 0 }; // Platzhalter

            success(data);
        } catch (err) {
            if (error) {
                error({ fehlermessage: "Netzwerkfehler" });
            }
        }
    }
}

export const kalenderService = new KalenderService();
