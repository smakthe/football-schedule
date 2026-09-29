import { Copy, Download, Check, CalendarCheck } from 'lucide-react';
import { dateHeadline, relativeDayLabel } from '../utils/dates.js';

export default function DayHeader({
  date, today, totalMatches, activeLeagueCount, copied, onCopy, onExport, onToday,
}) {
  const isToday = date === today;
  const isEmpty = totalMatches === 0;

  return (
    <div className="day-header">
      <div className="day-header-text">
        <div className="day-kicker">
          <span className={isToday ? "is-today" : undefined}>{relativeDayLabel(date, today)}</span>
        </div>
        <h1 className="headline">{dateHeadline(date)}</h1>
        <p className="summary-line" aria-live="polite">
          {isEmpty
            ? "No matches scheduled"
            : <><b>{totalMatches}</b> {totalMatches === 1 ? "match" : "matches"} across <b>{activeLeagueCount}</b> {activeLeagueCount === 1 ? "league" : "leagues"}</>}
        </p>
      </div>
      <div className="day-actions">
        {!isToday && (
          <button className="btn primary" onClick={onToday}>
            <CalendarCheck size={15} aria-hidden="true" /> Today
          </button>
        )}
        {!isEmpty && (
          <div className="btn-group">
            <button className="btn icon" onClick={onCopy} aria-label="Copy day's schedule" title="Copy day">
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
            <button className="btn icon" onClick={onExport} aria-label="Export day to calendar" title="Export day (.ics)">
              <Download size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
