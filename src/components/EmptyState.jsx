import { ChevronLeft, ChevronRight } from 'lucide-react';
import fixtures from '../data/fixtures.json';
import { adjacentMatchDate } from '../data/precomputed.js';
import { shortDate } from '../utils/dates.js';

export default function EmptyState({ date, leagueFilter, onPick }) {
  const prev = adjacentMatchDate(date, -1, leagueFilter);
  const next = adjacentMatchDate(date, 1, leagueFilter);
  const scope = leagueFilter != null ? fixtures.comps[leagueFilter].name : "the top five leagues";

  return (
    <div className="empty-state">
      <div className="empty-glyph" aria-hidden="true">&#9917;</div>
      <p className="empty-title">No matches on this date</p>
      <p className="empty-sub">Nothing scheduled in {scope}. Jump straight to the nearest match day.</p>
      <div className="empty-actions">
        {prev && (
          <button className="btn" onClick={() => onPick(prev)}>
            <ChevronLeft size={15} aria-hidden="true" /> {shortDate(prev)}
          </button>
        )}
        {next && (
          <button className="btn primary" onClick={() => onPick(next)}>
            {shortDate(next)} <ChevronRight size={15} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
