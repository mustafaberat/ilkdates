import { z } from "zod";

import {
  DATE_RE,
  isValidYmd,
  parseISODate,
} from "@/lib/dates";

export const NOTE_MAX_LENGTH = 1000;

export type EventRecord = {
  id: string;
  title: string;
  date: string;
  emoji: string | null;
  category: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

const isoDateSchema = z
  .string()
  .regex(DATE_RE, "invalid_date")
  .refine((value) => {
    const y = Number(value.slice(0, 4));
    const m = Number(value.slice(5, 7));
    const d = Number(value.slice(8, 10));
    return isValidYmd(y, m, d);
  }, "invalid_date");

export const eventInputSchema = z.object({
  id: z.string().uuid().optional(),
  title: z
    .string()
    .transform((value) => value.replace(/\s+/g, " ").trim())
    .pipe(z.string().min(1, "invalid_title").max(80, "invalid_title")),
  date: isoDateSchema,
  emoji: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => (value ?? "").trim())
    .pipe(z.string().max(16, "invalid_emoji"))
    .transform((value) => (value ? value : null)),
  category: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => (value ?? "").replace(/\s+/g, " ").trim())
    .pipe(z.string().max(40, "invalid_category"))
    .transform((value) => (value ? value : null)),
  note: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => (value ?? "").trim())
    .pipe(z.string().max(NOTE_MAX_LENGTH, "invalid_note"))
    .transform((value) => (value ? value : null)),
});

export type EventInput = z.input<typeof eventInputSchema>;
export type EventParsed = z.output<typeof eventInputSchema>;

export function parseEventInput(raw: unknown): EventParsed {
  return eventInputSchema.parse(raw);
}

export function sortEvents(events: EventRecord[]): EventRecord[] {
  return [...events].sort((a, b) => {
    if (a.date !== b.date) {
      return a.date < b.date ? -1 : 1;
    }
    return a.createdAt < b.createdAt ? -1 : 1;
  });
}

export function datesInMonth(
  events: EventRecord[],
  year: number,
  month: number,
): Set<string> {
  const prefix = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-`;
  return new Set(events.filter((event) => event.date.startsWith(prefix)).map((event) => event.date));
}

export { parseISODate };
