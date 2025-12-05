# schulapp Menü Plan – Schul-App  
![Status](https://img.shields.io/badge/Status-In%20Entwicklung-yellow)
![License](https://img.shields.io/badge/License-MIT-blue)

Mobile Schul-App zur Essensbestellung, Wochenplanung und Verwaltung.  
Das Projekt kombiniert ein modernes **Vue-Frontend (Framework7 + Vite + Capacitor)** mit einem **Laravel-Backend** – alles in einem **Monorepo**.

> ⚠️ **Hinweis:**  
> Dieses Projekt befindet sich noch in aktiver Entwicklung.  
> Einige Bereiche sind noch nicht vollständig implementiert.

---

# 📸 schulapp Menü Plan – Screenshots

| Login-Screen der App                                               | Startscreen                                         |  Wochenplan mit Speiseübersicht                                              |
| -------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------- |
| <img src="./frontend/screenshots/loginscreen.png" width="250"> | <img src="./frontend/screenshots/startscreen.png" width="250"> | <img src="./frontend/screenshots/kalender.png" width="250"> |

---

# 🚀 Features

### ✔ Schüler / Eltern
- Wochen-Speiseplan ansehen  
- Menü auswählen oder abbestellen  
- Tages- oder Wochenansicht  
- Übersicht über Kosten & Bestellungen  

### ✔ Backend (Schule / Verwaltung)
- Menüs & Wochenpläne verwalten  
- API für externe Systeme  
- Token-basierte Authentifizierung (Laravel Sanctum)  

### ✔ App-Funktionen
- Mobile Optimierung durch Framework7  
- Offline-Unterstützung (Vite + PWA optional)  
- Android-App via Capacitor  

---

# 🧱 Technologie-Stack

### 🔹 **Frontend**
- Vue 3 (Composition API)
- Framework7 v8
- Vite
- Capacitor 6 (Android & iOS)
- TailwindCSS (optional)

### 🔹 **Backend**
- Laravel 11  
- Sanctum (Auth)
- MySQL / MariaDB
- REST API

### 🔹 **Monorepo-Struktur**