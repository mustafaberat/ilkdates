"use client";

import { addMonths, monthGrid, toISODate } from "@/lib/dates";
import { formatMonthYear, tr, weekdays } from "@/i18n/tr";

type Props = {
  year: number;
  month: number;
  today: string;
  selected: string;
  eventDates: Set<string>;
  onMonthChange: (year: number, month: number) => void;
  onSelect: (iso: string) => void;
};

export function Calendar({
  year,
  month,
  today,
  selected,
  eventDates,
  onMonthChange,
  onSelect,
}: Props) {
  const cells = monthGrid(year, month);
  const prev = addMonths(year, month, -1);
  const next = addMonths(year, month, 1);

  return (
    <section className="calendar" aria-label={formatMonthYear(year, month)}>
      <div className="calendar-nav">
        <button
          type="button"
          className="icon-btn"
          aria-label={tr.prevMonth}
          onClick={() => onMonthChange(prev.y, prev.m)}
        >
          ‹
        </button>
        <h2 className="calendar-title">{formatMonthYear(year, month)}</h2>
        <button
          type="button"
          className="icon-btn"
          aria-label={tr.nextMonth}
          onClick={() => onMonthChange(next.y, next.m)}
        >
          ›
        </button>
      </div>
      <div className="weekdays">
        {weekdays.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="grid" role="grid">
        {cells.map((cell, index) => {
          if (!cell) {
            return <div key={`empty-${index}`} className="day is-empty" />;
          }
          const iso = toISODate(cell.y, cell.m, cell.d);
          const isToday = iso === today;
          const isSelected = iso === selected;
          const isFuture = iso > today;
          const classes = [
            "day",
            isToday ? "is-today" : "",
            isSelected ? "is-selected" : "",
            isFuture ? "is-future" : "",
            eventDates.has(iso) ? "has-event" : "",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <button
              key={iso}
              type="button"
              className={classes}
              aria-current={isToday ? "date" : undefined}
              aria-pressed={isSelected}
              aria-label={iso}
              onClick={() => onSelect(iso)}
            >
              {cell.d}
            </button>
          );
        })}
      </div>
    </section>
  );
}
