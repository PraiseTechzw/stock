# Deploying to Play Store

This guide outlines the steps to build and release **PraiseTech Stock Hub** to the Google Play Store.

## 1. Prerequisites
- An [Expo (EAS) Account](https://expo.dev/)
- A [Google Play Console](https://play.google.com/console/) developer account.
- EAS CLI installed: `npm install -g eas-cli`

## 2. Configuration Check
Ensure the following are correct in `app.json`:
- `expo.name`: "PraiseTech Stock Hub"
- `expo.android.package`: "com.praisetechzw.stockhub"
- `expo.version`: Current version (e.g., "1.0.0")

## 3. Building for Production

### To generate an APK for manual testing:
```bash
npm run build:apk
```
*This produces a direct download link for an `.apk` file.*

### To generate an AAB (App Bundle) for Play Store:
```bash
npm run build:prod
```
*This produces an `.aab` file which is required for the Play Store.*

## 4. Submitting to Google Play
Once your production build is finished on EAS:

1. Go to your [Expo Dashboard](https://expo.dev/).
2. Download the `.aab` file from your latest production build.
3. Log in to [Google Play Console](https://play.google.com/console/).
4. Create a new app (if it's the first time).
5. Go to **Production** > **Create new release**.
6. Upload the `.aab` file.
7. Fill in the release notes and save.

## 5. Over-the-Air (OTA) Updates
You can push small bug fixes and UI updates without a new store submission:
```bash
npx eas update --branch production --message "Fixed UI headers"
```

## 6. Icon & Splash Assets
The following assets are already optimized in `/assets/images/`:
- `icon.png`: Main app icon.
- `adaptive-icon.png`: Android-specific adaptive icon.
- `splash-icon.png`: Launch screen logo.
