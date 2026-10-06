import { RECITERS_IMAGES } from "./assets";

export interface ReciterOption {
  id: number;
  label: string;
  avatar: any;
  sublabel?: string;
}

export const DEFAULT_RECITER_ID = 7;

/**
 * List of available Quran reciters with their Quran.com recitation IDs and avatar assets.
 */
export const RECITER_OPTIONS: ReciterOption[] = [
  {
    label: "Mishary Rashid Alafasy",
    id: 7,
    avatar: RECITERS_IMAGES[7],
  },
  {
    label: "Yasser Al-Dossari",
    id: 174,
    avatar: RECITERS_IMAGES[174],
  },
  {
    label: "AbdulBaset AbdulSamad",
    id: 2,
    avatar: RECITERS_IMAGES[2],
  },
  {
    label: "Abu Bakr al-Shatri",
    id: 4,
    avatar: RECITERS_IMAGES[4],
  },
  {
    label: "Mahmoud Khalil Al-Husary",
    id: 6,
    avatar: RECITERS_IMAGES[6],
  },
  {
    label: "Hani ar-Rifai",
    id: 5,
    avatar: RECITERS_IMAGES[5],
  },
  {
    label: "Sa'ud ash-Shuraym",
    id: 10,
    avatar: RECITERS_IMAGES[10],
  },
];
