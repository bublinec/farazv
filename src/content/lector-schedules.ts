export interface LectorSchedule {
  month: string;
  version: number;
  available: boolean;
  bytes: number;
  updatedAt: string | null;
  updatedBy?: string;
}

export interface LectorScheduleList {
  months: LectorSchedule[];
  history: LectorSchedule[];
  nextCursor: string | null;
}
