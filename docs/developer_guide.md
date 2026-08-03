# Developer Guide: Environment Variables & Running the App

This guide explains how to set up environment variables and run **Recite** locally.

---

## 1. Environment Variables Setup

Expo requires environment variables to start with `EXPO_PUBLIC_` so they are accessible in application code.

### Step 1: Create your `.env` file
Copy `.env.example` to create `.env` in the root folder:

```bash
cp .env.example .env
```

### Step 2: Configure variables
Inside `.env`, set your API URL:

```env
EXPO_PUBLIC_QURAN_API_URL=https://api.quran.com/api/v4
```

> **Note**: If `EXPO_PUBLIC_QURAN_API_URL` is not set, the app defaults to `https://api.quran.com/api/v4` (see `src/config/env.ts`).

---

## 2. Running the App locally

### Step 1: Install dependencies
```bash
yarn install
# or npm install
```

### Step 2: Start Expo dev server
```bash
npx expo start
```
- Press **`a`** to open in Android Emulator.
- Press **`i`** to open in iOS Simulator.
- Scan the QR code with **Expo Go** on your phone.

---

## 3. Running Native Development Builds

If you are modifying native code or building release binaries:

- **Android App**:
  ```bash
  npx expo run:android
  ```
- **iOS App**:
  ```bash
  npx expo run:ios
  ```

---

## 4. Building Production Release Packages

Run the pre-configured scripts from `package.json`:

- **Build APK (Android)**:
  ```bash
  npm run create-apk
  ```
- **Build AAB (Google Play Store)**:
  ```bash
  npm run create-aab
  ```
