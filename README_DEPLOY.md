# Wdrożenie aplikacji (Deployment)

Aplikacja **Diving Ecology Education Frosta (DEEF)** to aplikacja typu Progressive Web App (PWA) zbudowana na stosie React + Vite, z możliwością podłączenia Supabase.

## Jak zbudować aplikację lokalnie

1. Zainstaluj zależności:
   ```bash
   npm install
   ```

2. Zbuduj produkcyjną wersję aplikacji:
   ```bash
   npm run build
   ```

3. Uruchom produkcyjny serwer:
   ```bash
   npm run start
   ```

## Wymagane zmienne środowiskowe

Przed uruchomieniem lub deploymentem, upewnij się, że dodałeś następujące zmienne środowiskowe (zgodnie z plikiem `.env.example`):

- `VITE_SUPABASE_URL` - Adres URL Twojego projektu Supabase.
- `VITE_SUPABASE_ANON_KEY` - Publiczny klucz ANON Twojego projektu Supabase.

W trybie demonstracyjnym (bez skonfigurowanych zmiennych Supabase), aplikacja korzysta z mock data i działa bez połączenia z bazą danych.

## Jak opublikować na Vercel

1. Zaloguj się do [Vercel](https://vercel.com/) i utwórz nowy projekt importując repozytorium (np. z GitHub).
2. Framework Preset powinien automatycznie ustawić się na **Vite**.
3. Komenda budująca (Build Command): `npm run build`
4. Ścieżka wyjściowa (Output Directory): `dist`
5. Wklej zmienne środowiskowe:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. (Opcjonalnie) Jako, że projekt posiada własny serwer (`server.ts`), jeśli chcesz wspierać tryb Full-Stack, wymagane są funkcje serwerowe, lecz Vercel dobrze współpracuje z czystym Vite dla aplikacji typu Single-Page.
7. Kliknij **Deploy**.

## Jak opublikować na Netlify

1. Zaloguj się w [Netlify](https://www.netlify.com/) i utwórz nowy **Site** z Git.
2. Zdefiniuj **Build command**: `npm run build`
3. Zdefiniuj **Publish directory**: `dist`
4. W zakładce **Environment variables**, dodaj:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Kliknij **Deploy site**.

Dla aplikacji SPA na Netlify, rozważ upewnienie się o obecności reguły rewrites z powrotem na `index.html` (często konfiguruje się ją w public/_redirects: `/* /index.html 200`).

## Jak sprawdzić PWA po publikacji

Po pomyślnym opublikowaniu aplikacji na domenie wspierającej **HTTPS**:

1. Uruchom przeglądarkę na telefonie, komputerze desktopowym (np. w Chrome) i wejdź na opublikowany adres URL.
2. Zobaczysz powiadomienie z możliwością pobrania/zainstalowania aplikacji w obrębie nawigacji.
3. Service Worker automatycznie cache'uje statyczne zasoby. Czuwa nad manifestem oraz obsługą asety (HTML, CSS, JS), omijając wrażliwe dane dzięki ustawieniu `workbox.runtimeCaching: []`.
4. Możesz zweryfikować konfigurację w zakładce **Application -> Manifest** oraz **Service Workers** w Chrome Developer Tools.

## Jak dodać aplikację do ekranu głównego telefonu

### Android
1. Otwórz domenę aplikacji w przeglądarce (np. **Google Chrome**).
2. Wybierz ikonkę menu (trzy kropki) w prawym górnym rogu.
3. Wybierz **Zainstaluj aplikację** (*Install app*) lub **Dodaj do ekranu głównego** (*Add to Home screen*).
4. Potwierdź komunikat na ekranie a aplikacja zostanie przypięta jako ikona.

### iPhone (iOS)
1. Otwórz domenę aplikacji w przeglądarce **Safari**.
2. Kliknij ikonę udostępniania (kwadrat ze strzałką w górę, w menu na dole).
3. Przewiń i wybierz **Dodaj do ekranu początkowego** (*Add to Home Screen*).
4. Kliknij **Dodaj** by zapisać na pulpicie. Aplikacja zadziała w formacie pełnoekranowym bez paska adresu.
