import { todayInTimeZone } from "@/lib/dates";
import {
  assertNotFuture,
  parseEventInput,
  sortEvents,
  type EventInput,
  type EventRecord,
} from "@/lib/events";
import type { EventStore } from "@/lib/storage/types";

export const LOCAL_STORAGE_KEY = "ilkdates.events";

function nowIso(): string {
  return new Date().toISOString();
}

function readAll(): EventRecord[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as EventRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(events: EventRecord[]): void {
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(events));
}

export function peekLocalEvents(): EventRecord[] {
  return sortEvents(readAll());
}

export function clearLocalEvents(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(LOCAL_STORAGE_KEY);
}

export const localStore: EventStore = {
  async list() {
    return sortEvents(readAll());
  },
  async create(input: EventInput) {
    const parsed = parseEventInput(input);
    assertNotFuture(parsed.date, todayInTimeZone());
    const now = nowIso();
    const record: EventRecord = {
      id: parsed.id ?? crypto.randomUUID(),
      title: parsed.title,
      date: parsed.date,
      emoji: parsed.emoji,
      category: parsed.category,
      recurrence: parsed.recurrence,
      note: parsed.note,
      createdAt: now,
      updatedAt: now,
    };
    const events = readAll();
    events.push(record);
    writeAll(events);
    return record;
  },
  async update(id, input) {
    const parsed = parseEventInput(input);
    assertNotFuture(parsed.date, todayInTimeZone());
    const events = readAll();
    const index = events.findIndex((event) => event.id === id);
    if (index < 0) {
      throw new Error("not_found");
    }
    const current = events[index];
    const record: EventRecord = {
      ...current,
      title: parsed.title,
      date: parsed.date,
      emoji: parsed.emoji,
      category: parsed.category,
      recurrence: parsed.recurrence,
      note: parsed.note,
      updatedAt: nowIso(),
    };
    events[index] = record;
    writeAll(events);
    return record;
  },
  async remove(id) {
    const events = readAll();
    const next = events.filter((event) => event.id !== id);
    if (next.length === events.length) {
      throw new Error("not_found");
    }
    writeAll(next);
  },
};
