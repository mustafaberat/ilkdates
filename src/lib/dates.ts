export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

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
  return daysBetween(fromIso, toIso) + 1;
}

/** Calendar days between two dates. Same day is 0; a later `to` is positive. */
export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((utcMillis(toIso) - utcMillis(fromIso)) / 86_400_000);
}

export function isLeapYear(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

export function daysInMonth(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/** The yearly occurrence in a given year. Feb 29 falls back to Feb 28 in common years. */
export function yearlyOccurrence(eventIso: string, year: number): string {
  const e = parseISODate(eventIso);
  const day = e.m === 2 && e.d === 29 && !isLeapYear(year) ? 28 : e.d;
  return toISODate(year, e.m, day);
}

export function isYearlyMatch(eventIso: string, todayIso: string): boolean {
  const today = parseISODate(todayIso);
  return yearlyOccurrence(eventIso, today.y) === todayIso;
}

export function yearsBetween(fromIso: string, toIso: string): number {
  return parseISODate(toIso).y - parseISODate(fromIso).y;
}

export type Anniversary = {
  date: string;
  years: number;
};

/**
 * Next yearly anniversary on or after `today`.
 * If `eventDate` is still in the future, returns that date with years = 0.
 * If today is the anniversary, returns today with the completed year count.
 */
export function nextAnniversary(eventDate: string, today: string): Anniversary {
  const start = parseISODate(eventDate);
  if (utcMillis(eventDate) > utcMillis(today)) {
    return { date: eventDate, years: 0 };
  }
  const todayY = parseISODate(today).y;
  let year = todayY;
  let occ = yearlyOccurrence(eventDate, year);
  if (utcMillis(occ) < utcMillis(today)) {
    year += 1;
    occ = yearlyOccurrence(eventDate, year);
  }
  return { date: occ, years: year - start.y };
}

export function mostRecentPastDate(dates: string[], today: string): string | null {
  let latest: string | null = null;
  for (const iso of dates) {
    if (utcMillis(iso) > utcMillis(today)) {
      continue;
    }
    if (latest === null || iso > latest) {
      latest = iso;
    }
  }
  return latest;
}

export function nearestFutureDate(dates: string[], today: string): string | null {
  let nearest: string | null = null;
  for (const iso of dates) {
    if (utcMillis(iso) <= utcMillis(today)) {
      continue;
    }
    if (nearest === null || iso < nearest) {
      nearest = iso;
    }
  }
  return nearest;
}

export type UpcomingAnniversary<T extends { date: string }> = {
  event: T;
  anniversary: Anniversary;
  daysUntil: number;
};

/** Nearest yearly anniversary (years >= 1) on or after today, across all events. */
export function nextUpcomingAnniversary<T extends { date: string }>(
  events: T[],
  today: string,
): UpcomingAnniversary<T> | null {
  let best: UpcomingAnniversary<T> | null = null;
  for (const event of events) {
    const anniversary = nextAnniversary(event.date, today);
    if (anniversary.years < 1) {
      continue;
    }
    const daysUntil = daysBetween(today, anniversary.date);
    if (
      !best ||
      daysUntil < best.daysUntil ||
      (daysUntil === best.daysUntil &&
        (event.date < best.event.date ||
          (event.date === best.event.date &&
            "title" in event &&
            "title" in best.event &&
            String(event.title) < String(best.event.title))))
    ) {
      best = { event, anniversary, daysUntil };
    }
  }
  return best;
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

export function markerDatesInMonth(
  events: Array<{ date: string }>,
  year: number,
  month: number,
): Set<string> {
  const prefix = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-`;
  return new Set(
    events.filter((event) => event.date.startsWith(prefix)).map((event) => event.date),
  );
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
