// @ts-nocheck
export const VERSION = 1;
export const PLATFORM = Capacitor.getPlatform(); // "android", "ios", "web"
export const COPYRIGHT = `2025 - ${new Date().getFullYear()}`;
export const LOGO = "css/images/logo_new.png"; // ändern

// Backend API URL
export const BASE_URL = "http://127.0.0.1:8000/api";

// Default export
export default {
  VERSION,
  PLATFORM,
  COPYRIGHT,
  LOGO,
  BASE_URL,
};
