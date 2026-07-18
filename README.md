# SevaApp

A simple, offline-first React Native (Expo) app that puts every Indian government
service and emergency helpline **one tap away** — tailored to the user's state and
district.

## What it does

1. **Onboarding (all local, no account)**
   - Welcome screen explaining the app.
   - **Location** — asks for location permission once and reverse-geocodes the
     GPS fix to detect the user's **state & district**. If permission is denied
     or detection fails, the user can pick their state manually.
   - **Signup** — collects basic info (name, gender, age group, optional phone &
     blood group). Everything is stored **only on the device** via AsyncStorage.

2. **Home**
   - Personalised greeting + detected location.
   - **Search** across every service (e.g. "police", "ambulance", "scholarship").
   - **One-tap emergency dial** tiles: 112, 100 (Police), 101 (Fire), 108 (Ambulance).
   - If the user selected **Female**, the **Women's Helpline** is surfaced prominently.
   - A grid of 10 help categories.

3. **Category → Service detail**
   - Browse services in a category (filtered to national + the user's state).
   - Each service shows a description, department, **one-tap call buttons**,
     links to official apps (Play Store / App Store) and websites, and complaint portals.

## Dynamic data (serverless)

The directory is **dynamic** — admins add/edit/remove data without code changes.

```
Mobile app ──GET /bootstrap──▶ API Gateway ─▶ Lambda ─▶ DynamoDB ◀─ Admin web app
   │                                                                 (local CRUD)
   └─ caches to AsyncStorage; ships a bundled snapshot as offline fallback
```

- **`backend/`** — serverless API: AWS Lambda + DynamoDB + API Gateway (HTTP API),
  deployed via `backend/deploy.sh`. See `backend/README.md`.
- **`admin/`** — local-only Vite/React dashboard for CRUD. `npm run dev`. See
  `admin/README.md`.
- The mobile app fetches from the API, **caches to AsyncStorage**, and keeps the
  bundled `src/data/services.ts` as an **offline fallback** so emergency numbers
  always work with no network. Live data wins when available.

## Data / scope model

Services are tagged `national` (shown everywhere) or state-scoped (e.g. `MH` for
Maharashtra). **Maharashtra is fully populated** using the provided directory;
users in other states still get all pan-India services. Add coverage for any state
from the admin app by setting a service's **scope** (no code changes needed).

## Tech

- **Expo SDK 57** + React Native 0.86, TypeScript.
- `expo-location` — one-time location + reverse geocoding.
- `@react-native-async-storage/async-storage` — local persistence.
- `@expo/vector-icons` (Ionicons) — icons.
- A tiny custom stack navigator (`src/navigation/Nav.tsx`) — no heavy nav deps.

## Project structure

```
App.tsx                     Root: providers + screen router
src/
  config.ts                 Public API URL + refresh interval
  theme.ts                  Design tokens (colors, spacing, shadows)
  context/
    AppContext.tsx          Profile + location state, persisted locally
    DataContext.tsx         Live data: API fetch + AsyncStorage cache + fallback
  navigation/Nav.tsx        Minimal stack navigator (+ Android back button)
  data/
    services.ts             Types + bundled fallback/seed data
    logic.ts                Pure query helpers (filter by state, search)
    api.ts                  Backend client (GET /bootstrap)
    states.ts               Indian states/UTs + geocode matching
  utils/actions.ts          tel: dialing, link opening, number formatting
  components/                CallButton, Header
  screens/                   Welcome, Location, Signup, Home, Category,
                             ServiceDetail, Profile

backend/                    Serverless API (Lambda + DynamoDB + API Gateway)
admin/                      Local-only Vite/React admin dashboard
```

## Run it

```bash
npm install          # if not already done
npx expo start       # then scan the QR with Expo Go, or press a / i
```

- Android: press `a` (emulator) or scan the QR in **Expo Go**.
- iOS: press `i` (simulator) or scan in the Camera / Expo Go app.

> Note: `tel:` calling and real GPS work best on a **physical device**.
> Simulators may not place calls.

## Type check / bundle validation

```bash
npx tsc --noEmit                          # types
npx expo export --platform android        # verify the JS bundle builds
```

## Disclaimer

SevaApp is an information directory. Helpline numbers and links are provided for
convenience and availability may vary by area. **In a life-threatening emergency,
always dial 112.**
