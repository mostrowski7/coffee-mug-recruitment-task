const BANK_HOLIDAYS = [
  { month: 0, day: 1 },
  { month: 0, day: 6 },
  { month: 4, day: 1 },
  { month: 4, day: 3 },
  { month: 7, day: 15 },
  { month: 10, day: 1 },
  { month: 10, day: 11 },
  { month: 11, day: 25 },
  { month: 11, day: 26 },
];

export function getHolidays(year: number = new Date().getFullYear()): Date[] {
  return BANK_HOLIDAYS.map(({ month, day }) => {
    const date = new Date(year, month, day);

    date.setHours(0, 0, 0, 0);

    return date;
  });
}

export function getBlackFridayDate(
  year: number = new Date().getFullYear(),
): Date {
  const novemberFirst = new Date(year, 10, 1);
  const dayOfWeek = novemberFirst.getDay();

  const firstThursday = 1 + ((4 - dayOfWeek + 7) % 7);

  const blackFridayDay = firstThursday + 21 + 1;

  const blackFriday = new Date(year, 10, blackFridayDay);
  blackFriday.setHours(0, 0, 0, 0);

  return blackFriday;
}

export function isHoliday(date: Date, year?: number): boolean {
  const holidays = getHolidays(year || date.getFullYear());

  const compareDate = new Date(date);

  compareDate.setHours(0, 0, 0, 0);

  return holidays.some(
    (holiday) => holiday.getTime() === compareDate.getTime(),
  );
}

export function isBlackFriday(date: Date): boolean {
  const blackFriday = getBlackFridayDate(date.getFullYear());

  const compareDate = new Date(date);

  compareDate.setHours(0, 0, 0, 0);

  return compareDate.getTime() === blackFriday.getTime();
}
