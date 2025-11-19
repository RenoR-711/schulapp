// -------------------------
// Date utility functions
// -------------------------

/**
 * Format Date object as dd.mm.yyyy
 */
export function formatDate(date) {
    if (!(date instanceof Date)) {
        console.warn("formatDate: invalid input", date);
        return "";
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
}

/**
 * Convert yyyy-mm-dd → Date object (Android legacy fix)
 */
export function createDate(dateString) {
    const parts = dateString.split("-");
    const year = Number.parseInt(parts[0], 10);
    const month = Number.parseInt(parts[1], 10) - 1;
    const day = Number.parseInt(parts[2], 10);

    return new Date(Date.UTC(year, month, day));
}

/**
 * Convert dd.mm.yyyy → yyyy-mm-dd
 */
export function parseDate(dateString) {
    const parts = dateString.split(".");
    const day = parts[0];
    const month = parts[1];
    const year = parts[2];

    return `${year}-${month}-${day}`;
}

/**
 * Convert dd.mm.yyyy hh:mm → Date object
 */
export function parseFullDate(dateString) {
    const [datePart, timePart] = dateString.split(" ");
    const [day, month, year] = datePart.split(".");
    const [hour, minute] = timePart.split(":");

    const d = new Date();
    d.setFullYear(year, NumberparseInt(month, 10) - 1, day);
    d.setHours(hour, minute, 0, 0);

    return d;
}
