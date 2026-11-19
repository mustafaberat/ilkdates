"use client";

import { useEffect, useId, useMemo, useState } from "react";

import { formatLongDate, formatMonthYear, monthNames, tr, weekdays } from "@/i18n/tr";
import { addMonths, monthGrid, parseISODate, toISODate } from "@/lib/dates";

type View = "days" | "months" | "years";

type Props = {
  value: string;
  today: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (iso: string) => void;
};

export function DatePicker({ value, today, open, onOpenChange, onChange }: Props) {
  const labelId = useId();
  const parsed = useMemo(() => parseISODate(value), [value]);
  const [view, setView] = useState<View>("days");
  const [cursorYear, setCursorYear] = useState(parsed.y);
  const [cursorMonth, setCursorMonth] = useState(parsed.m);
  const [decadeStart, setDecadeStart] = useState(Math.floor(parsed.y / 12) * 12);

  useEffect(() => {
    setCursorYear(parsed.y);
    setCursorMonth(parsed.m);
    setDecadeStart(Math.floor(parsed.y / 12) * 12);
    if (open) {
      setView("days");
    }
  }, [open, parsed.y, parsed.m]);

  const prev = addMonths(cursorYear, cursorMonth, -1);
  const next = addMonths(cursorYear, cursorMonth, 1);
  const cells = monthGrid(cursorYear, cursorMonth);

  function onMonthNav(y: number, m: number) {
    setCursorYear(y);
    setCursorMonth(m);
  }

  function pickDay(y: number, m: number, d: number) {
    const iso = toISODate(y, m, d);
    onChange(iso);
    onOpenChange(false);
  }

  return (
    <div className="date-picker">
      <button
        type="button"
        className="date-picker-trigger"
        aria-expanded={open}
        aria-controls={labelId}
        onClick={() => onOpenChange(!open)}
      >
        <span>{formatLongDate(value)}</span>
        <span aria-hidden="true">▾</span>
      </button>
      {open ? (
        <div className="date-picker-panel" id={labelId} role="dialog" aria-label={tr.date}>
          <div className="calendar-nav">
            <button
              type="button"
              className="icon-btn"
              aria-label={view === "years" ? tr.prevYears : tr.prevMonth}
              onClick={() => {
                if (view === "years") {
                  setDecadeStart((current) => current - 12);
                  return;
                }
                if (view === "months") {
                  setCursorYear((current) => current - 1);
                  return;
                }
                onMonthNav(prev.y, prev.m);
              }}
            >
              ‹
            </button>
            <div className="calendar-title-group">
              {view === "days" ? (
                <>
                  <button
                    type="button"
                    className="calendar-title-btn"
                    onClick={() => setView("months")}
                  >
                    {monthNames[cursorMonth - 1]}
                  </button>
                  <button
                    type="button"
                    className="calendar-title-btn"
                    onClick={() => {
                      setDecadeStart(Math.floor(cursorYear / 12) * 12);
                      setView("years");
                    }}
                  >
                    {cursorYear}
                  </button>
                </>
              ) : null}
              {view === "months" ? (
                <button
                  type="button"
                  className="calendar-title-btn"
                  onClick={() => {
                    setDecadeStart(Math.floor(cursorYear / 12) * 12);
                    setView("years");
                  }}
                >
                  {cursorYear}
                </button>
              ) : null}
              {view === "years" ? (
                <span className="calendar-title">
                  {decadeStart}–{decadeStart + 11}
                </span>
              ) : null}
            </div>
            <button
              type="button"
              className="icon-btn"
              aria-label={view === "years" ? tr.nextYears : tr.nextMonth}
              onClick={() => {
                if (view === "years") {
                  setDecadeStart((current) => current + 12);
                  return;
                }
                if (view === "months") {
                  setCursorYear((current) => current + 1);
                  return;
                }
                onMonthNav(next.y, next.m);
              }}
            >
              ›
            </button>
          </div>

          {view === "years" ? (
            <div className="picker-grid years" role="listbox" aria-label={tr.pickYear}>
              {Array.from({ length: 12 }, (_, index) => decadeStart + index).map((year) => {
                return (
                  <button
                    key={year}
                    type="button"
                    role="option"
                    className={`picker-cell${year === cursorYear ? " is-on" : ""}`}
                    aria-selected={year === cursorYear}
                    onClick={() => {
                      setCursorYear(year);
                      setView("months");
                    }}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          ) : null}

          {view === "months" ? (
            <div className="picker-grid months" role="listbox" aria-label={tr.pickMonth}>
              {monthNames.map((name, index) => {
                const month = index + 1;
                return (
                  <button
                    key={name}
                    type="button"
                    role="option"
                    className={`picker-cell${month === cursorMonth ? " is-on" : ""}`}
                    aria-selected={month === cursorMonth}
                    onClick={() => {
                      setCursorMonth(month);
                      setView("days");
                    }}
                  >
                    {name.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          ) : null}

          {view === "days" ? (
            <>
              <div className="weekdays">
                {weekdays.map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
              <div className="grid" role="grid" aria-label={formatMonthYear(cursorYear, cursorMonth)}>
                {cells.map((cell, index) => {
                  if (!cell) {
                    return <div key={`empty-${index}`} className="day is-empty" />;
                  }
                  const iso = toISODate(cell.y, cell.m, cell.d);
                  const isSelected = iso === value;
                  const isToday = iso === today;
                  return (
                    <button
                      key={iso}
                      type="button"
                      className={[
                        "day",
                        isToday ? "is-today" : "",
                        isSelected ? "is-selected" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      aria-current={isToday ? "date" : undefined}
                      aria-pressed={isSelected}
                      onClick={() => pickDay(cell.y, cell.m, cell.d)}
                    >
                      <span className="n">{cell.d}</span>
                      {isToday ? <span className="dot" aria-hidden="true" /> : null}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                className="date-picker-today"
                onClick={() => {
                  const { y, m } = parseISODate(today);
                  setCursorYear(y);
                  setCursorMonth(m);
                  setView("days");
                  onChange(today);
                }}
              >
                {tr.todayLabel}
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
