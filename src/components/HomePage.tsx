"use client";

import { useMemo, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { Calendar } from "@/components/Calendar";
import { EventForm } from "@/components/EventForm";
import { useSessionEvents } from "@/hooks/useSessionEvents";
import { formatShortDate, formatWeekdayLong, t, tr } from "@/i18n/tr";
import {
  calendarYearBounds,
  markerDatesInMonth,
  parseISODate,
  todayMatch,
} from "@/lib/dates";
import type { EventInput, EventRecord } from "@/lib/events";
import { eventAgeLabel, recurrenceLabel, todayStampCaption } from "@/lib/labels";

export function HomePage() {
  const session = useSessionEvents();
  const initial = parseISODate(session.today);
  const [year, setYear] = useState(initial.y);
  const [month, setMonth] = useState(initial.m);
  const [selected, setSelected] = useState(session.today);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EventRecord | null>(null);

  const eventDates = useMemo(
    () => markerDatesInMonth(session.events, year, month),
    [session.events, year, month],
  );

  const knownCategories = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const event of session.events) {
      const value = event.category?.trim();
      if (!value) {
        continue;
      }
      const key = value.toLocaleLowerCase("tr");
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      list.push(value);
    }
    return list.sort((a, b) => a.localeCompare(b, "tr"));
  }, [session.events]);

  const stamps = useMemo(() => {
    return session.events
      .map((event) => {
        const match = todayMatch(event.date, event.recurrence, session.today);
        const caption = todayStampCaption(
          event.title,
          event.date,
          event.recurrence,
          session.today,
        );
        return match && caption ? { event, match, caption } : null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => rank(a.match.kind) - rank(b.match.kind));
  }, [session.events, session.today]);

  const listed = useMemo(() => {
    return [...session.events].sort((a, b) => {
      if (a.date === b.date) {
        return a.title.localeCompare(b.title, "tr");
      }
      return a.date < b.date ? 1 : -1;
    });
  }, [session.events]);

  const migratedCount = session.notice?.startsWith("migrated:")
    ? Number(session.notice.split(":")[1])
    : 0;

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(event: EventRecord) {
    setEditing(event);
    setSelected(event.date);
    const parsed = parseISODate(event.date);
    setYear(parsed.y);
    setMonth(parsed.m);
    setFormOpen(true);
  }

  async function handleSave(input: EventInput) {
    if (editing) {
      await session.update(editing.id, input);
    } else {
      await session.create(input);
    }
  }

  const yearBounds = calendarYearBounds({
    today: session.today,
    viewingYear: year,
    eventDates: session.events.map((event) => event.date),
  });

  return (
    <AppShell user={session.user} ready={session.ready} showBanner={!session.user}>
      <main className="wrap">
        {session.error ? <p className="error-banner">{session.error}</p> : null}
        {migratedCount > 0 ? (
          <p className="notice">{t(tr.migrated, { n: migratedCount })}</p>
        ) : null}
        <div className="desk">
          <Calendar
            year={year}
            month={month}
            today={session.today}
            selected={selected}
            eventDates={eventDates}
            minYear={yearBounds.minYear}
            maxYear={yearBounds.maxYear}
            onMonthChange={(nextYear, nextMonth) => {
              setYear(nextYear);
              setMonth(nextMonth);
            }}
            onSelect={(iso) => {
              setSelected(iso);
              const parsed = parseISODate(iso);
              setYear(parsed.y);
              setMonth(parsed.m);
            }}
          />
          <aside className="side">
            <div className="when">{formatWeekdayLong(session.today)}</div>
            {stamps.length > 0 ? (
              <div className="today-box">
                <div className="kicker">{tr.todayStamp}</div>
                {stamps.map(({ event, match, caption }) => (
                  <div key={event.id}>
                    <h2>
                      {event.emoji ? `${event.emoji} ` : ""}
                      {event.title}
                    </h2>
                    <p>{caption}</p>
                    <div className="row">
                      <span className="kicker">{recurrenceLabel(event.recurrence)}</span>
                    </div>
                    {match.kind === "start" ? null : null}
                  </div>
                ))}
              </div>
            ) : null}
            <div className="list">
              <h2>{tr.allFirsts}</h2>
              {listed.length === 0 ? (
                <p className="hint">{tr.emptyAll}</p>
              ) : (
                <ul>
                  {listed.map((event) => {
                    const isToday = Boolean(
                      todayMatch(event.date, event.recurrence, session.today),
                    );
                    return (
                      <li
                        key={event.id}
                        className={isToday ? "is-today" : undefined}
                      >
                        <button type="button" className="row-item" onClick={() => openEdit(event)}>
                          <span className="dt">{formatShortDate(event.date)}</span>
                          <span>
                            {event.emoji ? `${event.emoji} ` : ""}
                            {event.title}
                          </span>
                          <span className="meta">
                            {eventAgeLabel(event.date, event.recurrence, session.today)}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
              <button type="button" className="add" onClick={openCreate}>
                {tr.addFirst}
              </button>
            </div>
          </aside>
        </div>
      </main>
      <EventForm
        open={formOpen}
        today={session.today}
        defaultDate={selected <= session.today ? selected : session.today}
        knownCategories={knownCategories}
        event={editing}
        busy={session.busy}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
        onDelete={
          editing
            ? async () => {
                await session.remove(editing.id);
              }
            : undefined
        }
      />
    </AppShell>
  );
}

function rank(kind: "start" | "yearly" | "monthly"): number {
  if (kind === "yearly") {
    return 0;
  }
  if (kind === "monthly") {
    return 1;
  }
  return 2;
}

