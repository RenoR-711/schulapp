// ------------------------------------
// German locale data for Vue project
// ------------------------------------

export const localeDE = {
    language: "de-DE",

    date: {
        monthNames: [
            "Januar", "Februar", "März", "April", "Mai", "Juni",
            "Juli", "August", "September", "Oktober", "November", "Dezember"
        ],

        monthNamesShort: [
            "Jan", "Feb", "Mär", "Apr", "Mai", "Jun",
            "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"
        ],

        dayNames: [
            "Sonntag", "Montag", "Dienstag", "Mittwoch",
            "Donnerstag", "Freitag", "Samstag"
        ],

        dayNamesShort: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],

        formats: {
            fullDate: "EEEE, d. MMMM yyyy",
            longDate: "d. MMMM yyyy",
            mediumDate: "dd.MM.yyyy",
            shortDate: "dd.MM.yy",
            mediumTime: "HH:mm:ss",
            shortTime: "HH:mm",
            dateTime: "dd.MM.yyyy HH:mm:ss",
            dateTimeShort: "dd.MM.yy HH:mm"
        }
    },

    numbers: {
        decimal: ",",
        group: ".",
        currency: "€"
    },

    plural(n) {
        return n === 1 ? "one" : "other";
    }
};
