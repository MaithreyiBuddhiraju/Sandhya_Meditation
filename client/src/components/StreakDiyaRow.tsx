import type { DayState, StreakSummary } from "../types";
import "./StreakDiyaRow.css";

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function DiyaIcon({ day }: { day: DayState }) {
  return (
    <svg viewBox="0 0 24 24" className={`diya diya--${day.state}`} aria-hidden="true">
      {/* Lamp base */}
      <path d="M4 18c0 2.5 3.6 4 8 4s8-1.5 8-4-3.6-3-8-3-8 0.5-8 3z" className="diya__base" />
      {/* Flame */}
      <path
        d="M12 3c-1.6 2.4-3 4.4-3 6.7A3 3 0 0 0 12 12.7a3 3 0 0 0 3-3C15 7.4 13.6 5.4 12 3z"
        className="diya__flame"
      />
    </svg>
  );
}

export function StreakDiyaRow({ summary }: { summary: StreakSummary }) {
  return (
    <div className="card streak-card">
      <div className="streak-card__counts">
        <div className="streak-card__count">
          <span className="streak-card__count-number">{summary.current_streak}</span>
          <span className="streak-card__count-label">Current streak</span>
        </div>
        <div className="streak-card__count">
          <span className="streak-card__count-number">{summary.longest_streak}</span>
          <span className="streak-card__count-label">Longest streak</span>
        </div>
      </div>
      <div className="streak-card__week" role="img" aria-label="This week's practice">
        {summary.week.map((day, i) => (
          <div key={day.date} className={day.isToday ? "streak-day streak-day--today" : "streak-day"}>
            <DiyaIcon day={day} />
            <span className="streak-day__label">{WEEKDAY_LABELS[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
