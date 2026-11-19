import { describe, expect, it } from "vitest";

import { NOTE_MAX_LENGTH, eventInputSchema, parseEventInput } from "@/lib/events";

const base = {
  title: "Kaydırak",
  date: "2025-02-14",
  recurrence: "none" as const,
};

describe("note length", () => {
  it("exposes a 1000-character limit", () => {
    expect(NOTE_MAX_LENGTH).toBe(1000);
  });

  it("accepts a note of 1000 characters", () => {
    const note = "a".repeat(NOTE_MAX_LENGTH);
    const parsed = parseEventInput({ ...base, note });
    expect(parsed.note).toBe(note);
    expect(parsed.note).toHaveLength(1000);
  });

  it("rejects a note of 1001 characters", () => {
    const result = eventInputSchema.safeParse({
      ...base,
      note: "a".repeat(NOTE_MAX_LENGTH + 1),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message === "invalid_note")).toBe(
        true,
      );
    }
  });

  it("trims a blank note to null", () => {
    const parsed = parseEventInput({ ...base, note: "   " });
    expect(parsed.note).toBeNull();
  });
});
