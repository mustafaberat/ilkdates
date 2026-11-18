export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export type Recurrence = "none" | "monthly" | "yearly";

export type Ymd = { y: number; m: number; d: number };

export function parseISODate(iso: string): Ymd {
  if (!DATE_RE.test(iso)) {
    throw new Error("invalid_date");
  }
  const y = Number(iso.slice(0, 4));
  const m = Number(iso.slice(5, 7));
  const d = Number(iso.slice(8, 10));
  if (!isValidYmd(y, m, d)) {
    throw new Error("invalid_date");
  }
  return { y, m, d };
}

export function isValidYmd(y: number, m: number, d: number): boolean {
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) {
    return false;
  }
  if (y < 1000 || y > 9999 || m < 1 || m > 12 || d < 1 || d > 31) {
    return false;
  }
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

export function toISODate(y: number, m: number, d: number): string {
  return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function utcMillis(iso: string): number {
  const { y, m, d } = parseISODate(iso);
  return Date.UTC(y, m - 1, d);
}

/** Inclusive day count: the start date itself is day 1. */
export function daysInclusive(fromIso: string, toIso: string): number {
  const diff = Math.round((utcMillis(toIso) - utcMillis(fromIso)) / 86_400_000);
  return diff + 1;
}

export function isLeapYear(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

export function daysInMonth(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/** Day of month for a monthly recurrence, clamped to the last day of that month. */
export function occurrenceDay(y: number, m: number, originalDay: number): number {
  return Math.min(originalDay, daysInMonth(y, m));
}

/** The yearly occurrence in a given year. Feb 29 falls back to Feb 28 in common years. */
export function yearlyOccurrence(eventIso: string, year: number): string {
  const e = parseISODate(eventIso);
  const day = e.m === 2 && e.d === 29 && !isLeapYear(year) ? 28 : e.d;
  return toISODate(year, e.m, day);
}

export function isExactDate(eventIso: string, todayIso: string): boolean {
  return eventIso === todayIso;
}

export function isYearlyMatch(eventIso: string, todayIso: string): boolean {
  const today = parseISODate(todayIso);
  return yearlyOccurrence(eventIso, today.y) === todayIso;
}

export function isMonthlyMatch(eventIso: string, todayIso: string): boolean {
  const event = parseISODate(eventIso);
  const today = parseISODate(todayIso);
  return occurrenceDay(today.y, today.m, event.d) === today.d;
}

export function monthsBetween(fromIso: string, toIso: string): number {
  const a = parseISODate(fromIso);
  const b = parseISODate(toIso);
  return (b.y - a.y) * 12 + (b.m - a.m);
}

export function yearsBetween(fromIso: string, toIso: string): number {
  return parseISODate(toIso).y - parseISODate(fromIso).y;
}

export function isDateOnOrBefore(iso: string, todayIso: string): boolean {
  return utcMillis(iso) <= utcMillis(todayIso);
}

export type TodayMatchKind = "start" | "monthly" | "yearly";

export type TodayMatch = {
  kind: TodayMatchKind;
  days: number;
  months?: number;
  years?: number;
};

/**
 * Highlight for an event on `today`.
 * The original date always wins. Yearly recurrence wins over monthly
 * when both would match (same calendar day). Recurrence "none" never
 * highlights a later month or year.
 */
export function todayMatch(
  eventDate: string,
  recurrence: Recurrence,
  today: string,
): TodayMatch | null {
  if (utcMillis(eventDate) > utcMillis(today)) {
    return null;
  }
  const days = daysInclusive(eventDate, today);
  if (isExactDate(eventDate, today)) {
    return { kind: "start", days };
  }
  if (recurrence === "yearly" && isYearlyMatch(eventDate, today)) {
    return { kind: "yearly", days, years: yearsBetween(eventDate, today) };
  }
  if (recurrence === "monthly" && isMonthlyMatch(eventDate, today)) {
    return { kind: "monthly", days, months: monthsBetween(eventDate, today) };
  }
  return null;
}

export function todayInTimeZone(
  timeZone = "Europe/Istanbul",
  now = new Date(),
): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function addMonths(year: number, month: number, delta: number): Ymd {
  const index = year * 12 + (month - 1) + delta;
  const y = Math.floor(index / 12);
  const m = (index % 12) + 1;
  return { y, m, d: 1 };
}

/** Monday-first grid of 42 cells covering the given month. */
export function monthGrid(year: number, month: number): (Ymd | null)[] {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const weekday = (first.getUTCDay() + 6) % 7; // 0 = Monday
  const count = daysInMonth(year, month);
  const cells: (Ymd | null)[] = [];
  for (let i = 0; i < weekday; i += 1) {
    cells.push(null);
  }
  for (let d = 1; d <= count; d += 1) {
    cells.push({ y: year, m: month, d });
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}

export function occursOnDate(
  eventDate: string,
  recurrence: Recurrence,
  target: string,
): boolean {
  if (utcMillis(target) < utcMillis(eventDate)) {
    return false;
  }
  if (eventDate === target) {
    return true;
  }
  if (recurrence === "yearly") {
    return isYearlyMatch(eventDate, target);
  }
  if (recurrence === "monthly") {
    return isMonthlyMatch(eventDate, target);
  }
  return false;
}

export function markerDatesInMonth(
  events: Array<{ date: string; recurrence: Recurrence }>,
  year: number,
  month: number,
): Set<string> {
  const marked = new Set<string>();
  const count = daysInMonth(year, month);
  for (let day = 1; day <= count; day += 1) {
    const iso = toISODate(year, month, day);
    if (events.some((event) => occursOnDate(event.date, event.recurrence, iso))) {
      marked.add(iso);
    }
  }
  return marked;
}

export function formatPostmark(iso: string): string {
  const { y, m, d } = parseISODate(iso);
  return `${String(d).padStart(2, "0")}.${String(m).padStart(2, "0")}.${String(y).slice(2)}`;
}


export function calendarYearBounds(input: {
  today: string;
  viewingYear: number;
  relationshipStart?: string | null;
  eventDates?: string[];
}): { minYear: number; maxYear: number } {
  const todayY = parseISODate(input.today).y;
  const years = [todayY, input.viewingYear];
  if (input.relationshipStart) {
    years.push(parseISODate(input.relationshipStart).y);
  }
  for (const iso of input.eventDates ?? []) {
    years.push(parseISODate(iso).y);
  }
  return {
    minYear: Math.min(...years),
    maxYear: Math.max(todayY + 10, input.viewingYear),
  };
}

export function yearList(minYear: number, maxYear: number): number[] {
  const start = Math.min(minYear, maxYear);
  const end = Math.max(minYear, maxYear);
  const years: number[] = [];
  for (let year = end; year >= start; year -= 1) {
    years.push(year);
  }
  return years;
}


/** The chronologically first event date, or null when the list is empty. */
export function earliestEventDate(dates: string[]): string | null {
  let earliest: string | null = null;
  for (const iso of dates) {
    try {
      parseISODate(iso);
    } catch {
      continue;
    }
    if (earliest === null || iso < earliest) {
      earliest = iso;
    }
  }
  return earliest;
}
