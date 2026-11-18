import { describe, expect, it } from "vitest";

import {
  daysInclusive,
  daysInMonth,
  isLeapYear,
  isMonthlyMatch,
  isYearlyMatch,
  monthGrid,
  monthsBetween,
  occurrenceDay,
  todayInTimeZone,
  todayMatch,
  yearlyOccurrence,
  yearsBetween,
} from "@/lib/dates";
import { eventInputSchema } from "@/lib/events";

describe("daysInclusive", () => {
  it("counts the start date as day 1", () => {
    expect(daysInclusive("2025-10-02", "2025-10-02")).toBe(1);
    expect(daysInclusive("2025-10-02", "2025-10-03")).toBe(2);
  });

  it("counts a long span inclusively (412th day example)", () => {
    // 411 days later is the 412th day.
    expect(daysInclusive("2025-10-02", "2026-11-18")).toBe(413);
    expect(daysInclusive("2025-10-03", "2026-11-18")).toBe(412);
  });
});

describe("leap years and yearly recurrence", () => {
  it("detects leap years", () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2025)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(1900)).toBe(false);
  });

  it("falls Feb 29 back to Feb 28 in common years", () => {
    expect(yearlyOccurrence("2024-02-29", 2025)).toBe("2025-02-28");
    expect(yearlyOccurrence("2024-02-29", 2028)).toBe("2028-02-29");
  });

  it("matches yearly anniversaries, including the Feb 29 fallback", () => {
    expect(isYearlyMatch("2024-02-29", "2025-02-28")).toBe(true);
    expect(isYearlyMatch("2024-02-29", "2025-02-27")).toBe(false);
    expect(isYearlyMatch("2023-11-18", "2026-11-18")).toBe(true);
    expect(isYearlyMatch("2023-11-18", "2026-11-17")).toBe(false);
  });

  it("does not treat a Feb 28 event as a Feb 29 fallback", () => {
    expect(isYearlyMatch("2023-02-28", "2024-02-29")).toBe(false);
    expect(isYearlyMatch("2023-02-28", "2024-02-28")).toBe(true);
  });
});

describe("monthly recurrence", () => {
  it("matches the same day of month", () => {
    expect(isMonthlyMatch("2024-01-15", "2024-02-15")).toBe(true);
    expect(isMonthlyMatch("2024-01-15", "2024-02-14")).toBe(false);
  });

  it("clamps the 31st to the last day of shorter months", () => {
    expect(occurrenceDay(2024, 2, 31)).toBe(29);
    expect(occurrenceDay(2025, 2, 31)).toBe(28);
    expect(occurrenceDay(2024, 4, 31)).toBe(30);
    expect(isMonthlyMatch("2024-01-31", "2024-02-29")).toBe(true);
    expect(isMonthlyMatch("2024-01-31", "2024-04-30")).toBe(true);
    expect(isMonthlyMatch("2024-01-31", "2024-04-29")).toBe(false);
    expect(isMonthlyMatch("2024-01-31", "2024-03-31")).toBe(true);
  });
});

describe("todayMatch highlights", () => {
  it("highlights the original date as start, even with yearly recurrence", () => {
    expect(todayMatch("2026-11-18", "yearly", "2026-11-18")).toEqual({
      kind: "start",
      days: 1,
    });
  });

  it("highlights a yearly anniversary and reports elapsed years", () => {
    expect(todayMatch("2023-11-18", "yearly", "2026-11-18")).toEqual({
      kind: "yearly",
      days: daysInclusive("2023-11-18", "2026-11-18"),
      years: 3,
    });
    expect(yearsBetween("2023-11-18", "2026-11-18")).toBe(3);
  });

  it("highlights a monthly anniversary and reports elapsed months", () => {
    expect(todayMatch("2024-01-18", "monthly", "2024-11-18")).toEqual({
      kind: "monthly",
      days: daysInclusive("2024-01-18", "2024-11-18"),
      months: 10,
    });
    expect(monthsBetween("2024-01-18", "2024-11-18")).toBe(10);
  });

  it("prefers yearly over monthly when both would match", () => {
    const match = todayMatch("2023-11-18", "yearly", "2026-11-18");
    expect(match?.kind).toBe("yearly");
  });

  it("does not highlight later years or months when recurrence is none", () => {
    expect(todayMatch("2023-11-18", "none", "2026-11-18")).toBeNull();
    expect(todayMatch("2023-11-18", "none", "2023-12-18")).toBeNull();
  });

  it("returns null for events that start after today", () => {
    expect(todayMatch("2026-11-19", "yearly", "2026-11-18")).toBeNull();
  });
});

describe("monthGrid", () => {
  it("starts the week on Monday and pads the first of November 2026 (Sunday)", () => {
    const grid = monthGrid(2026, 11);
    // 1 Nov 2026 is Sunday → 6 leading blanks, then 30 days.
    expect(grid.slice(0, 6).every((cell) => cell === null)).toBe(true);
    expect(grid[6]).toEqual({ y: 2026, m: 11, d: 1 });
    expect(grid.filter(Boolean)).toHaveLength(30);
    expect(grid.length % 7).toBe(0);
  });
});

describe("todayInTimeZone", () => {
  it("formats a known instant in Europe/Istanbul", () => {
    const noonUtc = new Date("2026-11-18T09:00:00.000Z");
    expect(todayInTimeZone("Europe/Istanbul", noonUtc)).toBe("2026-11-18");
  });

  it("rolls to the next Istanbul day after midnight UTC+3", () => {
    const justBefore = new Date("2026-11-17T20:59:00.000Z");
    const justAfter = new Date("2026-11-17T21:00:00.000Z");
    expect(todayInTimeZone("Europe/Istanbul", justBefore)).toBe("2026-11-17");
    expect(todayInTimeZone("Europe/Istanbul", justAfter)).toBe("2026-11-18");
  });
});

describe("event validation", () => {
  it("trims the title and rejects an empty one", () => {
    const parsed = eventInputSchema.parse({
      title: "  İlk el tutma  ",
      date: "2026-11-18",
      recurrence: "yearly",
    });
    expect(parsed.title).toBe("İlk el tutma");
    expect(() =>
      eventInputSchema.parse({ title: "   ", date: "2026-11-18" }),
    ).toThrow();
  });

  it("rejects impossible calendar dates", () => {
    expect(() =>
      eventInputSchema.parse({ title: "Test", date: "2025-02-29" }),
    ).toThrow();
  });
});

describe("daysInMonth", () => {
  it("returns 29 in Feb 2024 and 28 in Feb 2025", () => {
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2025, 2)).toBe(28);
  });
});
