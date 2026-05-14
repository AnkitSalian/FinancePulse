export function currentMonth(): string {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
}

export function formatMonth(month: string): string {
  const [year, mon] = month.split('-');
  const date = new Date(Number(year), Number(mon) - 1, 1);
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export function prevMonth(month: string): string {
  const [year, mon] = month.split('-');
  const date = new Date(Number(year), Number(mon) - 2, 1);
  return date.toISOString().slice(0, 7);
}

export function nextMonth(month: string): string {
  const [year, mon] = month.split('-');
  const date = new Date(Number(year), Number(mon), 1);
  return date.toISOString().slice(0, 7);
}

export function monthFirstDay(month: string): string {
  return `${month}-01`;
}

export function getDaysInMonth(month: string): number {
  const [year, mon] = month.split('-');
  return new Date(Number(year), Number(mon), 0).getDate();
}
