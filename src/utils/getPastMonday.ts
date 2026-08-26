export const getPastMonday = (): Date => {
  const date = new Date();

  const day = date.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;

  date.setUTCDate(date.getUTCDate() - diff);
  date.setUTCHours(0, 0, 0, 0);

  return date;
};