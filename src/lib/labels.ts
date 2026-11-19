import { t, tr } from "@/i18n/tr";
import {
  daysBetween,
  daysInclusive,
  nextAnniversary,
  type Anniversary,
} from "@/lib/dates";

export function eventAgeLabel(date: string, today: string): string {
  const delta = daysBetween(date, today);
  if (delta > 0) {
    return t(tr.daysCount, { n: daysInclusive(date, today) });
  }
  if (delta < 0) {
    return t(tr.daysUntilShort, { n: -delta });
  }
  return tr.todayLabel;
}

export function elapsedCaption(date: string, today: string): string {
  const n = daysBetween(date, today);
  if (n === 0) {
    return tr.todayLabel;
  }
  if (n > 0) {
    return t(tr.daysAgo, { n });
  }
  return t(tr.daysUntil, { n: -n });
}

export function anniversaryCaption(
  title: string,
  anniversary: Anniversary,
  today: string,
): string {
  const daysUntil = daysBetween(today, anniversary.date);
  if (daysUntil === 0) {
    return t(tr.anniversaryToday, { title, n: anniversary.years });
  }
  return t(tr.anniversarySoon, { title, n: daysUntil, k: anniversary.years });
}

export function nextAnniversaryCaption(title: string, date: string, today: string): string | null {
  const anniversary = nextAnniversary(date, today);
  if (anniversary.years < 1) {
    return null;
  }
  return anniversaryCaption(title, anniversary, today);
}
