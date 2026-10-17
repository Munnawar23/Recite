import {
  HIJRI_LOCALE_MAP,
  ISLAMIC_CALENDARS,
  ISLAMIC_MONTHS,
} from "@/constants";
import { HijriDateInfo } from "@/types";

function toInt(value: string): number {
  if (!value) return 0;
  // Normalize potential non-Latin digits in case an engine ignores nu-latn
  const numeralMap: Record<string, string> = {
    "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
    "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
    "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
    "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
    "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4",
    "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9",
    "०": "0", "१": "1", "२": "2", "३": "3", "४": "4",
    "५": "5", "६": "6", "७": "7", "८": "8", "९": "9",
  };
  const normalized = value.replace(/[٠-٩۰-۹০-৯०-९]/g, (d) => numeralMap[d] ?? d);
  const match = normalized.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

export function getHijriDate(locale: string = "en"): HijriDateInfo {
  const date = new Date();
  const langKey = locale.toLowerCase().split(/[-_]/)[0];
  const targetLocale = HIJRI_LOCALE_MAP[langKey] ?? "en-US";
  const months = ISLAMIC_MONTHS[langKey] ?? ISLAMIC_MONTHS.en;

  // Force Gregorian: ar-SA defaults to islamic-umalqura, fa-IR defaults to persian
  const gregorian = date.toLocaleDateString(`${targetLocale}-u-ca-gregory`, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const weekday = date.toLocaleDateString(targetLocale, { weekday: "long" });

  for (const calendar of ISLAMIC_CALENDARS) {
    try {
      const parts = new Intl.DateTimeFormat(
        `${targetLocale}-u-ca-${calendar}-nu-latn`,
        { day: "numeric", month: "numeric", year: "numeric" },
      ).formatToParts(date);

      const get = (type: string) =>
        parts.find((p) => p.type === type)?.value ?? "";

      const day = toInt(get("day"));
      const monthIndex = toInt(get("month")) - 1;
      const year = toInt(get("year"));

      if (day > 0 && monthIndex >= 0 && monthIndex < 12 && year > 1300) {
        return {
          day,
          month: months[monthIndex] ?? months[4],
          year,
          weekday,
          gregorian,
        };
      }
    } catch {
      // try next calendar
    }
  }

  // Algorithmic fallback (JDN corrected)
  const algo = getAlgorithmicHijri(date);
  return {
    day: algo.day,
    month: months[algo.monthIndex] ?? months[4],
    year: algo.year,
    weekday,
    gregorian,
  };
}

function getAlgorithmicHijri(date: Date) {
  const jd = Math.floor(date.getTime() / 86400000) + 2440588; // Correct JDN integer
  let l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) +
    Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l =
    l -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const m = Math.floor((24 * l) / 709);
  const d = l - Math.floor((709 * m) / 24);
  const y = 30 * n + j - 30;
  return { day: d, monthIndex: Math.max(0, Math.min(11, m - 1)), year: y };
}

export function formatPrayerTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
