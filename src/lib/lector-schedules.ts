import { getLocalDate } from "./calendar";

export function lectorMonths(now = new Date()): [string, string] {
  const current = getLocalDate(now).slice(0, 7);
  const year = Number(current.slice(0, 4));
  const month = Number(current.slice(5));
  return [
    current,
    month === 12
      ? `${year + 1}-01`
      : `${year}-${String(month + 1).padStart(2, "0")}`
  ];
}

export function lectorMonthLabel(month: string): string {
  return new Intl.DateTimeFormat("sk-SK", {
    month: "long",
    year: "numeric",
    timeZone: "Europe/Bratislava"
  }).format(new Date(`${month}-01T12:00:00Z`));
}
