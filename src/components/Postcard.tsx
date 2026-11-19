"use client";

import { formatWeekdayLong, t, tr } from "@/i18n/tr";
import {
  daysBetween,
  mostRecentPastDate,
  nearestFutureDate,
  nextUpcomingAnniversary,
} from "@/lib/dates";
import type { EventRecord } from "@/lib/events";
import {
  anniversaryCaption,
  elapsedCaption,
  nextAnniversaryCaption,
} from "@/lib/labels";

type Props = {
  events: EventRecord[];
  today: string;
  selected: string;
  ready?: boolean;
  onAdd: () => void;
  onSelectEvent?: (event: EventRecord) => void;
};

export function Postcard({ events, today, selected, ready = true, onAdd, onSelectEvent }: Props) {
  const onSelected = events
    .filter((event) => event.date === selected)
    .sort((a, b) => a.title.localeCompare(b.title, "tr"));
  const isToday = selected === today;

  return (
    <aside className="side">
      <div className="when">{formatWeekdayLong(selected)}</div>
      <div className="today-box postcard">
        <div className="kicker">{isToday ? tr.todayStamp : tr.selectedDay}</div>
        {!ready ? (
          <p className="hint">{tr.loading}</p>
        ) : onSelected.length > 0 ? (
          onSelected.map((event) => (
            <PostcardEvent
              key={event.id}
              event={event}
              today={today}
              onSelect={onSelectEvent}
            />
          ))
        ) : events.length === 0 ? (
          <div className="postcard-empty">
            <h2>{tr.addFirstCta}</h2>
          </div>
        ) : (
          <Fallback events={events} today={today} onSelectEvent={onSelectEvent} />
        )}
      </div>
      <button type="button" className="add postcard-add" onClick={onAdd}>
        {tr.addEvent}
      </button>
    </aside>
  );
}

function Fallback({
  events,
  today,
  onSelectEvent,
}: {
  events: EventRecord[];
  today: string;
  onSelectEvent?: (event: EventRecord) => void;
}) {
  const recentDate = mostRecentPastDate(
    events.map((event) => event.date),
    today,
  );
  const recent = recentDate
    ? events
        .filter((event) => event.date === recentDate)
        .sort((a, b) => a.title.localeCompare(b.title, "tr"))
    : [];
  const upcoming = nextUpcomingAnniversary(events, today);
  const futureDate = recent.length === 0 ? nearestFutureDate(
    events.map((event) => event.date),
    today,
  ) : null;
  const future = futureDate
    ? events
        .filter((event) => event.date === futureDate)
        .sort((a, b) => a.title.localeCompare(b.title, "tr"))
    : [];

  return (
    <>
      {recent.length > 0 ? (
        <div className="postcard-block">
          <div className="kicker">{tr.lastFirst}</div>
          {recent.map((event) => (
            <PostcardEvent
              key={event.id}
              event={event}
              today={today}
              onSelect={onSelectEvent}
              showAnniversary={false}
            />
          ))}
        </div>
      ) : null}
      {upcoming ? (
        <div className="postcard-block">
          <div className="kicker">{tr.nextAnniversary}</div>
          <p>
            {anniversaryCaption(upcoming.event.title, upcoming.anniversary, today)}
          </p>
        </div>
      ) : null}
      {future.length > 0 ? (
        <div className="postcard-block">
          {future.map((event) => (
            <button
              key={event.id}
              type="button"
              className="postcard-event"
              onClick={() => onSelectEvent?.(event)}
            >
              <h2>
                {event.emoji ? `${event.emoji} ` : ""}
                {event.title}
              </h2>
              <p>{t(tr.daysUntilTitle, { n: daysBetween(today, event.date), title: event.title })}</p>
            </button>
          ))}
        </div>
      ) : null}
    </>
  );
}

function PostcardEvent({
  event,
  today,
  onSelect,
  showAnniversary = true,
}: {
  event: EventRecord;
  today: string;
  onSelect?: (event: EventRecord) => void;
  showAnniversary?: boolean;
}) {
  const anniversary = showAnniversary ? nextAnniversaryCaption(event.title, event.date, today) : null;
  const body = (
    <>
      <h2>
        {event.emoji ? `${event.emoji} ` : ""}
        {event.title}
      </h2>
      <p>{elapsedCaption(event.date, today)}</p>
      {anniversary ? <p>{anniversary}</p> : null}
    </>
  );
  if (!onSelect) {
    return <div className="postcard-event">{body}</div>;
  }
  return (
    <button type="button" className="postcard-event" onClick={() => onSelect(event)}>
      {body}
    </button>
  );
}
