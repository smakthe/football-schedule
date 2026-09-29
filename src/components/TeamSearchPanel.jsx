import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import fixtures from '../data/fixtures.json';
import { DISPLAY_ORDER } from '../data/constants.js';
import { TEAM_COMP, TEAM_ALL_COMPS, TEAMS_BY_COMP } from '../data/precomputed.js';
import { searchTeams } from '../utils/search.js';
import Crest from './Crest.jsx';
import CompBadge from './CompBadge.jsx';

function TeamResult({ id, compId, index, onPick }) {
  const hoverComp = fixtures.comps[compId ?? TEAM_COMP[id]];
  return (
    <button
      className="team-result"
      onClick={() => onPick({ id, compId: compId ?? null })}
      style={{ "--hover-color": hoverComp.color2, "--i": index }}
    >
      <Crest teamId={id} size={42} />
      <span className="team-result-name">{fixtures.teams[id]}</span>
    </button>
  );
}

export default function TeamSearchPanel({ onPick, leagueFilter }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const raw = searchTeams(query);
    if (raw && leagueFilter != null) return raw.filter((t) => TEAM_ALL_COMPS[t.id].has(leagueFilter));
    return raw;
  }, [query, leagueFilter]);

  const groups = leagueFilter != null ? [leagueFilter] : DISPLAY_ORDER;

  return (
    <div>
      <div className="search-box">
        <Search size={17} className="search-icon" aria-hidden="true" />
        <input
          type="search"
          className="search-input"
          placeholder="Search clubs…"
          aria-label="Search clubs"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
          autoFocus
        />
        {query && (
          <button className="search-clear" aria-label="Clear search" onClick={() => setQuery("")}>
            <X size={15} aria-hidden="true" />
          </button>
        )}
      </div>

      {results ? (
        results.length ? (
          <div className="team-result-list" aria-live="polite">
            {results.map((t, i) => <TeamResult key={t.id} id={t.id} compId={leagueFilter} index={i} onPick={onPick} />)}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-glyph" aria-hidden="true"><Search size={24} /></div>
            <p className="empty-title">No clubs match &ldquo;{query}&rdquo;</p>
            <p className="empty-sub">Try a shorter name or a different spelling.</p>
          </div>
        )
      ) : (
        groups.map((compId) => {
          const comp = fixtures.comps[compId];
          const teams = TEAMS_BY_COMP[compId];
          return (
            <section key={compId} className="team-browse-group" aria-labelledby={`browse-${compId}`}>
              <div className="group-heading">
                <CompBadge comp={comp} size={22} />
                <h3 id={`browse-${compId}`}>{comp.name}</h3>
                <span className="count">{teams.length} clubs</span>
              </div>
              <div className="team-result-list">
                {teams.map((t, i) => <TeamResult key={t.id} id={t.id} compId={compId} index={i} onPick={onPick} />)}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
