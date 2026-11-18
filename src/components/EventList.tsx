"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";

import { formatShortDate, tr } from "@/i18n/tr";
import { todayMatch } from "@/lib/dates";
import type { EventRecord } from "@/lib/events";
import { eventAgeLabel, recurrenceLabel } from "@/lib/labels";

type Props = {
  events: EventRecord[];
  today: string;
  empty: string;
  onSelect: (event: EventRecord) => void;
};

export function EventList({ events, today, empty, onSelect }: Props) {
  if (events.length === 0) {
    return <p className="hint">{empty}</p>;
  }

  return (
    <div className="ledger-table" role="table" aria-label={tr.allFirsts}>
      <div className="ledger-head" role="row">
        <span role="columnheader">{tr.colDate}</span>
        <span role="columnheader">{tr.colFirst}</span>
        <span role="columnheader" className="ledger-rec">
          {tr.colRecurrence}
        </span>
        <span role="columnheader" className="ledger-age">
          {tr.colAge}
        </span>
      </div>
      {events.map((event) => {
        const isToday = Boolean(todayMatch(event.date, event.recurrence, today));
        const age = eventAgeLabel(event.date, event.recurrence, today);
        const rec = event.recurrence !== "none" ? recurrenceLabel(event.recurrence) : "";
        return (
          <button
            key={event.id}
            type="button"
            role="row"
            className={`ledger-row${isToday ? " is-today" : ""}`}
            onClick={() => onSelect(event)}
          >
            <span className="dt" role="cell">
              {formatShortDate(event.date)}
            </span>
            <span className="ilk" role="cell">
              <span className="ilk-title">
                {event.emoji ? (
                  <span className="emoji" aria-hidden="true">
                    {event.emoji}
                  </span>
                ) : null}
                <span className="ttl">{event.title}</span>
              </span>
              {event.note ? <EventNote text={event.note} /> : null}
            </span>
            <span className="ledger-rec" role="cell">
              {rec}
            </span>
            <span className="meta" role="cell">
              {age}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function EventNote({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [clamped, setClamped] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const measure = () => {
      if (open) {
        return;
      }
      setClamped(el.scrollHeight > el.clientHeight + 1);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text, open]);

  function toggle(ev: MouseEvent<HTMLButtonElement>) {
    ev.preventDefault();
    ev.stopPropagation();
    setOpen((current) => !current);
  }

  return (
    <span className="ledger-note">
      <span ref={ref} className={`ledger-note-text${open ? " is-open" : ""}`}>
        {text}
      </span>
      {clamped || open ? (
        <button type="button" className="ledger-note-more" onClick={toggle}>
          {open ? tr.noteLess : tr.noteMore}
        </button>
      ) : null}
    </span>
  );
}
