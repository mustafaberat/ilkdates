"use client";

import { useMemo, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { Calendar } from "@/components/calendar/Calendar";
import { EventForm } from "@/components/events/EventForm";
import { EventList } from "@/components/events/EventList";
import { Postcard } from "@/components/postcard/Postcard";
import { useSessionEvents } from "@/hooks/useSessionEvents";
import { t, tr } from "@/i18n/tr";
import {
  calendarYearBounds,
  markerDatesInMonth,
  parseISODate,
} from "@/lib/domain/dates";
import type { EventInput, EventRecord } from "@/lib/domain/events";

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
          <Postcard
            events={session.events}
            today={session.today}
            selected={selected}
            ready={session.ready}
            onAdd={openCreate}
            onSelectEvent={openEdit}
          />
        </div>
        <section className="ledger" aria-label={tr.allFirsts}>
          <h2>{tr.allFirsts}</h2>
          <EventList
            events={listed}
            today={session.today}
            empty={tr.emptyAll}
            onSelect={openEdit}
          />
          {listed.length > 0 ? (
            <button type="button" className="add" onClick={openCreate}>
              {tr.addEvent}
            </button>
          ) : null}
        </section>
      </main>
      <EventForm
        open={formOpen}
        today={session.today}
        defaultDate={selected}
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


