# Mobile release preparation

App name: `Diving Ecology Education Frosta`

Provisional application ID: `no.divingecologyfrosta.app`

Release version:

- Marketing version: `0.1.0`
- Android `versionCode`: `1`
- iOS build number: `1`

The application ID must be confirmed before registering the app in Google Play
Console or App Store Connect. Changing it after publication creates a different app.

## Staging

Use a separate Supabase project and these build variables:

```text
VITE_APP_ENV=staging
VITE_DEMO_MODE=false
VITE_SUPABASE_URL=https://<staging-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<staging-anon-key>
ENABLE_DEMO_API=false
```

Never use the service-role key in a mobile or web build.

## Generate native projects

```bash
npm install
npm run build
npx cap add android
npx cap add ios
npm run mobile:sync
```

Native icon and splash assets are generated from `resources/icon.png` and
`resources/splash.png`. Re-export the platform sizes whenever either master
asset changes.

Android can be built on Windows after Android Studio, JDK and an Android SDK are
installed. iOS signing and App Store archives require macOS with Xcode.

## Store descriptions

Short description:

`Member, volunteering and administration app for Diving Ecology Education Frosta.`

Long description:

`Diving Ecology Education Frosta supports marine education, fjord awareness,
volunteering, events, membership administration and transparent community
project documentation. The app gives approved users access to membership
information, activities, documents, payments and multilingual communication.`

## Release gates

- Complete the staging Supabase migration and RLS tests.
- Replace all demo API workflows with authenticated Supabase operations.
- Verify privacy-policy and account-deletion URLs.
- Test phone and tablet layouts on real Android and iOS devices.
- Create signed Android App Bundle and iOS archive.
- Complete Play Data safety and App Store privacy declarations.
