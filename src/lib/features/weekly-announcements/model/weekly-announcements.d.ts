declare module WeeklyAnnouncements {
  export interface Priest {
    surname: string;
  }

  export interface Mass {
    intention: string;
    label: string;
    otherPriests: string;
    time: string;
    priest: Priest;
  }

  export interface Day {
    date: string;
    liturgy: string;
    masses: Mass[];
  }

  export interface Announcement {
    text: string;
  }

  export interface Wedding {
    amount: number;
    name: string;
  }

  export interface Baptism {
    amount: number;
    name: string;
  }

  export interface Funeral {
    amount: number;
    name: string;
  }

  export interface UrnBurial {
    amount: number;
    name: string;
  }

  export interface Other {
    amount: number;
    name: string;
  }

  export interface Donations {
    weddings: Wedding[];
    baptism: Baptism[];
    funerals: Funeral[];
    urnBurials: UrnBurial[];
    other: Other[];
  }

  export interface MassScheduleDays {
    monday: Day;
    tuesday: Day;
    wednesday: Day;
    thursday: Day;
    friday: Day;
    saturday: Day;
    sunday: Day;
  }

  export interface WeeklyAnnouncements extends MassScheduleDays {
    announcements: Announcement[];
    donations: Donations;
  }
}
