import React, { useState, useMemo } from 'react';
import fixtures from '../data/fixtures.json';
import { DISPLAY_ORDER } from '../data/constants.js';
import { TEAM_COMP, TEAMS_BY_COMP } from '../data/precomputed.js';
import { LEAGUE_THEMES } from '../config/leagueThemes.js';
import { searchTeams } from '../utils/search.js';
import Crest from './Crest.jsx';

function TeamResultRow({ id, onPick }) {
  const compId = TEAM_COMP[id];
  const comp = fixtures.comps[compId];
  return (
    <button className="team-result" onClick={() => onPick(id)}>
      <Crest teamId={id} size={28} />
      <span className="team-result-name">{fixtures.teams[id]}</span>
      <span className="team-result-comp" style={{ color: comp.color2 }}>{comp.short}</span>
    </button>
  );
}

export default function TeamSearchPanel({ onPick, leagueFilter }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const raw = searchTeams(query);
    if (raw && leagueFilter != null) return raw.filter(t => TEAM_COMP[t.id] === leagueFilter);
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
            {results.map((t) => <TeamResultRow key={t.id} id={t.id} onPick={onPick} />)}
          </div>
        ) : (
          <p className="empty-sub" style={{ textAlign: "center", marginTop: 24 }}>No teams match &ldquo;{query}&rdquo;.</p>
        )
      ) : (
        (leagueFilter != null ? [leagueFilter] : DISPLAY_ORDER).map((compId) => (
          <div key={compId} className="team-browse-group">
            <div className="team-browse-heading" style={{ color: LEAGUE_THEMES[compId].colors.secondary }}>{fixtures.comps[compId].name}</div>
            <div className="team-result-list">
              {TEAMS_BY_COMP[compId].map((t) => <TeamResultRow key={t.id} id={t.id} onPick={onPick} />)}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
