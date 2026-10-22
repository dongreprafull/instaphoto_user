# Instant Photo — User app

Location-based photographer booking app (Ola/Uber-style search & assign), user side. React + TypeScript, packaged for Android with Capacitor.

## Status

UI-only pass — all four screens are built and wired together with mock data (`src/mock/data.ts`). No backend calls yet; `Search.tsx`'s "photographer found" transition is a 2.6s `setTimeout` standing in for the real search/assign flow.

## Screens (`src/screens/`)

1. **Home** — package selection, "Find photographer near me"
2. **Search** — 5 km radius search, radar animation, 30s timeout framing
3. **Payment** — photographer card, order summary (price + 18% GST), pay CTA
4. **Confirmed** — success state, photographer contact, booking details, status stepper

## Next (backend wiring)

Replace the mock data / timers with real calls once the PHP API is up:

- `GET /packages/list.php` → `src/mock/data.ts`'s `packages`
- `POST /photographers/nearby.php` (5 km radius, online + approved only) → drives `Search.tsx`
- Realtime accept/assign status → Firebase Realtime DB listener or polling, replacing the `setTimeout` in `Search.tsx`
- `POST /bookings/create.php` + Razorpay order → `Payment.tsx`'s `onPay`
- Mobile OTP login (Firebase Phone Auth) — not yet built; add before `Home` in the navigation stack

## Dev

```bash
npm install
npm run dev        # http://localhost:5173
npm run build       # type-checks + builds to dist/
npm run cap:sync    # sync web build into the Capacitor Android shell
npm run cap:android # open the Android project in Android Studio
```

> Note: dependencies couldn't be installed from this environment (registry access is blocked here), so the build hasn't been verified by a real `tsc`/`vite build` run yet — please run `npm install && npm run build` locally before relying on it.
