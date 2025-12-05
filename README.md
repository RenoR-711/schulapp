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

![Loginscreen](./frontend/screenshots/loginscreen.png)
![Startscreen](./frontend/screenshots/startscreen.png)
![Kalender](./frontend/screenshots/kalender.png)

| Startscreen                                              | Wochenübersicht                                         | Essensdetails                                              |
| -------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------- |
| <img src="./frontend/screenshots/start.png" width="250"> | <img src="./frontend/screenshots/week.png" width="250"> | <img src="./frontend/screenshots/details.png" width="250"> |
