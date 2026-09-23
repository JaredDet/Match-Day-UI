export function calendarDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function calendarMonthDays(year: number, month: number) {
  const first = new Date(year, month, 1, 12);
  const offset = (first.getDay() + 6) % 7;
  const count = Math.ceil((offset + new Date(year, month + 1, 0).getDate()) / 7) * 7;
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(year, month, i - offset + 1, 12);
    return { key: calendarDateKey(date), day: date.getDate(), inMonth: date.getMonth() === month };
  });
}
