import { describe, expect, it } from "vitest";

import {
  daysBetween,
  daysInclusive,
  daysInMonth,
  isLeapYear,
  isYearlyMatch,
  markerDatesInMonth,
  monthGrid,
  mostRecentPastDate,
  nearestFutureDate,
  nextAnniversary,
  nextUpcomingAnniversary,
  calendarYearBounds,
  earliestEventDate,
  todayInTimeZone,
  yearlyOccurrence,
  yearList,
} from "@/lib/dates";
import { anniversaryCaption, elapsedCaption } from "@/lib/labels";
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

describe("leap years and yearly occurrence", () => {
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

describe("elapsed days and yearly anniversaries", () => {
  it("counts calendar days between two dates, 0 on the same day", () => {
    expect(daysBetween("2026-11-19", "2026-11-19")).toBe(0);
    expect(daysBetween("2026-11-19", "2026-11-29")).toBe(10);
    expect(daysBetween("2026-11-29", "2026-11-19")).toBe(-10);
  });

  it("computes the next 1st anniversary 10 days out (Mustafa example)", () => {
    const today = "2026-11-19";
    const anniversary = nextAnniversary("2025-11-29", today);
    expect(anniversary).toEqual({ date: "2026-11-29", years: 1 });
    expect(daysBetween(today, anniversary.date)).toBe(10);
    expect(anniversaryCaption("Kaydırak", anniversary, today)).toBe(
      "Tam 10 gün sonra «Kaydırak» 1. yılı",
    );
  });

  it("returns today when it is the anniversary", () => {
    const today = "2026-11-19";
    const anniversary = nextAnniversary("2025-11-19", today);
    expect(anniversary).toEqual({ date: "2026-11-19", years: 1 });
    expect(anniversaryCaption("Kahve", anniversary, today)).toBe(
      "Bugün «Kahve» 1. yılı",
    );
  });

  it("rolls to next year when this year's occurrence has already passed", () => {
    expect(nextAnniversary("2025-01-01", "2026-11-19")).toEqual({
      date: "2027-01-01",
      years: 2,
    });
  });

  it("uses the Feb 28 fallback for a Feb 29 start in a common year", () => {
    expect(nextAnniversary("2024-02-29", "2026-11-19")).toEqual({
      date: "2027-02-28",
      years: 3,
    });
  });

  it("returns the original date with years 0 when the event is still in the future", () => {
    expect(nextAnniversary("2026-12-01", "2026-11-19")).toEqual({
      date: "2026-12-01",
      years: 0,
    });
  });

  it("describes elapsed time from a past first", () => {
    expect(elapsedCaption("2026-11-18", "2026-11-19")).toBe("Tam 1 gün geçti");
    expect(elapsedCaption("2026-11-19", "2026-11-19")).toBe("Bugün");
    expect(elapsedCaption("2026-11-29", "2026-11-19")).toBe("Tam 10 gün sonra");
  });

  it("picks the most recent past date and the nearest future date", () => {
    const dates = ["2025-11-01", "2026-11-18", "2026-12-01"];
    expect(mostRecentPastDate(dates, "2026-11-19")).toBe("2026-11-18");
    expect(nearestFutureDate(dates, "2026-11-19")).toBe("2026-12-01");
    expect(mostRecentPastDate(["2026-12-01"], "2026-11-19")).toBeNull();
  });

  it("picks the nearest upcoming anniversary across events", () => {
    const events = [
      { date: "2025-11-29", title: "Kaydırak" },
      { date: "2024-01-01", title: "Yılbaşı" },
    ];
    const upcoming = nextUpcomingAnniversary(events, "2026-11-19");
    expect(upcoming?.event.title).toBe("Kaydırak");
    expect(upcoming?.anniversary).toEqual({ date: "2026-11-29", years: 1 });
    expect(upcoming?.daysUntil).toBe(10);
  });

  it("skips a still-future first when looking for an anniversary", () => {
    const events = [{ date: "2026-12-01", title: "Konser" }];
    expect(nextUpcomingAnniversary(events, "2026-11-19")).toBeNull();
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
    expect("recurrence" in parsed).toBe(false);
    expect(() =>
      eventInputSchema.parse({ title: "   ", date: "2026-11-18" }),
    ).toThrow();
  });

  it("rejects impossible calendar dates", () => {
    expect(() =>
      eventInputSchema.parse({ title: "Test", date: "2025-02-29" }),
    ).toThrow();
  });

  it("accepts null optional fields from stored records (migrate)", () => {
    const parsed = eventInputSchema.parse({
      id: "11111111-1111-1111-1111-111111111111",
      title: "İlk el tutma",
      date: "2026-11-10",
      emoji: null,
      category: null,
      note: null,
      recurrence: "none",
    });
    expect(parsed.emoji).toBeNull();
    expect(parsed.category).toBeNull();
    expect(parsed.note).toBeNull();
    expect("recurrence" in parsed).toBe(false);
  });
});

describe("daysInMonth", () => {
  it("returns 29 in Feb 2024 and 28 in Feb 2025", () => {
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2025, 2)).toBe(28);
  });
});

describe("daysInclusive relationship counter", () => {
  it("counts 14 Şubat 2025 as day 1 and 18 Kasım 2026 as 643. gün", () => {
    expect(daysInclusive("2025-02-14", "2026-11-18")).toBe(643);
  });
});

describe("calendar markers", () => {
  it("marks only the original date in the matching month", () => {
    const events = [{ date: "2025-11-18" }];
    expect(markerDatesInMonth(events, 2025, 11).has("2025-11-18")).toBe(true);
    expect(markerDatesInMonth(events, 2026, 11).has("2026-11-18")).toBe(false);
  });
});

describe("calendarYearBounds", () => {
  it("spans from the earliest start or event year to today (or the year in view)", () => {
    const bounds = calendarYearBounds({
      today: "2026-11-18",
      viewingYear: 2026,
      eventDates: ["2024-06-01", "2025-11-18"],
    });
    expect(bounds.minYear).toBe(2024);
    expect(bounds.maxYear).toBe(2036);
    expect(yearList(bounds.minYear, bounds.maxYear)[0]).toBe(2036);
    expect(yearList(bounds.minYear, bounds.maxYear).slice(-3)).toEqual([2026, 2025, 2024]);
  });
});

describe("earliestEventDate", () => {
  it("uses the earliest first for the home day counter (14 Şubat 2025 → 643. gün on 18 Kasım 2026)", () => {
    const earliest = earliestEventDate([
      "2025-11-18",
      "2026-11-15",
      "2025-02-14",
      "2025-03-08",
    ]);
    expect(earliest).toBe("2025-02-14");
    expect(daysInclusive(earliest!, "2026-11-18")).toBe(643);
  });

  it("returns null when there are no events", () => {
    expect(earliestEventDate([])).toBeNull();
  });
});

describe("future event dates", () => {
  it("accepts a date after today", () => {
    const parsed = eventInputSchema.parse({
      title: "İlk konser",
      date: "2027-06-01",
    });
    expect(parsed.date).toBe("2027-06-01");
  });
});
