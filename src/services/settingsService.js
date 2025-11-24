// src/services/settingsService.ts
import { parseDate, formatDate } from '@/utils/date';
const KEY_DATE = 'datum';
const KEY_CUSTOMER = 'customerId';
export const settingsService = {
    getDate() {
        const d = window.localStorage.getItem(KEY_DATE);
        return d ?? null;
    },
    setDate(d) {
        // erwartet String im Format yyyy-mm-dd
        // optional Validierung mit parseDate, wenn du willst:
        const iso = d.includes('.') ? parseDate(d) : d;
        window.localStorage.setItem(KEY_DATE, iso);
    },
    getToday() {
        const today = new Date();
        // nutzt deine Util-Funktion
        // wenn du lieber yyyy-mm-dd willst → direkt selbst bauen
        return formatDate(today);
    },
    getCustomerID() {
        return window.localStorage.getItem(KEY_CUSTOMER) ?? '';
    },
    setCustomerID(id) {
        window.localStorage.setItem(KEY_CUSTOMER, id);
    },
};
