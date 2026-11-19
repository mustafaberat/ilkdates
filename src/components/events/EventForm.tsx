"use client";

import { useEffect, useId, useState, type FormEvent } from "react";

import { DatePicker } from "@/components/calendar/DatePicker";
import { formatLongDate, tr } from "@/i18n/tr";
import { NOTE_MAX_LENGTH, type EventInput, type EventRecord } from "@/lib/domain/events";

const EMOJIS = ["💞", "🤝", "💋", "💬", "🏡", "☕", "🌙", "✈️", "🎁"];
const LAST_CATEGORY_KEY = "ilkdates.lastCategory";

function readLastCategory(): string {
  if (typeof window === "undefined") {
    return "";
  }
  try {
    return window.localStorage.getItem(LAST_CATEGORY_KEY)?.trim() ?? "";
  } catch {
    return "";
  }
}

function writeLastCategory(value: string): void {
  if (typeof window === "undefined") {
    return;
  }
  const trimmed = value.trim();
  try {
    if (trimmed) {
      window.localStorage.setItem(LAST_CATEGORY_KEY, trimmed);
    } else {
      window.localStorage.removeItem(LAST_CATEGORY_KEY);
    }
  } catch {
    // ignore quota / private mode
  }
}

type Props = {
  open: boolean;
  today: string;
  defaultDate: string;
  knownCategories?: string[];
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
  knownCategories = [],
  event,
  busy,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const formId = useId();
  const categoryListId = `${formId}-categories`;
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [dateOpen, setDateOpen] = useState(false);
  const [emoji, setEmoji] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    setTitle(event?.title ?? "");
    setDate(event?.date ?? defaultDate);
    setDateOpen(false);
    setEmoji(event?.emoji ?? "");
    setCategory(event?.category ?? (event ? "" : readLastCategory()));
    setNote(event?.note ?? "");
    setError(null);
  }, [open, event, defaultDate]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
        if (dateOpen) {
          setDateOpen(false);
          return;
        }
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, dateOpen]);

  if (!open) {
    return null;
  }

  const categoryChoices = knownCategories.filter(Boolean);
  const hintParts = [
    formatLongDate(date),
    date < today ? "geçmiş bir güne not" : date === today ? "bugün" : "gelecek bir gün",
  ];

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    try {
      await onSave({
        title,
        date,
        emoji,
        category,
        note,
      });
      if (!event) {
        writeLastCategory(category);
      }
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
    <>
      <div className="dim" role="presentation" onClick={onClose} />
      <aside
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${formId}-title`}
        onClick={(ev) => ev.stopPropagation()}
      >
        <h2 id={`${formId}-title`}>{event ? tr.editEvent : tr.addEvent}</h2>
        <p className="hint">{hintParts.join(" · ")}</p>
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
          <div className="field">
            <span>{tr.date}</span>
            <DatePicker
              value={date}
              today={today}
              open={dateOpen}
              onOpenChange={setDateOpen}
              onChange={setDate}
            />
          </div>
          <div className="field">
            <span>{tr.emoji}</span>
            <div className="emoji-row">
              {EMOJIS.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={emoji === item ? "on" : undefined}
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
            {categoryChoices.length > 0 ? (
              <div className="emoji-row" role="group" aria-label={tr.category}>
                {categoryChoices.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={category === item ? "on" : undefined}
                    onClick={() =>
                      setCategory((current) => (current === item ? "" : item))
                    }
                  >
                    {item}
                  </button>
                ))}
              </div>
            ) : null}
            <input
              maxLength={40}
              value={category}
              list={categoryListId}
              placeholder={tr.categoryPlaceholder}
              onChange={(ev) => setCategory(ev.target.value)}
            />
            <datalist id={categoryListId}>
              {categoryChoices.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </label>
          <label className="field">
            <span>{tr.note}</span>
            <textarea
              className="note-area"
              rows={5}
              maxLength={NOTE_MAX_LENGTH}
              value={note}
              placeholder={tr.notePlaceholder}
              onChange={(ev) => setNote(ev.target.value)}
            />
            <span className="hint note-count">
              {note.length}/{NOTE_MAX_LENGTH}
            </span>
          </label>
          {error ? <p className="error-banner">{error}</p> : null}
          <div className="actions">
            <button type="button" className="btn-line" onClick={onClose} disabled={busy}>
              {tr.cancel}
            </button>
            <button type="submit" className="btn-fill" disabled={busy}>
              {tr.save}
            </button>
            {event && onDelete ? (
              <button type="button" className="btn-danger" onClick={handleDelete} disabled={busy}>
                {tr.delete}
              </button>
            ) : null}
          </div>
        </form>
      </aside>
    </>
  );
}

function messageFor(code: string): string {
  switch (code) {
    case "invalid_title":
      return tr.invalidTitle;
    case "invalid_date":
      return tr.invalidDate;
    default:
      return tr.errorGeneric;
  }
}
