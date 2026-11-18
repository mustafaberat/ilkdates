"use client";

import { t, tr } from "@/i18n/tr";
import { todayMatch } from "@/lib/dates";
import type { EventRecord } from "@/lib/events";

type Props = {
  events: EventRecord[];
  today: string;
};

export function highlightText(event: EventRecord, today: string): string | null {
  const match = todayMatch(event.date, event.recurrence, today);
  if (!match) {
    return null;
  }
  if (match.kind === "start") {
    return t(tr.todayStart, { title: event.title });
  }
  if (match.kind === "yearly" && match.years) {
    return t(tr.todayYearly, { title: event.title, n: match.years });
  }
  if (match.kind === "monthly" && match.months) {
    return t(tr.todayMonthly, { title: event.title, n: match.months });
  }
  return t(tr.todayDay, { title: event.title, n: match.days });
}

export function TodayHighlights({ events, today }: Props) {
  const items = events
    .map((event) => {
      const match = todayMatch(event.date, event.recurrence, today);
      const text = highlightText(event, today);
      if (!match || !text) {
        return null;
      }
      return { event, match, text };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="highlights" aria-label={tr.todayLabel}>
      {items.map(({ event, match, text }) => (
        <article key={event.id} className="highlight-card">
          <strong>
            {event.emoji ? `${event.emoji} ` : ""}
            {event.title}
          </strong>
          <span>{text}</span>
          {match.kind !== "start" ? (
            <span> {t(tr.daysCount, { n: match.days })}</span>
          ) : null}
        </article>
      ))}
    </section>
  );
}
