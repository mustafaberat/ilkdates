import { and, asc, eq } from "drizzle-orm";

import { events, type EventRow } from "@/db/schema";
import { getDb } from "@/lib/db";
import {
  parseEventInput,
  type EventParsed,
  type EventRecord,
} from "@/lib/events";

function toRecord(row: EventRow): EventRecord {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    emoji: row.emoji,
    category: row.category,
    recurrence: row.recurrence,
    note: row.note,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listEvents(userId: string): Promise<EventRecord[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(events)
    .where(eq(events.userId, userId))
    .orderBy(asc(events.date), asc(events.createdAt));
  return rows.map(toRecord);
}

export async function createEvent(
  userId: string,
  raw: unknown,
): Promise<EventRecord> {
  const input = parseEventInput(raw);
  const db = getDb();
  const values = {
    userId,
    title: input.title,
    date: input.date,
    emoji: input.emoji,
    category: input.category,
    recurrence: input.recurrence,
    note: input.note,
    ...(input.id ? { id: input.id } : {}),
  };
  const [row] = await db.insert(events).values(values).returning();
  if (!row) {
    throw new Error("error_generic");
  }
  return toRecord(row);
}

export async function updateEvent(
  userId: string,
  id: string,
  raw: unknown,
): Promise<EventRecord> {
  const input = parseEventInput(raw);
  const db = getDb();
  const [row] = await db
    .update(events)
    .set({
      title: input.title,
      date: input.date,
      emoji: input.emoji,
      category: input.category,
      recurrence: input.recurrence,
      note: input.note,
      updatedAt: new Date(),
    })
    .where(and(eq(events.id, id), eq(events.userId, userId)))
    .returning();
  if (!row) {
    throw new Error("not_found");
  }
  return toRecord(row);
}

export async function deleteEvent(userId: string, id: string): Promise<void> {
  const db = getDb();
  const deleted = await db
    .delete(events)
    .where(and(eq(events.id, id), eq(events.userId, userId)))
    .returning({ id: events.id });
  if (deleted.length === 0) {
    throw new Error("not_found");
  }
}

export type MigrateResult = {
  events: EventRecord[];
  imported: number;
};

export async function migrateEvents(
  userId: string,
  rawEvents: unknown[],
): Promise<MigrateResult> {
  const existing = await listEvents(userId);
  const existingIds = new Set(existing.map((event) => event.id));
  let imported = 0;
  for (const raw of rawEvents) {
    let parsed: EventParsed;
    try {
      parsed = parseEventInput(raw);
    } catch {
      continue;
    }
    if (parsed.id && existingIds.has(parsed.id)) {
      continue;
    }
    const created = await createEvent(userId, parsed);
    existingIds.add(created.id);
    imported += 1;
  }
  return { events: await listEvents(userId), imported };
}
