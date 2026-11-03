export type CalendarDate = `${number}-${number}-${number}`;

export interface MediaAsset {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
}

export interface HistoryMilestone {
  year: string;
  title: string;
  text: string;
}

export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; items: string[] }
  | { type: "image"; image: MediaAsset }
  | { type: "gallery"; images: MediaAsset[] }
  | { type: "link"; label: string; href: string };

export interface EditorialEntry {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: CalendarDate;
  author?: string;
  cover?: MediaAsset;
  blocks: ContentBlock[];
}

export interface Poster {
  id: string;
  title: string;
  image: MediaAsset;
  date: CalendarDate;
  href?: string;
  expiresOn?: CalendarDate;
}

export interface Mass {
  time: string;
  celebrant?: string;
  intention?: string;
  /** Legacy location; merged into the designation in the editor and public display. */
  location?: string;
  label?: string;
}

export interface ScheduleDay {
  date: CalendarDate;
  liturgy?: string;
  /** Liturgical rank or observance, separate from the celebration's name. */
  liturgyType?: string;
  masses: Mass[];
  status: "scheduled" | "no-masses" | "unpublished";
  isRegular?: boolean;
}

export interface Bulletin {
  id: string;
  weekStart: CalendarDate;
  days: ScheduleDay[];
  published: boolean;
  announcements: string[];
}

export type RegularSchedule = Record<number, Mass[]>;

export interface SiteSettings {
  name: string;
  shortName: string;
  location: string;
  phone: string;
  email: string;
  address: string;
  iban: string;
  officeHours: { day: string; time: string }[];
  preparationMeetings: { name: string; time: string }[];
  preparationNote?: string;
}
