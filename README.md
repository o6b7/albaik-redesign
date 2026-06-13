# Al Baik Delivery — Redesign Concept

An unofficial redesign and learning project built with React Native + Expo. Not affiliated with or endorsed by Al Baik. Built for personal learning purposes only.

---

## What it is

A full-stack mobile delivery app with three distinct role portals — customer, kitchen, and driver — all synced in real time through Firestore. The core loop: a customer places an order, the kitchen accepts and marks food ready, a driver claims the delivery and follows a road-accurate route to the customer's door, and the customer watches the driver move on a live map.

---

## Architecture

```
┌──────────────┐    Firestore    ┌──────────────────┐    Firestore    ┌─────────────┐
│   Customer   │ ──────────────▶ │  orders collection│ ◀────────────── │  Restaurant │
│   Portal     │                 │                  │                  │   Portal    │
│              │ ◀────────────── │  status machine: │ ──────────────▶ │             │
│  (tabs)      │   live listener │  pending →       │   live listener │ (restaurant)│
└──────────────┘                 │  confirmed →     │                  └─────────────┘
                                 │  ready →         │
┌──────────────┐                 │  picked_up →     │
│    Driver    │ ──────────────▶ │  delivered       │
│   Portal     │                 └──────────────────┘
│              │ ◀──────────────────────────────────
│  (driver)    │   live listener
└──────────────┘
```

Role isolation is enforced at the routing level: each role is confined to its own navigator group — `(tabs)` for customers, `(driver)` for drivers, `(restaurant)` for kitchen staff.

---

## Tech stack

| Layer | Library |
|---|---|
| Framework | Expo 54 + React Native 0.81 |
| Routing | expo-router (file-based) |
| Styling | NativeWind 4 (Tailwind CSS for RN) |
| State | Zustand 5 |
| Backend | Firebase Firestore (real-time listeners) |
| Auth | Firebase Auth (email/password) |
| Maps | Mapbox (`@rnmapbox/maps`) |
| Routing data | OSRM (road-following polyline) |
| Animation | Reanimated 4 + Worklets |
| Bottom sheet | `@gorhom/bottom-sheet` |
| Icons | `lucide-react-native` |

---

## Three-role flow

### Customer
- Browse menu (featured meals + sides), filter by category, search
- Saved meals persisted per user in Firestore
- Cart with toppings, quantity control, flying-item add-to-cart animation
- Checkout: address + payment method selection, VAT breakdown
- Order tracking: live status updates, real-time driver map with road-following route
- Order history

### Restaurant (kitchen)
- Live order queue: incoming → in-progress → ready
- Tap to confirm, then mark food ready when packed
- Order details with full item/topping breakdown

### Driver
- Available order feed: shows earnings, distance, pickup and dropoff address, food-ready indicator
- Transactional claiming (race-safe — first driver to accept wins via Firestore transaction)
- Live delivery map with OSRM polyline and distance-weighted marker animation
- Delivery history and earnings summary (⃁)

---

## Setup

### Prerequisites

- Node 18+
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Xcode) or Android Emulator

### 1. Clone and install

```bash
git clone <repo-url>
cd redesign-albaik
npm install
```

### 2. Firebase

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Email/Password** authentication
3. Create a **Firestore** database
4. Copy `.env.example` to `.env` and fill in your project config:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

> Firebase config keys are safe to include in client apps by design. They are rate-limited and restricted by Firestore security rules — not secret credentials.

### 3. Seed Firestore data

The menu lives in two collections: `meals` (featured) and `more` (sides). Each document needs at minimum:

```json
{
  "name": "Big Baik",
  "description": "The classic",
  "price": "14.00",
  "currency": "SAR",
  "category": "Meals",
  "image": "<cdn-url>",
  "bgColor": "#8A151B",
  "rating": 4.8,
  "reviews": 1200
}
```

### 4. Demo accounts

Create these users in Firebase Auth, then add a matching doc in the `users` Firestore collection (doc ID = Firebase UID) with a `role` field:

| Role | Suggested email | Password | `role` value |
|---|---|---|---|
| Customer | customer@demo.com | demo1234 | `customer` |
| Kitchen | kitchen@demo.com | demo1234 | `restaurant` |
| Driver | driver@demo.com | demo1234 | `driver` |

The app reads the role on login and routes each user to their portal automatically.

### 5. Run

```bash
npx expo start
```

Press `i` for iOS Simulator, `a` for Android Emulator.

---

## Technical highlights

- **Real-time order sync** — Firestore `onSnapshot` listeners keep all three portals in sync with no polling. Status changes propagate within ~200ms across devices.
- **Race-safe driver claiming** — order acceptance runs inside a Firestore transaction: if two drivers tap simultaneously, exactly one wins and the other receives a clear error.
- **Road-following delivery map** — the route is fetched from OSRM and rendered as a GeoJSON polyline on a Mapbox map. The driver marker is interpolated along polyline segments weighted by cumulative distance, so it follows the road rather than flying straight-line.
- **Parallel kitchen/driver state machine** — kitchen and driver progress independently (food can be ready before the driver arrives, or the driver can arrive early) and both states are visible to the driver in real time.
- **Flying cart animation** — adding a meal triggers a Reanimated animation that launches the meal image from its measured card position to the cart tab icon.

---

## Simulated / demo limitations

This is a learning project. Several things are intentionally simplified:

| Feature | Demo behaviour | Production path |
|---|---|---|
| Driver GPS | Animated simulation along the OSRM route | `expo-location` with background tracking |
| Payments | Card details stored in Firestore, no processor | Stripe SDK |
| Restaurant | Single hardcoded location and destination | Multi-restaurant with geolocation |
| Push notifications | None | `expo-notifications` |

---

## License

MIT. Unofficial concept — not affiliated with Al Baik Establishment for Broasted Chicken.
