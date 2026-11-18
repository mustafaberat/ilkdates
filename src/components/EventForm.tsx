"use client";

import { useEffect, useId, useState, type FormEvent } from "react";

import { formatLongDate, tr } from "@/i18n/tr";
import type { Recurrence } from "@/lib/dates";
import type { EventInput, EventRecord } from "@/lib/events";

const EMOJIS = ["💞", "🤝", "💋", "💬", "🏡", "✈️", "🎁", "☕", "🌙", "💍"];

type Props = {
  open: boolean;
  today: string;
  defaultDate: string;
  event?: EventRecord | null;
  busy?: boolean;
  onClose: () => void;
  onSave: (input: EventInput) => Promise<void>;
  onDelete?: () => Promise<void>;
};

export function EventForm({
  open,
  today,
  defaultDate,
  event,
  busy,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const formId = useId();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [emoji, setEmoji] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [recurrence, setRecurrence] = useState<Recurrence>("none");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    setTitle(event?.title ?? "");
    setDate(event?.date ?? defaultDate);
    setEmoji(event?.emoji ?? "");
    setCategory(event?.category ?? "");
    setNote(event?.note ?? "");
    setRecurrence(event?.recurrence ?? "none");
    setError(null);
  }, [open, event, defaultDate]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const dateTooLate = date > today;

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (dateTooLate) {
      setError(tr.futureDate);
      return;
    }
    try {
      await onSave({
        title,
        date,
        emoji,
        category,
        note,
        recurrence,
      });
      onClose();
    } catch (caught) {
      const code = caught instanceof Error ? caught.message : "error_generic";
      setError(messageFor(code));
    }
  }

  async function handleDelete() {
    if (!onDelete) {
      return;
    }
    if (!window.confirm(tr.deleteConfirm)) {
      return;
    }
    try {
      await onDelete();
      onClose();
    } catch (caught) {
      const code = caught instanceof Error ? caught.message : "error_generic";
      setError(messageFor(code));
    }
  }

  return (
    <div className="overlay" role="presentation" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${formId}-title`}
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="sheet-handle" />
        <h2 id={`${formId}-title`}>{event ? tr.editEvent : tr.addEvent}</h2>
        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>{tr.title}</span>
            <input
              required
              maxLength={80}
              value={title}
              placeholder={tr.titlePlaceholder}
              onChange={(ev) => setTitle(ev.target.value)}
              autoFocus
            />
          </label>
          <label className="field">
            <span>{tr.date}</span>
            <input
              type="date"
              required
              max={today}
              value={date}
              onChange={(ev) => setDate(ev.target.value)}
            />
          </label>
          <div className="field">
            <span>{tr.emoji}</span>
            <div className="emoji-row">
              {EMOJIS.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={emoji === item ? "is-on" : undefined}
                  onClick={() => setEmoji((current) => (current === item ? "" : item))}
                  aria-label={item}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <label className="field">
            <span>{tr.category}</span>
            <input
              maxLength={40}
              value={category}
              placeholder={tr.categoryPlaceholder}
              onChange={(ev) => setCategory(ev.target.value)}
            />
          </label>
          <div className="field">
            <span>{tr.recurrence}</span>
            <div className="segmented" role="group">
              {(
                [
                  ["none", tr.recurrenceNone],
                  ["monthly", tr.recurrenceMonthly],
                  ["yearly", tr.recurrenceYearly],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={recurrence === value ? "is-on" : undefined}
                  onClick={() => setRecurrence(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <label className="field">
            <span>{tr.note}</span>
            <textarea
              maxLength={500}
              value={note}
              placeholder={tr.notePlaceholder}
              onChange={(ev) => setNote(ev.target.value)}
            />
          </label>
          {dateTooLate ? <p className="error-banner">{tr.futureDate}</p> : null}
          {error ? <p className="error-banner">{error}</p> : null}
          <div className="sheet-actions">
            <button type="button" className="btn btn-line" onClick={onClose} disabled={busy}>
              {tr.cancel}
            </button>
            <button type="submit" className="btn btn-primary" disabled={busy || dateTooLate}>
              {tr.save}
            </button>
            {event && onDelete ? (
              <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={busy}>
                {tr.delete}
              </button>
            ) : null}
          </div>
        </form>
        <p className="sr-only">{formatLongDate(date)}</p>
      </div>
    </div>
  );
}

function messageFor(code: string): string {
  switch (code) {
    case "future_date":
      return tr.futureDate;
    case "invalid_title":
      return tr.invalidTitle;
    case "invalid_date":
      return tr.invalidDate;
    default:
      return tr.errorGeneric;
  }
}
