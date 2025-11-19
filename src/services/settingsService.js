// src/services/settingsService.js
import { formatDate, createDate } from "@/utils/date";

const KEY_DATE = "datum";
const KEY_CUSTOMER = "customerId";

export const settingsService = {
    getDate() {
        return window.localStorage.getItem(KEY_DATE) || null;
    },

    setDate(d) {
        // erwartet String im Format yyyy-mm-dd
        window.localStorage.setItem(KEY_DATE, d);
    },

    getToday() {
        const d = new Date();
        // hier kannst du parseDate/formatDate nutzen
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    },

    getCustomerID() {
        return window.localStorage.getItem(KEY_CUSTOMER) || "";
    },

    setCustomerID(id) {
        window.localStorage.setItem(KEY_CUSTOMER, id);
    }
};
