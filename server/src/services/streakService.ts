import { db } from "../db/connection.js";

export type DiyaState = "lit" | "grace" | "missed" | "future";

export interface DayState {
  date: string;
  state: DiyaState;
  isToday: boolean;
}

export interface StreakSummary {
  current_streak: number;
  longest_streak: number;
  week: DayState[];
}

// --- Pure date helpers (no DB, no Date.now() — always take dates as input) ---

/** Parses a 'YYYY-MM-DD' string as a LOCAL date, never UTC. */
export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** Monday of the ISO week (Mon–Sun) containing `date`. */
export function mondayOf(date: Date): Date {
  const dayOfWeek = date.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  return addDays(date, -daysSinceMonday);
}

/** A stable per-week key (that week's Monday), used to scope the one grace token. */
function weekKey(date: Date): string {
  return formatDate(mondayOf(date));
}

// --- Pure streak algorithm ---

/**
 * Walks from the earliest active date through yesterday, tracking the current
 * run and the longest run seen. Each ISO week gets exactly one grace token:
 * the first inactive day in a week is forgiven (run continues); a second
 * inactive day in the same week breaks the run. Today is never treated as
 * "missed" just because it hasn't happened yet — only days through yesterday
 * can break a streak. If today is active, it extends the current run by one.
 */
export function computeStreakData(
  activeDates: Set<string>,
  todayStr: string
): { currentStreak: number; longestStreak: number } {
  let currentRun = 0;
  let longestRun = 0;

  if (activeDates.size > 0) {
    const earliestStr = [...activeDates].sort()[0];
    const earliest = parseDateString(earliestStr);
    const today = parseDateString(todayStr);
    const yesterday = addDays(today, -1);
    const graceUsedForWeek = new Set<string>();

    for (let d = earliest; d.getTime() <= yesterday.getTime(); d = addDays(d, 1)) {
      const dStr = formatDate(d);
      const wk = weekKey(d);
      if (activeDates.has(dStr)) {
        currentRun++;
      } else if (!graceUsedForWeek.has(wk)) {
        graceUsedForWeek.add(wk); // forgiven — run continues untouched
      } else {
        currentRun = 0; // grace already spent this week — real break
      }
      longestRun = Math.max(longestRun, currentRun);
    }
  }

  const currentStreak = activeDates.has(todayStr) ? currentRun + 1 : currentRun;
  longestRun = Math.max(longestRun, currentStreak);

  return { currentStreak, longestStreak: longestRun };
}

/**
 * Per-day states for the current ISO week (Monday–Sunday), for the diya row.
 * Grace scoping only needs this week's own Monday-to-today walk — an earlier
 * week's grace token has no bearing on this week's.
 */
export function computeWeekView(activeDates: Set<string>, todayStr: string): DayState[] {
  const today = parseDateString(todayStr);
  const monday = mondayOf(today);
  const days: DayState[] = [];
  let graceUsedInWeek = false;

  for (let i = 0; i < 7; i++) {
    const d = addDays(monday, i);
    const dStr = formatDate(d);
    const isToday = dStr === todayStr;

    let state: DiyaState;
    if (d.getTime() > today.getTime()) {
      state = "future";
    } else if (activeDates.has(dStr)) {
      state = "lit";
    } else if (isToday) {
      // Today-in-progress: not yet active, but not "missed" either.
      state = "future";
    } else if (!graceUsedInWeek) {
      graceUsedInWeek = true;
      state = "grace";
    } else {
      state = "missed";
    }

    days.push({ date: dStr, state, isToday });
  }

  return days;
}

// --- DB-backed summary ---

function getActiveDates(): Set<string> {
  const journalDates = db
    .prepare("SELECT DISTINCT entry_date FROM journal_entries")
    .all() as { entry_date: string }[];
  const thoughtDates = db
    .prepare("SELECT DISTINCT entry_date FROM sorted_thoughts")
    .all() as { entry_date: string }[];
  return new Set([
    ...journalDates.map((r) => r.entry_date),
    ...thoughtDates.map((r) => r.entry_date),
  ]);
}

export function getStreakSummary(todayStr: string): StreakSummary {
  const activeDates = getActiveDates();
  const { currentStreak, longestStreak } = computeStreakData(activeDates, todayStr);
  const week = computeWeekView(activeDates, todayStr);
  return { current_streak: currentStreak, longest_streak: longestStreak, week };
}
