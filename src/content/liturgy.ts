import type { CalendarDate } from "./types";

export interface GospelVerse {
  text: string;
  celebration: string;
  variant?: string;
}

/** Reading suggestions are separate from the parish's edited Mass schedule. */
export interface DailyLiturgy {
  date: CalendarDate;
  verses: GospelVerse[];
}

export function liturgySourceUrl(date: CalendarDate) {
  return `https://lc.kbs.sk/?den=${date}`;
}
