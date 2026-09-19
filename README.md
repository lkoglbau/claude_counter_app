# Days Since

Eine bewusst minimalistische iOS-App (React Native + Expo, TypeScript), die nichts
anderes tut, als die Tage seit dem Aufhören einer schlechten Gewohnheit
hochzuzählen.

## Entwicklung starten

```bash
npm install
npx expo start        # dann i für iOS-Simulator, oder Expo Go / Dev Client
```

Alle verwendeten Libraries laufen in **Expo Go** – kein Custom Dev Client nötig,
solange nur an der JS-Ebene entwickelt wird.

## Wichtige Entscheidungen

| Bereich | Wahl | Warum |
|---|---|---|
| Navigation | **expo-router** | Aktueller Expo-Standard, dateibasiert, native Modal-Präsentation für die Add/Edit-Screens. |
| Datum | **date-fns** (`differenceInCalendarDays`) | Vergleicht Kalendertage, nicht 24h-Spannen → immun gegen Zeitzonen/DST und Uhrzeit. |
| Speicherung | **expo-sqlite/kv-store** | Synchrone API (kein Hydration-Flackern), SQLite-gestützt, übersteht Neustarts zuverlässig, in Expo Go enthalten. Gekapselt in `src/store/countersRepo.ts`. |
| Gesten / Animation | **react-native-gesture-handler** (`ReanimatedSwipeable`) + **react-native-reanimated** | Swipe-to-delete + flüssige Listen-Übergänge. |
| State | React Context (`CountersProvider`) | Eine Entität – kein State-Management-Paket nötig. |

## Struktur

```
app/                      expo-router Routen
  _layout.tsx             Root-Stack, Provider, Splash, Theme
  index.tsx               Hauptbildschirm: Counter-Liste + "+"
  counter/new.tsx         Modal: anlegen
  counter/[id].tsx        Modal: bearbeiten / löschen
src/
  components/             CounterCard, SwipeableRow, CounterForm, ColorPicker, DateField, …
  hooks/                  useCounters (CRUD), useDaysSince (Live-Neuberechnung)
  store/                  CountersProvider (Context), countersRepo (Persistenz-Boundary)
  theme/                  palette (kuratierte Counter-Farben), tokens, useTheme
  types/                  Counter-Datenmodell + Runtime-Guard
  utils/                  date, id
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

## App-Store-Vorbereitung

- `app.config.ts` – Name, Slug, `ios.bundleIdentifier`, `version`, `ios.buildNumber`,
  Icons, Splash (via `expo-splash-screen`-Plugin).
- `eas.json` – Build-Profile `development` / `preview` / `production`.
- Icons/Splash liegen unter `assets/` – vor der Einreichung durch finale Assets ersetzen.

Ein Produktions-Build läuft dann über `eas build --platform ios --profile production`.
