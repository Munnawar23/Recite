# API Documentation & Endpoint Reference

This document provides a comprehensive technical overview of all API and CDN integration endpoints in the **Recite** application, including total endpoint counts, base URLs, invoking screens/components, underlying custom hooks, source code files, data mapping rules, and React Query cache parameters (`staleTime` & `gcTime`).

---

## 1. Overview & Statistics

- **Total Network API & CDN Endpoints**: `4` active network endpoints (3 Quran.com REST endpoints + 1 Islamic Network Audio CDN endpoint).
- **Offline / Static Chapter Architecture**:
  - The 114 Surahs list (`/chapters`) has been migrated from a remote network API call to **bundled offline static constants** (`src/constants/chapters.ts`).
  - Chapter lists and localized names are loaded synchronously with 0ms latency via `getChapters(language)`.
  - Offline fuzzy searching and debouncing are executed on device via `useChapterSearch` using `Fuse.js`.
- **Primary API Providers**:
  1. **Quran.com API v4**: `https://api.quran.com/api/v4` (configured in `src/config/env.ts` / `src/lib/api/client.ts`)
  2. **Islamic Network Audio CDN**: `https://cdn.islamic.network/quran/audio-surah` (configured in `src/config/env.ts` / `src/lib/api/surah-cdn-audio.ts`)
- **Architecture Principle**: Each network endpoint is isolated into its own dedicated file under `src/lib/api/`. API functions map raw backend response DTOs directly into clean domain models (`SurahVerse`, audio stream URLs, daily verse models) before returning data to hooks and components.
- **Global Query Cache Config (`src/app/_layout.tsx`)**:
  - Default `staleTime`: `30 minutes` (`1000 * 60 * 30`)
  - Default `gcTime`: `24 hours` (`1000 * 60 * 60 * 24`)

---

## 2. API & CDN Endpoints Summary Matrix

| # | Endpoint / CDN Resource | Protocol / Method | Example Request URL | Calling Screen(s) / Component(s) | Custom Hook | Source File | `staleTime` | `gcTime` |
|---|---|---|---|---|---|---|---|---|
| **1** | **Get Verses by Chapter** | `GET` (REST) | `https://api.quran.com/api/v4/verses/by_chapter/1?language=en&translations=20&fields=text_uthmani&per_page=300` | `QuranDetailScreen` | `useQuranDetailScreen`<br>`useActiveQuranDetail` | `src/lib/api/chapter-verses.ts` | `24 hours` | `7 days` |
| **2** | **Get Arabic Chapter Audio & Timestamps** | `GET` (REST) | `https://api.quran.com/api/v4/chapter_recitations/7/1?segments=true` | `QuranDetailScreen`, `AudioPlayerModal` | `useQuranAudio`<br>`useChapterAudio` | `src/lib/api/chapter-audio.ts` | `24 hours` | `Infinity` / `7 days` |
| **3** | **Surah Audio CDN Stream (English Recitation)** | `GET` (CDN Stream) | `https://cdn.islamic.network/quran/audio-surah/128/en.misharyrashidalafasyenglishtranslationsaheehibrahimwalk/1.mp3` | `AudioPlayerModal` | `useChapterAudio`<br>`usePlayerModal` | `src/lib/api/surah-cdn-audio.ts` | Static Stream URL (N/A) | Static Stream URL (N/A) |
| **4** | **Get Random Daily Verse** | `GET` (REST) | `https://api.quran.com/api/v4/verses/random?language=en&translations=20&fields=text_uthmani` | `HomeScreen` (`DailyVerseCard`) | `useDailyVerse` | `src/lib/api/daily-verse.ts` | `24 hours` (1 day) | `7 days` |

> **Note on Chapters List (`getChapters`)**: The Surah catalogue (Surah 1 to 114) is bundled as a static dataset in `src/constants/chapters.ts` and `src/constants/surahNames.ts`. No network request is issued when browsing or searching chapters in `QuranScreen`, `LibraryScreen`, or `HomeScreen`.

---

## 3. Detailed Endpoint & CDN Specifications

### 1. Get Verses by Chapter (`/verses/by_chapter/{id}`)
- **Provider**: Quran.com API v4
- **Base URL**: `https://api.quran.com/api/v4`
- **Example Endpoint URL**: `https://api.quran.com/api/v4/verses/by_chapter/114?language=en&translations=20&fields=text_uthmani&per_page=300`
- **API Source File**: `src/lib/api/chapter-verses.ts` (`getVersesByChapter`)
- **Custom Hooks**:
  - `useActiveQuranDetail(type, id, translationId)` in `src/features/quran-detail/hooks/useQuranDetail.ts`
  - `useSurahDetail(chapterId, translationId)` in `src/features/quran-detail/hooks/useQuranDetail.ts`
  - Consumed by `useQuranDetailScreen()` in `src/features/quran-detail/hooks/useQuranDetailScreen.ts`
- **Calling Screens**:
  - `QuranDetailScreen` (`src/features/quran-detail/screens/QuranDetailScreen.tsx`)
- **Data Mapping**:
  - Extracts `v.text_uthmani` for pristine Uthmani Arabic script.
  - Cleans `v.translations` by stripping `<sup>` footnote markers, leftover footnote labels, and orphan digits to provide clean, publication-grade translation text (`SurahVerse`).
- **Cache Policy**:
  - `staleTime`: `86,400,000 ms` (24 hours)
  - `gcTime`: `604,800,000 ms` (7 days in AsyncStorage persistence)

---

### 2. Get Arabic Chapter Audio & Verse Timestamps (`/chapter_recitations/{reciterId}/{chapterId}`)
- **Provider**: Quran.com API v4
- **Base URL**: `https://api.quran.com/api/v4`
- **Example Endpoint URL**: `https://api.quran.com/api/v4/chapter_recitations/7/1?segments=true`
- **API Source File**: `src/lib/api/chapter-audio.ts` (`getChapterAudio`)
- **Custom Hooks**:
  - `useQuranAudio(chapterId, enabled, metadataOptions)` in `src/features/quran-detail/hooks/useQuranAudio.ts`
  - `useChapterAudio(options)` in `src/features/quran-audio/hooks/useChapterAudio.ts`
- **Calling Components / Screens**:
  - `QuranDetailScreen` (`src/features/quran-detail/screens/QuranDetailScreen.tsx`)
  - `AudioPlayerModal` (`src/features/quran-audio/components/AudioPlayerModal.tsx`)
- **Data Mapping**:
  - Returns raw `audio_file` containing the remote CDN audio URL (`audio_url`).
  - Returns verse-by-verse timestamps array (`timestamps` with `timestamp_from`, `timestamp_to`, and `verse_key`) enabling synchronized verse highlighting in `QuranDetailScreen`.
- **Cache Policy**:
  - `staleTime`: `86,400,000 ms` (24 hours)
  - `gcTime`: `Infinity` (persists indefinitely for instant playback resumption)

---

### 3. Surah Audio CDN Stream (Islamic Network CDN)
- **Provider**: Islamic Network CDN
- **Base URL**: `https://cdn.islamic.network/quran/audio-surah` (defined in `ENV.ISLAMIC_NETWORK_CDN_URL`)
- **Example CDN Audio URL**: `https://cdn.islamic.network/quran/audio-surah/128/en.misharyrashidalafasyenglishtranslationsaheehibrahimwalk/1.mp3`
- **URL Builder Source File**: `src/lib/api/surah-cdn-audio.ts` (`getSurahCdnAudioUrl`)
- **Custom Hooks**:
  - `useChapterAudio()` in `src/features/quran-audio/hooks/useChapterAudio.ts`
  - `usePlayerModal()` in `src/features/quran-audio/hooks/usePlayerModal.ts`
- **Calling Components / Screens**:
  - Full-screen `AudioPlayerModal` (`src/features/quran-audio/components/AudioPlayerModal.tsx`)
- **Format Specifications**:
  - Path pattern: `${baseUrl}/${bitrate}/${edition}/${surahNumber}.mp3`
  - Default bitrate: `128` kbps (high-fidelity streaming)
  - Default edition: `en.misharyrashidalafasyenglishtranslationsaheehibrahimwalk` (Mishary Rashid Alafasy recitation paired with Saheeh International English translation narrated by Ibrahim Walk).
- **Cache Policy**:
  - CDN stream audio URL generated deterministically; cached on-device via `expo-audio` buffer and native media pipeline.

---

### 4. Get Random Daily Verse (`/verses/random`)
- **Provider**: Quran.com API v4
- **Base URL**: `https://api.quran.com/api/v4`
- **Example Endpoint URL**:
  - Single language: `https://api.quran.com/api/v4/verses/random?language=en&translations=20&fields=text_uthmani`
  - Multi-language prefetch: `https://api.quran.com/api/v4/verses/random?translations=20,131,85,84,17&fields=text_uthmani`
- **API Source File**: `src/lib/api/daily-verse.ts` (`getRandomVerse`, `getRandomVerseWithAllTranslations`)
- **Custom Hook**: `useDailyVerse()` in `src/features/home/hooks/useDailyVerse.ts`
- **Calling Screens**:
  - `HomeScreen` (`src/features/home/screens/HomeScreen.tsx` → `DailyVerseCard`)
- **Data Mapping**:
  - Returns `verse.text_uthmani` for Arabic scripture.
  - Sanitizes translation text removing footnote HTML and formatting tags.
  - Outputs formatted `source` label (`"Surah X:Y"`).
- **Cache Policy**:
  - `staleTime`: `86,400,000 ms` (24 hours)
  - `gcTime`: `604,800,000 ms` (7 days)

---

## 4. Offline Architecture Reference

| Data Category | Implementation | Storage / Source Location | Network Dependency |
|---|---|---|---|
| **Chapters List (1-114)** | Bundled Static Constant | `src/constants/chapters.ts`<br>`src/constants/surahNames.ts` | **None** (100% offline, 0ms load) |
| **Search & Filtering** | Offline Fuse.js | `src/features/quran/hooks/useChapterSearch.ts` | **None** (Client-side memory) |
| **Prayer Times** | Adhan Calculation Engine | `adhan` package + device coordinates (`src/services/prayerTimesService.ts`) | **None** (Calculated locally) |
| **Downloaded Surahs** | File System Cache | `src/services/downloadService.ts`<br>`expo-file-system` | **Offline** once downloaded |
