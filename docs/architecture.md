# Project Architecture

This document explains how the **Recite** codebase is structured and how data flows in the application.

---

## 1. Directory Structure

Recite uses a **feature-based structure** inside the `src/` directory:

```text
src/
├── app/                  # Expo Router pages and navigation layout
├── config/               # Environment variables and app configuration
├── features/             # Core application features
│   ├── home/             # Home screen, daily verse cards
│   ├── quran/            # Surah list, search, reciter selection
│   ├── quran-detail/     # Verse reading, audio playback, highlighting
│   └── library/          # Bookmarks, saved verses, audio player
├── hooks/                # Global custom React hooks
├── lib/                  # External services and API clients
│   └── api/              # Quran.com API integrations
├── types/                # Shared TypeScript interfaces & models
└── utils/                # Helper functions (formatting, date tools)
```

---

## 2. Data Flow & State Management

- **API & Caching**: We use **React Query (`@tanstack/react-query`)** for all server requests. API responses are cached locally to reduce network usage.
- **Offline Search**: Surah search is handled completely offline using **Fuse.js** for fast, fuzzy matching.
- **Local Storage**: App settings, user bookmarks, and reading history are stored on the device using **AsyncStorage**.

---

## 3. Audio Engine Architecture

- **Playback**: Managed using **Expo Audio** (`expo-audio`).
- **Verse Syncing**: Audio timestamps from Quran.com API are mapped with current playback position to highlight the active verse in real time.
