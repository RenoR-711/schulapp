// @ts-nocheck
// src/services/kalenderService.js
import config from "@/utils/config";

class KalenderService {
    constructor() {
        this._weekCache = new Map(); // shift -> Wochen-Daten
        this._monthCache = new Map(); // "YYYY-MM" -> Monats-Daten
        this.needRefresh = true;
    }

    /* -------------------- Woche laden -------------------- */
    async getWoche(shift = 0) {
        if (!this.needRefresh && this._weekCache.has(shift)) {
            return this._weekCache.get(shift);
        }

        try {
            const res = await fetch(
                `${config.BASE_URL}/kalender/woche?shift=${shift}`,
                { credentials: "include" }
            );

            if (!res.ok) throw new Error(res.statusText);

            const data = await res.json();
            
            this._weekCache.set(shift, data);
            this.needRefresh = false;
            return data;
        } catch (err) {
            console.warn("API nicht erreichbar – Demo-Woche:", err);

            const data = this._generateDemoWoche(shift);
            this._weekCache.set(shift, data);
            this.needRefresh = false;
            return data;
        }
    }

    /* -------------------- Monat laden -------------------- */
    async getMonth(year, month) {
        const key = `${year}-${String(month + 1).padStart(2, "0")}`;

        if (!this.needRefresh && this._monthCache.has(key)) {
            return this._monthCache.get(key);
        }

        try {
            const res = await fetch(
                `${config.BASE_URL}/kalender/monat?year=${year}&month=${month + 1}`,
                { credentials: "include" }
            );

            if (!res.ok) throw new Error(res.statusText);

            const data = await res.json();
            this._monthCache.set(key, data);
            this.needRefresh = false;
            return data;
        } catch (err) {
            console.warn("API nicht erreichbar – Demo-Monat:", err);

            const data = await this._generateDemoMonth(year, month);
            this._monthCache.set(key, data);
            this.needRefresh = false;
            return data;
        }
    }

    /* -------------------- Demo Woche -------------------- */
    _generateDemoWoche(shift = 0) {
        const heute = new Date();
        const base = new Date(heute);
        base.setDate(heute.getDate() + shift * 7);

        const wd = base.getDay(); // 0 = Sonntag
        const monday = new Date(base);
        monday.setDate(base.getDate() + (wd === 0 ? -6 : 1 - wd));

        const tage = [];
        const details = [];
        const ESSEN_ID = "5946B518504DCEF79B6D74589C54D4D3";

        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            const datumStr = d.toISOString().split("T")[0];

            const menues = [
                {
                    menue_nr: 1,
                    menue_text: "Schnitzel mit Pommes",
                    preis: 3.5,
                    ausgewaehlt: i === 0 ? "1" : "0",
                    menge_verfuegbar: 5,
                    allergie_konflikte: [],
                    ersatzkomponenten: [],
                    zusatzstoffe: [],
                },
                {
                    menue_nr: 2,
                    menue_text: "Vegetarische Pasta",
                    preis: 4.2,
                    ausgewaehlt: "0",
                    menge_verfuegbar: 3,
                    allergie_konflikte: [],
                    ersatzkomponenten: [],
                    zusatzstoffe: [],
                },
            ];

            tage.push({
                datum: datumStr,
                angebote: [
                    { detail_kostenart_id: ESSEN_ID, angemeldet: i % 2, menues },
                ],
                events:
                    i === 3
                        ? [
                            {
                                beschreibung: "Bastelnachmittag",
                                datum_von: `${datumStr} 14:00`,
                                showTime: true,
                            },
                        ]
                        : [],
                vertretungsplan:
                    i === 2
                        ? [
                            {
                                datum: `${datumStr} 10:15`,
                                info: "Herr Müller vertritt Frau Lange",
                                klasse: "Vertretung",
                            },
                        ]
                        : [],
            });

            details.push({
                datum: datumStr,
                detail_kostenarten: [
                    {
                        detail_kostenart_id: ESSEN_ID,
                        kostenarten: [
                            {
                                kostenart_id: "KA-" + i,
                                aenderbar: "1",
                                pflicht: "0",
                                menues,
                            },
                        ],
                    },
                ],
            });
        }

        return { tage, details };
    }

    /* -------------------- Demo Monat -------------------- */
    _generateDemoMonth(year, month) {
        const firstOfMonth = new Date(year, month, 1);
        const lastOfMonth = new Date(year, month + 1, 0);
        const tage = [];
        const details = [];

        for (
            let d = new Date(firstOfMonth);
            d <= lastOfMonth;
            d.setDate(d.getDate() + 1)
        ) {
            const datumStr = d.toISOString().split("T")[0];
            const demoWeek = this._generateDemoWoche(0);
            const tag = demoWeek.tage.find((t) => t.datum === datumStr);
            const detail = demoWeek.details.find((t) => t.datum === datumStr);
            if (tag) tage.push(tag);
            if (detail) details.push(detail);
        }

        return { tage, details };
    }

    /* -------------------- Cache löschen -------------------- */
    clearCaches() {
        this._weekCache.clear();
        this._monthCache.clear();
        this.needRefresh = true;
    }
}

export const kalenderService = new KalenderService();
