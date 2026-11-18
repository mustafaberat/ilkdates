"use client";

import { useMemo, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { Calendar } from "@/components/Calendar";
import { EventForm } from "@/components/EventForm";
import { EventList } from "@/components/EventList";
import { GuestBanner } from "@/components/GuestBanner";
import { TodayHighlights } from "@/components/TodayHighlights";
import { useSessionEvents } from "@/hooks/useSessionEvents";
import { formatLongDate, t, tr } from "@/i18n/tr";
import { parseISODate } from "@/lib/dates";
import type { EventInput, EventRecord } from "@/lib/events";

export function HomePage() {
  const session = useSessionEvents();
  const initial = parseISODate(session.today);
  const [year, setYear] = useState(initial.y);
  const [month, setMonth] = useState(initial.m);
  const [selected, setSelected] = useState(session.today);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EventRecord | null>(null);

  const eventDates = useMemo(() => {
    return new Set(session.events.map((event) => event.date));
  }, [session.events]);

  const selectedEvents = session.events.filter((event) => event.date === selected);
  const isFuture = selected > session.today;
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

  return (
    <AppShell user={session.user} onLogout={session.user ? session.logout : undefined}>
      {!session.user ? <GuestBanner /> : null}
      {migratedCount > 0 ? (
        <p className="notice">
          {t(tr.migrated, { n: migratedCount })}
          <button type="button" className="btn btn-ghost btn-compact" onClick={session.clearNotice}>
            {tr.close}
          </button>
        </p>
      ) : null}
      {session.error ? (
        <p className="error-banner">
          {messageFor(session.error)}
          <button type="button" className="btn btn-ghost btn-compact" onClick={session.clearError}>
            {tr.close}
          </button>
        </p>
      ) : null}

      {!session.ready ? (
        <p className="muted">{tr.loading}</p>
      ) : (
        <>
          <TodayHighlights events={session.events} today={session.today} />
          <Calendar
            year={year}
            month={month}
            today={session.today}
            selected={selected}
            eventDates={eventDates}
            onMonthChange={(nextYear, nextMonth) => {
              setYear(nextYear);
              setMonth(nextMonth);
            }}
            onSelect={setSelected}
          />
          <section>
            <div className="section-head">
              <h2>{formatLongDate(selected)}</h2>
              {isFuture ? (
                <span className="muted">{tr.futureDay}</span>
              ) : (
                <button type="button" className="btn btn-primary btn-compact" onClick={openCreate}>
                  {tr.addEvent}
                </button>
              )}
            </div>
            <EventList
              events={selectedEvents}
              today={session.today}
              empty={tr.emptyMonth}
              onSelect={openEdit}
            />
          </section>
          <section>
            <div className="section-head">
              <h2>{tr.allFirsts}</h2>
            </div>
            <EventList
              events={session.events}
              today={session.today}
              empty={tr.emptyAll}
              onSelect={openEdit}
            />
          </section>
        </>
      )}

      <EventForm
        open={formOpen}
        today={session.today}
        defaultDate={isFuture ? session.today : selected}
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

function messageFor(code: string): string {
  switch (code) {
    case "future_date":
      return tr.futureDate;
    case "auth_unavailable":
      return tr.authUnavailable;
    case "unauthorized":
      return tr.invalidCredentials;
    default:
      return tr.errorGeneric;
  }
}
