# Auth-Setup: manuelle Schritte

Diese Schritte lassen sich nicht aus dem Code erledigen. Ohne sie funktionieren Google-Login, E-Mail-Bestätigung und Passwort-Reset nicht.

`<project-ref>` ist die Supabase-Projekt-Ref (steht in `.mcp.json` bzw. in `EXPO_PUBLIC_SUPABASE_URL`). `<prod-domain>` ist die Vercel-Production-Domain.

## 1. Google Cloud Console

- [ ] **APIs & Services → OAuth consent screen**: App-Name „Days Since“, Support-E-Mail, Scopes `email`, `profile`, `openid`. Veröffentlichen (sonst können sich nur eingetragene Testnutzer anmelden).
- [ ] **APIs & Services → Credentials → Create credentials → OAuth client ID**
  - Typ: **Web application**
  - Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
  - Client-ID und Client-Secret notieren.

Die App leitet immer über Supabase um. Deshalb reicht ein Web-Client auch für iOS/Android.

## 2. Supabase → Authentication → Sign In / Providers

- [ ] **Google**: aktivieren, Client-ID und Secret eintragen.
- [ ] **Email**: „Confirm email“ aktivieren.
- [ ] **Email → Minimum password length**: prüfen. Die App validiert clientseitig mit **6** Zeichen (`MIN_PASSWORD_LENGTH` in `src/utils/authValidation.ts`). Bei einem anderen Wert dort anpassen.

## 3. Supabase → Authentication → URL Configuration

- [ ] **Site URL**: `https://<prod-domain>`
- [ ] **Redirect URLs** (alle hinzufügen):
  - `https://<prod-domain>/**`
  - `https://*-<vercel-team-slug>.vercel.app/**` (Preview-Deployments)
  - `http://localhost:8081/**` (lokales Web)
  - `dayssince://**` (iOS/Android-Build, Scheme aus `app.config.ts`)
  - `exp://**` (nur für Expo Go; Google-Login braucht aber einen Dev-Build, siehe unten)

Fehlt eine URL, leitet Supabase stillschweigend auf die Site URL um. Das Symptom: Man landet nach Google oder dem Mail-Link auf Production statt auf localhost bzw. der Preview.

## 4. Supabase → Authentication → Email Templates (Deutsch)

Die Links müssen `{{ .ConfirmationURL }}` verwenden. Das enthält den PKCE-Code, den `app/auth/callback.tsx` bzw. `app/reset-password.tsx` einlösen.

**Confirm signup**

- Betreff: `Bestätige deine E-Mail für Days Since`
- Text:

```html
<h2>Willkommen bei Days Since</h2>
<p>Tippe auf den Button, um deine E-Mail-Adresse zu bestätigen und dein Konto zu aktivieren.</p>
<p><a href="{{ .ConfirmationURL }}">E-Mail bestätigen</a></p>
<p>Wenn du dich nicht registriert hast, kannst du diese E-Mail ignorieren.</p>
```

**Reset password**

- Betreff: `Neues Passwort für Days Since`
- Text:

```html
<h2>Passwort zurücksetzen</h2>
<p>Du hast ein neues Passwort angefordert. Tippe auf den Button, um es festzulegen.</p>
<p><a href="{{ .ConfirmationURL }}">Neues Passwort festlegen</a></p>
<p>Wenn du das nicht warst, ignoriere diese E-Mail. Dein Passwort bleibt unverändert.</p>
```

## 5. SMTP (für Produktion)

Der eingebaute Supabase-Mailer ist nur für Tests gedacht. Er erlaubt sehr wenige Mails pro Stunde, und die Nutzer bekommen dann „Zu viele Versuche“. Für Produktion unter **Project Settings → Authentication → SMTP Settings** einen eigenen Anbieter eintragen (z. B. Resend: Domain verifizieren, SMTP-Zugangsdaten übernehmen) und danach das Rate-Limit unter **Authentication → Rate Limits** anheben.

## 6. Hinweise zum Testen

- **Google auf iOS/Android** braucht einen Dev-Build (`eas build --profile development` bzw. `npx expo run:ios`). In Expo Go zeigt der Redirect auf `exp://…`, und das Scheme `dayssince://` ist nicht registriert.
- **Bestätigungs- und Reset-Links** müssen auf demselben Gerät bzw. im selben Browser geöffnet werden, auf dem sie angefordert wurden. Dort liegt der PKCE-Verifier. Sonst meldet die App „Link abgelaufen …“. Bei der Bestätigung ist die E-Mail trotzdem bestätigt, und ein normaler Login funktioniert.
- **Vercel**: `EXPO_PUBLIC_SUPABASE_URL` und `EXPO_PUBLIC_SUPABASE_ANON_KEY` müssen für Production **und** Preview gesetzt sein.
