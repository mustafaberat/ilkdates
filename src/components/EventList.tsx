"use client";

import { formatLongDate, t, tr } from "@/i18n/tr";
import { daysInclusive, todayMatch } from "@/lib/dates";
import type { EventRecord } from "@/lib/events";

type Props = {
  events: EventRecord[];
  today: string;
  empty: string;
  onSelect: (event: EventRecord) => void;
};

export function EventList({ events, today, empty, onSelect }: Props) {
  if (events.length === 0) {
    return <p className="muted">{empty}</p>;
  }

  return (
    <ul className="event-list">
      {events.map((event) => {
        const match = todayMatch(event.date, event.recurrence, today);
        const days = event.date <= today ? daysInclusive(event.date, today) : null;
        const meta =
          match?.kind === "yearly" && match.years
            ? t(tr.yearsCount, { n: match.years })
            : match?.kind === "monthly" && match.months
              ? t(tr.monthsCount, { n: match.months })
              : days
                ? t(tr.daysCount, { n: days })
                : formatLongDate(event.date);
        return (
          <li key={event.id}>
            <button
              type="button"
              className={`event-card${match ? " is-match" : ""}`}
              onClick={() => onSelect(event)}
            >
              <span className="event-emoji" aria-hidden="true">
                {event.emoji || "✦"}
              </span>
              <span>
                <h3>{event.title}</h3>
                <p>{formatLongDate(event.date)}</p>
              </span>
              <span className="event-meta">{meta}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
