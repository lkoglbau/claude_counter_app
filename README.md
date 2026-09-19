# Days Since

Eine bewusst minimalistische App (React Native + Expo, TypeScript für iOS, Android
und Web), die die Tage seit dem Aufhören einer schlechten Gewohnheit hochzählt.
Ausrutscher („Slips“) lassen sich dokumentieren und setzen die laufende Streak neu.
Jeder Nutzer meldet sich per E-Mail/Passwort an und sieht nur seine eigenen Counter.

## Entwicklung starten

```bash
npm install
cp .env.example .env  # Supabase-URL und Anon-Key eintragen
npx expo start        # dann i für iOS-Simulator, w für Web, oder Expo Go / Dev Client
npx tsc --noEmit      # Typecheck
```

Ohne `.env` (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`) startet die App
nicht – im Web zeigt sich das als weißer Bildschirm.

Alle verwendeten Libraries laufen in **Expo Go** – kein Custom Dev Client nötig,
solange nur an der JS-Ebene entwickelt wird.

## Wichtige Entscheidungen

| Bereich | Wahl | Warum |
|---|---|---|
| Navigation | **expo-router** | Aktueller Expo-Standard, dateibasiert, native Modal-Präsentation für die Add/Edit-Screens. |
| Datum | **date-fns** (`differenceInCalendarDays`) | Vergleicht Kalendertage, nicht 24h-Spannen → immun gegen Zeitzonen/DST und Uhrzeit. |
| Speicherung | **Supabase** (Postgres) | Tabellen `counters` und `slips`, Row Level Security pro Nutzer. Der gesamte Zugriff ist in `src/store/countersRepo.ts` gekapselt. |
| Authentifizierung | **Supabase Auth** (E-Mail/Passwort) | Login-Gate in `app/_layout.tsx`, Session wird auf Native per AsyncStorage gehalten. |
| Gesten / Animation | **react-native-gesture-handler** (`ReanimatedSwipeable`) + **react-native-reanimated** | Swipe-to-delete + flüssige Listen-Übergänge. |
| State | React Context (`CountersProvider`) | Eine Entität – kein State-Management-Paket nötig. |

## Struktur

```
app/                      expo-router Routen
  _layout.tsx             Root-Stack, Auth-Gate, Provider, Splash, Theme
  login.tsx               Anmeldung / Registrierung
  index.tsx               Hauptbildschirm: Large-Title-Header, Counter-Liste + "+"
  counter/new.tsx         Modal: anlegen
  counter/[id].tsx        Modal: Verlauf (Timeline), Ausrutscher, bearbeiten / löschen
src/
  components/             CounterCard, SwipeableRow, CounterForm, StreakTimeline, SlipSheet, DateField, …
  hooks/                  useCounters (CRUD + Ausrutscher), useDaysSince (Live-Neuberechnung)
  services/               supabaseClient
  store/                  AuthProvider, CountersProvider (Context), countersRepo (Persistenz-Boundary)
  theme/                  palette (kuratierte Counter-Farben), tokens, useTheme
  types/                  Counter-Datenmodell + Runtime-Guard
  utils/                  date, timeline (Streak-Logik, Validierung), confirm (Web-tauglicher Dialog), id
```

## Datenmodell

```ts
type Counter = {
  id: string;
  name: string;
  startDate: string;   // YYYY-MM-DD (immer ohne Uhrzeit gespeichert)
  colorId: CounterColorId; // Referenz in die Palette, nicht Roh-Hex
  createdAt: string;   // ISO-DateTime
  updatedAt: string;   // ISO-DateTime
  slips: Slip[];       // "Ausrutscher", aufsteigend nach Datum; Tabelle `slips` in Supabase
};

type Slip = { id: string; date: string; note?: string; createdAt: string };
```

## Web-Version & Deployment

Die Web-Version ist ein statischer Export (`npx expo export --platform web` → `dist/`),
gehostet auf Vercel (`vercel.json`). Ein Push auf `master` löst ein Production-Deployment
aus, andere Branches erzeugen Preview-Deployments. Die `EXPO_PUBLIC_*`-Variablen werden
beim Build eingebettet und müssen in Vercel für **Production und Preview** gesetzt sein.

Auf Web gelten Besonderheiten: `Alert.alert` und der native Datepicker funktionieren dort
nicht – dafür gibt es `src/utils/confirm.ts` bzw. ein natives `<input type="date">` in
`DateField`.

Releases sind als Git-Tags markiert: `v1.0` (Login & Authentifizierung),
`v2.0` (Bugfixes & Ausrutscher).

## App-Store-Vorbereitung

- `app.config.ts` – Name, Slug, `ios.bundleIdentifier`, `version`, `ios.buildNumber`,
  Icons, Splash (via `expo-splash-screen`-Plugin).
- `eas.json` – Build-Profile `development` / `preview` / `production`.
- Icons/Splash liegen unter `assets/` – vor der Einreichung durch finale Assets ersetzen.

Ein Produktions-Build läuft dann über `eas build --platform ios --profile production`.
