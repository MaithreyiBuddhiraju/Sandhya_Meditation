import type { JournalEntryWithPairing } from "../types";
import "./JournalList.css";

function formatDate(entryDate: string): string {
  // entryDate is a plain YYYY-MM-DD string — parse as local, not UTC.
  const [year, month, day] = entryDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function JournalList({ entries }: { entries: JournalEntryWithPairing[] }) {
  if (entries.length === 0) {
    return <p className="text-muted journal-list__empty">No entries found.</p>;
  }

  return (
    <ul className="journal-list">
      {entries.map((entry) => (
        <li key={entry.id} className="card journal-list__item">
          <div className="journal-list__meta">
            <span className="journal-list__date">{formatDate(entry.entry_date)}</span>
            {entry.stoic_concept && (
              <span className="journal-list__concept">{entry.stoic_concept}</span>
            )}
          </div>
          <p className="journal-list__text">{entry.reflection_text}</p>
        </li>
      ))}
    </ul>
  );
}
