import { useState, useMemo } from 'react';
import fixtures from '../data/fixtures.json';
import { DISPLAY_ORDER } from '../data/constants.js';
import { TEAM_COMP, TEAM_ALL_COMPS, TEAMS_BY_COMP } from '../data/precomputed.js';
import { getThemeAccent } from '../config/leagueThemes.js';
import { searchTeams } from '../utils/search.js';
import Crest from './Crest.jsx';

function TeamResultRow({ id, compId, onPick }) {
  const primaryCompId = TEAM_COMP[id];
  const hoverComp = fixtures.comps[compId ?? primaryCompId];
  return (
    <button className="team-result" onClick={() => onPick({ id, compId: compId ?? null })} style={{ "--hover-color": hoverComp.color2 }}>
      <Crest teamId={id} size={42} />
      <span className="team-result-name">{fixtures.teams[id]}</span>
    </button>
  );
}

export default function TeamSearchPanel({ onPick, leagueFilter }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const raw = searchTeams(query);
    if (raw && leagueFilter != null) return raw.filter(t => TEAM_ALL_COMPS[t.id].has(leagueFilter));
    return raw;
  }, [query, leagueFilter]);
  
  return (
    <div className="calendar-view">
      <div className="search-box">
        <input
          type="text"
          className="search-input"
          placeholder="Search clubs…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        {query && <button className="search-clear" aria-label="Clear search" onClick={() => setQuery("")}>&times;</button>}
      </div>
      {results ? (
        results.length ? (
          <div className="team-result-list">
            {results.map((t) => <TeamResultRow key={t.id} id={t.id} compId={leagueFilter} onPick={onPick} />)}
          </div>
        ) : (
          <p className="empty-sub" style={{ textAlign: "center", marginTop: 24 }}>No teams match &ldquo;{query}&rdquo;.</p>
        )
      ) : (
        (leagueFilter != null ? [leagueFilter] : DISPLAY_ORDER).map((compId) => (
          <div key={compId} className="team-browse-group">
            <div className="team-browse-heading" style={{ 
              background: `linear-gradient(135deg, ${getThemeAccent(compId)}, ${fixtures.comps[compId].color})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>{fixtures.comps[compId].name}</div>
            <div className="team-result-list">
              {TEAMS_BY_COMP[compId].map((t) => <TeamResultRow key={t.id} id={t.id} compId={compId} onPick={onPick} />)}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
