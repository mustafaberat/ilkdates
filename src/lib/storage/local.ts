import {
  parseEventInput,
  sortEvents,
  type EventInput,
  type EventRecord,
} from "@/lib/domain/events";
import type { EventStore } from "@/lib/storage/types";

export const LOCAL_STORAGE_KEY = "ilkdates.events";

function nowIso(): string {
  return new Date().toISOString();
}

function stripRecurrence<T extends object>(value: T): T {
  if (value && "recurrence" in value) {
    const { recurrence: _ignored, ...rest } = value as T & { recurrence?: unknown };
    void _ignored;
    return rest as T;
  }
  return value;
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
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    const records: EventRecord[] = [];
    for (const item of parsed) {
      try {
        const input = parseEventInput(item);
        const row = (item ?? {}) as Partial<EventRecord>;
        records.push(
          stripRecurrence({
            id:
              input.id ??
              (typeof row.id === "string" && row.id ? row.id : crypto.randomUUID()),
            title: input.title,
            date: input.date,
            emoji: input.emoji,
            category: input.category,
            note: input.note,
            createdAt: typeof row.createdAt === "string" ? row.createdAt : nowIso(),
            updatedAt: typeof row.updatedAt === "string" ? row.updatedAt : nowIso(),
          }),
        );
      } catch {
        // skip malformed leftover records
      }
    }
    return records;
  } catch {
    return [];
  }
}

function writeAll(events: EventRecord[]): void {
  window.localStorage.setItem(
    LOCAL_STORAGE_KEY,
    JSON.stringify(events.map(stripRecurrence)),
  );
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

export function writeLocalEvents(events: EventRecord[]): void {
  if (typeof window === "undefined") {
    return;
  }
  if (events.length === 0) {
    clearLocalEvents();
    return;
  }
  writeAll(events);
}

export const localStore: EventStore = {
  async list() {
    return sortEvents(readAll());
  },
  async create(input: EventInput) {
    const parsed = parseEventInput(input);
    const now = nowIso();
    const record: EventRecord = {
      id: parsed.id ?? crypto.randomUUID(),
      title: parsed.title,
      date: parsed.date,
      emoji: parsed.emoji,
      category: parsed.category,
      note: parsed.note,
      createdAt: now,
      updatedAt: now,
    };
    const events = readAll();
    events.push(record);
    writeAll(events.map(stripRecurrence));
    return record;
  },
  async update(id, input) {
    const parsed = parseEventInput(input);
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
