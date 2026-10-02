import { HijriDateInfo } from "@/types";

export function getHijriDate(locale: string = "en"): HijriDateInfo {
  const date = new Date();

  // Map app locale to BCP 47 locale string
  const localeMap: Record<string, string> = {
    en: "en-US",
    ar: "ar-SA",
    ur: "ur-PK",
    hi: "hi-IN",
    id: "id-ID",
    bn: "bn-BD",
  };

  const targetLocale = localeMap[locale] || "en-US";

  const gregorian = date.toLocaleDateString(targetLocale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  try {
    const formatter = new Intl.DateTimeFormat(`${targetLocale}-u-ca-islamic-umalqura`, {
      day: "numeric",
      month: "long",
      year: "numeric",
      weekday: "long",
    });

    const parts = formatter.formatToParts(date);

    const hijriDate: HijriDateInfo = {
      day: date.getDate(),
      month: "Islamic",
      year: 0,
      weekday: date.toLocaleDateString(targetLocale, {
        weekday: "long",
      }),
      gregorian,
    };

    for (const part of parts) {
      switch (part.type) {
        case "day":
          hijriDate.day = Number(part.value) || date.getDate();
          break;

        case "month":
          hijriDate.month = part.value;
          break;

        case "year":
          hijriDate.year = Number(part.value) || 0;
          break;

        case "weekday":
          hijriDate.weekday = part.value;
          break;
      }
    }

    return hijriDate;
  } catch {
    return {
      day: date.getDate(),
      month: "Islamic",
      year: 0,
      weekday: date.toLocaleDateString(targetLocale, {
        weekday: "long",
      }),
      gregorian,
    };
  }
}

export function formatPrayerTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
