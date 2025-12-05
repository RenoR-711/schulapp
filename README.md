# schulapp Menü Plan – Monorepo

Dieses Repository enthält:

- **frontend/** – Mobile App (Vue 3, Vite, Capacitor)
- **backend/** – Laravel API

## Installation

### Backend installieren
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve

### Frontend installieren
cd frontend
npm install
npm run dev

## Build der App (Android/iOS)
cd frontend
npx cap sync
npx cap open android   # oder ios

# schulapp Menü Plan – Screenshot

| Screenshot                                                  | Beschreibung                   |
| ----------------------------------------------------------- | ------------------------------ |
| <img src="./frontend/screenshots/login.png" width="200">    | Login-Screen der App           |
| <img src="./frontend/screenshots/calendar.png" width="200"> | Wochenplan mit Speiseübersicht |
| <img src="./frontend/screenshots/details.png" width="200">  | Detailansicht eines Menüs      |