"use client";

import { useEffect, useId, useRef, useState } from "react";

import { monthNames, tr } from "@/i18n/tr";
import { addMonths, formatPostmark, monthGrid, toISODate, yearList } from "@/lib/dates";

type Props = {
  year: number;
  month: number;
  today: string;
  selected: string;
  eventDates: Set<string>;
  minYear: number;
  maxYear: number;
  onMonthChange: (year: number, month: number) => void;
  onSelect: (iso: string) => void;
};

type Picker = "month" | "year" | null;

export function Calendar({
  year,
  month,
  today,
  selected,
  eventDates,
  minYear,
  maxYear,
  onMonthChange,
  onSelect,
}: Props) {
  const cells = monthGrid(year, month);
  const prev = addMonths(year, month, -1);
  const next = addMonths(year, month, 1);
  const todayParts = today.split("-").map(Number);
  const todayY = todayParts[0] ?? year;
  const todayM = todayParts[1] ?? month;
  const weekdays = [tr.weekMon, tr.weekTue, tr.weekWed, tr.weekThu, tr.weekFri, tr.weekSat, tr.weekSun];
  const [picker, setPicker] = useState<Picker>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const years = yearList(minYear, maxYear);

  useEffect(() => {
    if (!picker) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPicker(null);
      }
    };
    const onPointer = (event: MouseEvent) => {
      if (headRef.current && !headRef.current.contains(event.target as Node)) {
        setPicker(null);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onPointer);
    };
  }, [picker]);

  return (
    <section className="cal" aria-label={`${monthNames[month - 1]} ${year}`}>
      <div className="postmark">
        <span>{tr.istanbul}</span>
        <b>{formatPostmark(today)}</b>
        <span>{tr.turkey}</span>
      </div>
      <div className="cal-head" ref={headRef}>
        <h1 className="cal-title" id={titleId}>
          <button
            type="button"
            className="cal-title-part"
            aria-haspopup="listbox"
            aria-expanded={picker === "month"}
            aria-label={tr.pickMonth}
            onClick={() => setPicker((current) => (current === "month" ? null : "month"))}
          >
            {monthNames[month - 1]}
          </button>{" "}
          <button
            type="button"
            className="cal-title-part"
            aria-haspopup="listbox"
            aria-expanded={picker === "year"}
            aria-label={tr.pickYear}
            onClick={() => setPicker((current) => (current === "year" ? null : "year"))}
          >
            {year}
          </button>
        </h1>
        <div className="cal-nav">
          <button type="button" onClick={() => onMonthChange(prev.y, prev.m)} aria-label={tr.prevMonth}>
            ‹ {monthNames[prev.m - 1]}
          </button>
          <span className="cal-nav-sep" aria-hidden="true">
            |
          </span>
          <button type="button" onClick={() => onMonthChange(next.y, next.m)} aria-label={tr.nextMonth}>
            {monthNames[next.m - 1]} ›
          </button>
          <button
            type="button"
            className="cal-today"
            onClick={() => {
              onMonthChange(todayY, todayM);
              onSelect(today);
            }}
          >
            {tr.todayLabel}
          </button>
        </div>
        {picker === "month" ? (
          <div className="cal-picker cal-picker-months" role="listbox" aria-label={tr.pickMonth}>
            {monthNames.map((name, index) => {
              const value = index + 1;
              const on = value === month;
              return (
                <button
                  key={name}
                  type="button"
                  role="option"
                  aria-selected={on}
                  className={on ? "on" : undefined}
                  onClick={() => {
                    onMonthChange(year, value);
                    setPicker(null);
                  }}
                >
                  {name}
                </button>
              );
            })}
          </div>
        ) : null}
        {picker === "year" ? (
          <div className="cal-picker cal-picker-years" role="listbox" aria-label={tr.pickYear}>
            {years.map((value) => {
              const on = value === year;
              return (
                <button
                  key={value}
                  type="button"
                  role="option"
                  aria-selected={on}
                  className={on ? "on" : undefined}
                  onClick={() => {
                    onMonthChange(value, month);
                    setPicker(null);
                  }}
                >
                  {value}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
      <div className="dow">
        {weekdays.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="grid" role="grid">
        {cells.map((cell, index) => {
          if (!cell) {
            return (
              <div key={`empty-${index}`} className="day mute">
                <span className="n" />
              </div>
            );
          }
          const iso = toISODate(cell.y, cell.m, cell.d);
          const isToday = iso === today;
          const isSelected = iso === selected;
          const isFuture = iso > today;
          const has = eventDates.has(iso);
          const classes = [
            "day",
            isToday ? "today" : "",
            isSelected ? "selected" : "",
            isFuture ? "future" : "",
            has ? "has" : "",
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
              <span className="n">{cell.d}</span>
              {has ? <span className="dot" /> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
