// -------------------------
// Cookie utilities
// -------------------------

/**
 * Set a browser cookie
 */
export function setCookie(name, value, expires, path, domain, secure) {
    if (!name || value === undefined || value === null) return;

    let cookie = `${name}=${encodeURIComponent(value)}`;

    if (expires instanceof Date) {
        cookie += `; expires=${expires.toUTCString()}`;
    }
    if (path) cookie += `; path=${path}`;
    if (domain) cookie += `; domain=${domain}`;
    if (secure) cookie += `; secure`;

    document.cookie = cookie;
}
