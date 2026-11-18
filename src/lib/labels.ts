import { t, tr } from "@/i18n/tr";
import {
  daysInclusive,
  todayMatch,
  utcMillis,
  type Recurrence,
} from "@/lib/dates";

export function eventAgeLabel(date: string, recurrence: Recurrence, today: string): string {
  if (utcMillis(date) > utcMillis(today)) {
    return "";
  }
  const match = todayMatch(date, recurrence, today);
  if (match?.kind === "yearly" && match.years) {
    return t(tr.yearsCount, { n: match.years });
  }
  if (match?.kind === "monthly" && match.months) {
    return t(tr.monthsCount, { n: match.months });
  }
  return t(tr.daysCount, { n: daysInclusive(date, today) });
}

export function todayStampCaption(
  title: string,
  date: string,
  recurrence: Recurrence,
  today: string,
): string | null {
  const match = todayMatch(date, recurrence, today);
  if (!match) {
    return null;
  }
  if (match.kind === "yearly") {
    return t(tr.todayYearly, { title, n: match.years ?? 0 });
  }
  if (match.kind === "monthly") {
    return t(tr.todayMonthly, { title, n: match.months ?? 0 });
  }
  return t(tr.todayStart, { title });
}

export function recurrenceLabel(recurrence: Recurrence): string {
  if (recurrence === "yearly") {
    return tr.recurrenceYearly;
  }
  if (recurrence === "monthly") {
    return tr.recurrenceMonthly;
  }
  return tr.recurrenceNone;
}
