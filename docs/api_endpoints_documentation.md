# Recite API Endpoints & Hooks Documentation

This document maps out every network API endpoint used in the **Recite** application, detailing which custom hooks call them, which screens render them, and complete code examples for each endpoint.

---

## 📍 Base API Client Configuration

- **Base URL**: `https://api.quran.com/api/v4`
- **Client File**: `src/lib/api/client.ts`

---

## 🗺️ Complete API Endpoint Mapping Table

| Endpoint | HTTP Method | API Function File | Custom Hook(s) | UI Screen / Component |
|---|---|---|---|---|
| `/chapters?language=en` | `GET` | `getChapters()` in `src/lib/api/quran-list.ts` | `useQuranData()`<br>→ `useQuranList()`<br>→ `useLibraryData()` | • `src/features/quran/screens/quran.tsx`<br>• `src/features/library/screens/library.tsx` |
| `/verses/by_chapter/{chapterId}` | `GET` | `getVersesByChapter()` in `src/lib/api/quran-data.ts` | `useActiveQuranDetail()`<br>`downloadTranslations()` | • `src/features/quran/screens/QuranDetailScreen.tsx`<br>• `src/features/quran/components/DownloadCard.tsx` |
| `/chapter_recitations/{reciterId}/{chapterId}` | `GET` | `getChapterAudio()` in `src/lib/api/quran-data.ts` | `useQuranAudio()`<br>`createAudioDownload()` | • `src/features/quran/screens/QuranDetailScreen.tsx`<br>• `src/features/quran/components/DownloadCard.tsx` |
| `/verses/random` | `GET` | `getRandomVerse()` in `src/lib/api/daily-verse.ts` | `useDailyVerse()` | • `src/app/(tabs)/index.tsx` (Home Screen) |
| `/search` | `GET` | `searchQuran()` in `src/lib/api/quran-list.ts` | Direct API Call | Global Search UI |

---

## 📖 Endpoint Details & Usage Examples

### 1. Fetch List of 114 Surahs
Retrieves all 114 Surahs with Arabic names, English transliterations, verse counts, and revelation type.

- **Full Example URL**: `https://api.quran.com/api/v4/chapters?language=en`
- **Query Key**: `["quranData", "chapters"]`
- **Cache Strategy**: `staleTime: 7 days`, `gcTime: 7 days` (Persisted to `AsyncStorage`)
- **Hook Stack**:
  - `useQuranData()` in `src/features/quran/hooks/useQuranData.ts`
  - `useQuranList()` in `src/features/quran/hooks/useQuranList.ts`
- **Screens**:
  - `src/features/quran/screens/quran.tsx` (Main Quran List & Live Search)
  - `src/features/library/screens/library.tsx` (Library Favorites & Offline Downloads Tab)

**Example Request Code**:
```typescript
import { quranApiClient } from "@/lib/api/client";

const { data } = await quranApiClient.get("/chapters", {
  params: { language: "en" },
});
```

---

### 2. Fetch Verses & Translation for a Surah
Retrieves Uthmani Arabic verse text and selected English/global translation for a specific Surah.

- **Full Example URL**: `https://api.quran.com/api/v4/verses/by_chapter/1?language=en&translations=20&fields=text_uthmani&per_page=300`
- **Query Key**: `["quran-detail", "chapters", chapterId, translationId]`
- **Cache Strategy**: `staleTime: 24 hours`, `gcTime: 7 days` (Persisted to `AsyncStorage`)
- **Hook Stack**:
  - `useActiveQuranDetail()` in `src/features/quran/hooks/useQuranDetail.ts`
  - `downloadTranslations()` in `src/services/downloadService.ts`
- **Screens**:
  - `src/features/quran/screens/QuranDetailScreen.tsx`

**Example Request Code**:
```typescript
import { quranApiClient } from "@/lib/api/client";

const { data } = await quranApiClient.get("/verses/by_chapter/1", {
  params: {
    language: "en",
    translations: 20, // 20 = Saheeh International
    fields: "text_uthmani",
    per_page: 300,
  },
});
```

---

### 3. Fetch Chapter Audio File & Timestamps
Retrieves the MP3 audio URL and verse-by-verse timestamp segment data for active recitations.

- **Full Example URL**: `https://api.quran.com/api/v4/chapter_recitations/7/1?segments=true` *(Reciter 7 = Mishary Rashid Alafasy, Chapter 1)*
- **Query Key**: `["chapterAudio", chapterId, reciterId]`
- **Cache Strategy**: `staleTime: 24 hours`
- **Hook Stack**:
  - `useQuranAudio()` in `src/features/quran/hooks/useQuranAudio.ts`
  - `createAudioDownload()` in `src/services/downloadService.ts`
- **Screens**:
  - `src/features/quran/screens/QuranDetailScreen.tsx` (Audio Player Controls & Word-by-Word highlighting)

**Example Request Code**:
```typescript
import { quranApiClient } from "@/lib/api/client";

const reciterId = 7; // Mishary Rashid Alafasy
const chapterId = 1;

const { data } = await quranApiClient.get(`/chapter_recitations/${reciterId}/${chapterId}`, {
  params: { segments: true },
});
```

---

### 4. Fetch Daily Verse of the Day
Retrieves a random verse with Uthmani text and localized translation for the Home screen card.

- **Full Example URL**: `https://api.quran.com/api/v4/verses/random?language=en&translations=20&fields=text_uthmani`
- **Query Key**: `["dailyVerse", language]`
- **Cache Strategy**: `staleTime: 24 hours` (Persisted per day in `appStorage`)
- **Hook Stack**:
  - `useDailyVerse()` in `src/features/home/hooks/useDailyVerse.ts`
- **Screens**:
  - `src/app/(tabs)/index.tsx` (Home Screen)

**Example Request Code**:
```typescript
import { quranApiClient } from "@/lib/api/client";

const { data } = await quranApiClient.get("/verses/random", {
  params: {
    language: "en",
    translations: 20,
    fields: "text_uthmani",
  },
});
```

---

### 5. Search Quran Verses
Performs a global search across Quranic verses by query keyword.

- **Full Example URL**: `https://api.quran.com/api/v4/search?query=mercy&size=20`
- **Hook Stack**: Called directly via `searchQuran()` in `src/lib/api/quran-list.ts`

**Example Request Code**:
```typescript
import { quranApiClient } from "@/lib/api/client";

const { data } = await quranApiClient.get("/search", {
  params: {
    query: "mercy",
    size: 20,
  },
});
```
