export const getNextSunday = (): Date => {
  const date = new Date();

  const day = date.getUTCDay();
  const daysUntilSunday = 7 - day;

  date.setUTCDate(date.getUTCDate() + daysUntilSunday);
  date.setUTCHours(23, 59, 59, 999);

  return date;
};