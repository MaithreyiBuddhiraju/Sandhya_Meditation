import { describe, expect, it } from "vitest";
import { computeStreakData, computeWeekView } from "./streakService.js";

// Reference calendar for these fixtures: 2026-06-01 is a Monday, so
// Week 1 = Jun 1 (Mon) .. Jun 7 (Sun), Week 2 = Jun 8 (Mon) .. Jun 14 (Sun).

describe("computeStreakData", () => {
  it("returns zero streaks with no activity at all", () => {
    const result = computeStreakData(new Set(), "2026-06-10");
    expect(result).toEqual({ currentStreak: 0, longestStreak: 0 });
  });

  it("counts today as a streak of one when it's the only activity", () => {
    const result = computeStreakData(new Set(["2026-06-10"]), "2026-06-10");
    expect(result).toEqual({ currentStreak: 1, longestStreak: 1 });
  });

  it("forgives exactly one gap per week (grace boundary) and keeps the run alive", () => {
    // Mon,Tue,Wed active; Thu skipped (grace); Fri,Sat,Sun active; today (next Mon) active.
    const activeDates = new Set([
      "2026-06-01",
      "2026-06-02",
      "2026-06-03",
      // 2026-06-04 skipped — forgiven
      "2026-06-05",
      "2026-06-06",
      "2026-06-07",
      "2026-06-08",
    ]);
    const result = computeStreakData(activeDates, "2026-06-08");
    expect(result).toEqual({ currentStreak: 7, longestStreak: 7 });
  });

  it("breaks the run on a second gap in the same week", () => {
    // Mon active; Tue skipped (grace used); Wed skipped (grace spent -> break);
    // Thu, Fri active; today (Sat) active.
    const activeDates = new Set([
      "2026-06-01", // Mon
      // 06-02 Tue skipped — forgiven
      // 06-03 Wed skipped — grace already spent, breaks run
      "2026-06-04", // Thu
      "2026-06-05", // Fri
      "2026-06-06", // Sat (today)
    ]);
    const result = computeStreakData(activeDates, "2026-06-06");
    expect(result).toEqual({ currentStreak: 3, longestStreak: 3 });
  });

  it("retains the longest streak after a later break drops the current streak", () => {
    // Full week 1 active (7-day run), then two gaps in week 2 break it,
    // recovering to only 1 day by the time "today" (inactive) arrives.
    const activeDates = new Set([
      "2026-06-01",
      "2026-06-02",
      "2026-06-03",
      "2026-06-04",
      "2026-06-05",
      "2026-06-06",
      "2026-06-07",
      // 06-08 Mon skipped — forgiven (week 2's grace)
      // 06-09 Tue skipped — grace already spent, breaks run
      "2026-06-10", // Wed
    ]);
    const result = computeStreakData(activeDates, "2026-06-11"); // today (Thu) inactive
    expect(result).toEqual({ currentStreak: 1, longestStreak: 7 });
  });

  it("does not treat an inactive today as a break", () => {
    const activeDates = new Set(["2026-06-01", "2026-06-02", "2026-06-03"]);
    const result = computeStreakData(activeDates, "2026-06-04"); // today inactive, no gap yet
    // Today isn't active, but it also hasn't consumed the week's grace or broken
    // anything — the run from Mon-Wed simply hasn't been extended yet.
    expect(result).toEqual({ currentStreak: 3, longestStreak: 3 });
  });
});

describe("computeWeekView", () => {
  it("marks lit, grace, lit(today), and future days correctly across the week", () => {
    const activeDates = new Set(["2026-06-08", "2026-06-10"]); // Mon active, Wed (today) active
    const week = computeWeekView(activeDates, "2026-06-10");
    expect(week).toEqual([
      { date: "2026-06-08", state: "lit", isToday: false }, // Mon
      { date: "2026-06-09", state: "grace", isToday: false }, // Tue — first gap, forgiven
      { date: "2026-06-10", state: "lit", isToday: true }, // Wed — today, active
      { date: "2026-06-11", state: "future", isToday: false }, // Thu
      { date: "2026-06-12", state: "future", isToday: false }, // Fri
      { date: "2026-06-13", state: "future", isToday: false }, // Sat
      { date: "2026-06-14", state: "future", isToday: false }, // Sun
    ]);
  });

  it("marks a second same-week gap as missed, and an inactive today as future (not missed)", () => {
    const activeDates = new Set(["2026-06-08"]); // only Mon active
    const week = computeWeekView(activeDates, "2026-06-11"); // today = Thu, inactive
    expect(week).toEqual([
      { date: "2026-06-08", state: "lit", isToday: false }, // Mon
      { date: "2026-06-09", state: "grace", isToday: false }, // Tue — forgiven
      { date: "2026-06-10", state: "missed", isToday: false }, // Wed — grace spent
      { date: "2026-06-11", state: "future", isToday: true }, // Thu (today) — pending, not missed
      { date: "2026-06-12", state: "future", isToday: false },
      { date: "2026-06-13", state: "future", isToday: false },
      { date: "2026-06-14", state: "future", isToday: false },
    ]);
  });
});
