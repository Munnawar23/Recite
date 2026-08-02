# API Documentation & Endpoint Reference

This document provides a comprehensive technical overview of all API integration endpoints in the **Recite** application, including total endpoint counts, base URLs, invoking screens/components, underlying custom hooks, source code files, data mapping rules, and React Query cache parameters (`staleTime` & `gcTime`).

---

## 1. Overview & Statistics

- **Total Network API Endpoints**: `4` unique network endpoints (Surah list searching is handled offline via `useChapterSearch` & `Fuse.js`)
- **Primary API Provider**: [Quran.com API v4](https://api.quran.com/api/v4)
- **Base URL**: `https://api.quran.com/api/v4` (configured in `src/config/env.ts` / `src/lib/api/client.ts`)
- **Architecture Principle**: Each network endpoint is isolated into its own dedicated file under `src/lib/api/`. API functions map raw backend response DTOs directly into clean domain models (`Chapter`, `SurahVerse`) before returning data to hooks and components.
- **Global Query Cache Config (`src/app/_layout.tsx`)**:
  - Default `staleTime`: `30 minutes` (`1000 * 60 * 30`)
  - Default `gcTime`: `24 hours` (`1000 * 60 * 60 * 24`)

---

## 2. API Endpoints Summary Matrix

| # | API Endpoint Name | HTTP Method | Example Endpoint Request URL | Calling Screen(s) / Component(s) | Custom Hook | API Source File | `staleTime` | `gcTime` |
|---|---|---|---|---|---|---|---|---|
| **1** | **Get Chapters List** | `GET` | `https://api.quran.com/api/v4/chapters?language=en` | `QuranScreen`, `LibraryScreen`, `Home` | `useQuranChapters`<br>`useChapterSearch` (Offline) | `src/lib/api/chapters.ts` | `7 days` (1 week) | `7 days` (1 week) |
| **2** | **Get Verses by Chapter** | `GET` | `https://api.quran.com/api/v4/verses/by_chapter/1?language=en&translations=20&fields=text_uthmani&per_page=300` | `QuranDetailScreen` | `useActiveQuranDetail`<br>`useSurahDetail` | `src/lib/api/chapter-verses.ts` | `24 hours` | `7 days` |
| **3** | **Get Chapter Audio & Timestamps** | `GET` | `https://api.quran.com/api/v4/chapter_recitations/7/1?segments=true` | `QuranDetailScreen`, `ReciterList` | `useQuranAudio` | `src/lib/api/chapter-audio.ts` | `24 hours` | `7 days` |
| **4** | **Get Random Daily Verse** | `GET` | `https://api.quran.com/api/v4/verses/random?language=en&translations=20&fields=text_uthmani` | `HomeScreen` (`DailyVerseCard`) | `useDailyVerse` | `src/lib/api/daily-verse.ts` | `24 hours` (1 day) | `7 days` |

---

## 3. Detailed Endpoint Specifications

### 1. Get Chapters List (`/chapters`)
- **Base URL**: `https://api.quran.com/api/v4`
- **Example Endpoint URL**: `https://api.quran.com/api/v4/chapters?language=en`
- **API Source File**: `src/lib/api/chapters.ts` (`getChapters`)
- **Custom Hooks**:
  - `useQuranChapters()` in `src/features/quran/hooks/useQuranChapters.ts` (Handles API data fetching & React Query caching)
  - `useChapterSearch()` in `src/features/quran/hooks/useChapterSearch.ts` (Handles search input, 300ms debouncing, clear actions & Fuse.js fuzzy search)
- **Calling Screens / Hooks**:
  - `QuranScreen` (`src/features/quran/screens/quran.tsx`)
  - `useLibraryData` (`src/features/library/hooks/useLibraryData.ts`)
- **Data Mapping**: Raw `ApiChapterDto` (`name_arabic`, `name_simple`, `revelation_place`) → mapped to domain `Chapter` interface (`id`, `name`, `englishName`, `englishTranslation`, `type`, `versesCount`).
- **Cache Policy**:
  - `staleTime`: `604,800,000 ms` (7 days)
  - `gcTime`: `604,800,000 ms` (7 days)

---

### 2. Get Verses by Chapter (`/verses/by_chapter/{id}`)
- **Base URL**: `https://api.quran.com/api/v4`
- **Example Endpoint URL**: `https://api.quran.com/api/v4/verses/by_chapter/114?language=en&translations=20&fields=text_uthmani&per_page=300`
- **API Source File**: `src/lib/api/chapter-verses.ts` (`getVersesByChapter`)
- **Custom Hooks**:
  - `useActiveQuranDetail(type, id, translationId)` in `src/features/quran-detail/hooks/useQuranDetail.ts`
  - `useSurahDetail(chapterId, translationId)` in `src/features/quran-detail/hooks/useQuranDetail.ts`
- **Calling Screens**:
  - `QuranDetailScreen` (`src/features/quran-detail/screens/QuranDetailScreen.tsx`)
- **Data Mapping**: Extracts `v.text_uthmani` for Arabic verse text and strips HTML tags from `v.translations` for clean translation output (`SurahVerse`).
- **Cache Policy**:
  - `staleTime`: `86,400,000 ms` (24 hours)
  - `gcTime`: `604,800,000 ms` (7 days in AsyncStorage persistence)

---

### 3. Get Chapter Audio & Verse Timestamps (`/chapter_recitations/{reciterId}/{chapterId}`)
- **Base URL**: `https://api.quran.com/api/v4`
- **Example Endpoint URL**: `https://api.quran.com/api/v4/chapter_recitations/7/1?segments=true`
- **API Source File**: `src/lib/api/chapter-audio.ts` (`getChapterAudio`)
- **Custom Hook**: `useQuranAudio(chapterId)` in `src/features/quran-detail/hooks/useQuranAudio.ts`
- **Calling Components / Screens**:
  - `QuranDetailScreen` (`src/features/quran-detail/screens/QuranDetailScreen.tsx`)
  - `ReciterList` (`src/features/quran/components/ReciterList.tsx`)
- **Data Mapping**: Returns audio file URL (`audio_url`) and verse-by-verse timestamps (`timestamp_from`, `timestamp_to`) for live highlight syncing.
- **Cache Policy**:
  - `staleTime`: `86,400,000 ms` (24 hours)
  - `gcTime`: `604,800,000 ms` (7 days)

---

### 4. Get Random Daily Verse (`/verses/random`)
- **Base URL**: `https://api.quran.com/api/v4`
- **Example Endpoint URL**: `https://api.quran.com/api/v4/verses/random?language=en&translations=20&fields=text_uthmani`
- **API Source File**: `src/lib/api/daily-verse.ts` (`getRandomVerse`)
- **Custom Hook**: `useDailyVerse()` in `src/features/home/hooks/useDailyVerse.ts`
- **Calling Screens**:
  - `HomeScreen` (`src/features/home/screens/home.tsx`)
- **Data Mapping**: Returns a single random verse object with Arabic text, translation in user language, and formatted source string (`Surah X:Y`).
- **Cache Policy**:
  - `staleTime`: `86,400,000 ms` (24 hours)
  - `gcTime`: `604,800,000 ms` (7 days)
