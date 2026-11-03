export const getTodayIndex = (days: WeeklyAnnouncements.Day[]) => {
  const todayDateStr = new Date().toISOString().slice(0, 10);
  const todayIndex = days.findIndex((d) => d.date === todayDateStr);
  return todayIndex === -1 ? 0 : todayIndex;
};

export const majorFeasts = [
  "01-01",
  "01-06",
  "06-29",
  "08-15",
  "11-01",
  "12-08",
  "12-25"
];

export const isMajorFeast = (isoStringDate: string) => {
  const date = new Date(isoStringDate);
  // if is sunday return true
  if (date.getDay() == 7) {
    return true;
  }
  // handle fixed feasts
  if (majorFeasts.includes(isoStringDate.slice(5))) {
    return true;
  }
  // handle variable feasts

  return false;
};
