# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

"Days Since": an Expo (React Native + TypeScript, expo-router) app that counts the days since quitting a habit, with optional "Ausrutscher" (slips) that restart the running streak. Runs on iOS/Android and as a static web export deployed on Vercel. UI copy is German.

## Commands

```bash
npm install
npm start                      # expo start (i = iOS simulator, w = web)
npm run web                    # web dev server
npx tsc --noEmit               # typecheck — the only automated check; there is no test runner or linter configured
npx expo export --platform web # what Vercel runs (vercel.json → dist/); good "does it bundle" check
```

Needs a `.env` (copy `.env.example`): `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`. `src/services/supabaseClient.ts` throws at import if they are missing, which shows up as a blank white screen.

## Architecture

- **Routing** (`app/`): `_layout.tsx` is an auth gate — without a session it renders `login.tsx` instead of the `Stack`; with one it wraps the stack in `CountersProvider`. `counter/[id].tsx` is the detail/edit modal (streak timeline + edit form + slip sheet); `counter/new.tsx` is the create modal.
- **State**: a single React context, `src/store/CountersProvider.tsx`, holds `counters` (each with its `slips`). All Supabase access is confined to `src/store/countersRepo.ts` (row ↔ domain mapping lives there: snake_case rows, camelCase `Counter`/`Slip`). Screens use `useCounters()`.
- **Write semantics differ on purpose**: `addCounter`/`updateCounter` are optimistic (local first, Supabase in the background). `removeCounter` and all slip mutations are async and persist first, then update local state, and reject on failure — callers (`SwipeableRow`, the detail screen) await them and show errors.
- **Persistence** is Supabase. Tables `counters` and `slips` (`slips.counter_id` → `counters.id`, `on delete cascade`), both with per-user RLS on `user_id = auth.uid()`. Project ref is in `.mcp.json`.
- **Streak logic**: `src/utils/timeline.ts` (`lastEventDate`, `buildTimeline`, `validateSlipDate`) on top of `src/utils/date.ts`. Dates are plain `YYYY-MM-DD` strings and all day math goes through `differenceInCalendarDays` — never subtract `Date`s. A counter's day count runs from its last slip, else `startDate` (`startDate` itself never changes).
- **Theming**: `src/theme/tokens.ts` (app colors, spacing, typography) and `palette.ts` (per-counter `colorId` → light/dark swatch; the DB has a CHECK constraint on `color_id`, so adding a color needs a migration). Use `useTheme()`; the app follows the OS scheme. The look is neutral black/grey: `tint` is near-white (dark) / near-black (light), so never put `tint`-colored text on a `tint` fill and use `controlAccent` for system controls. `destructive` is a muted red for text/icons on `destructiveSoft`, never a loud fill. Buttons are pills via `PrimaryButton` (`primary` / `secondary` / `destructive`); auth screens use their own `auth*` tokens and `src/components/auth/`, and the home screen reuses their gradient.
- Path alias `@/*` → `src/*`.

## Gotchas

- **Web parity**: react-native-web breaks some native APIs silently. `Alert.alert` is a no-op on web → use `confirmDestructive` / `showError` from `src/utils/confirm.ts`. `@react-native-community/datetimepicker` renders nothing on web → `DateField` uses a native `<input type="date">` there (explicitly styled to match the app font). Check new UI on web, not just native.
- **RLS hides failures**: a Supabase update/delete blocked by RLS returns success with 0 rows. The repo uses `.select('id')` and throws on empty results — keep that pattern for new mutations.
- **New tables need explicit grants**: tables created via migration get no privileges for `authenticated` here, so `select/insert/update/delete` must be granted alongside the RLS policies, or every request fails with "permission denied".
- **Vercel env scope**: `EXPO_PUBLIC_*` values are inlined at build time and are configured per environment. They must exist for both Production and Preview, or the preview deployment is a white screen.
- `claimOrphanCounters` (called from `AuthProvider` on sign-in) assigns legacy rows with `user_id IS NULL` to the first user who signs in.

## Releases

Pushing to `master` triggers a Vercel Production deployment; other branches get a Preview. Releases are marked with annotated tags (`v1.0` = login/auth, `v2.0` = slips + bugfixes). For App Store builds see `app.config.ts` (`version`, `ios.buildNumber`) and `eas.json`; production builds run via `eas build --platform ios --profile production`.
