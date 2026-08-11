import React from 'react';
import { M_ROUND } from '../data/constants.js';
import CompBadge from './CompBadge.jsx';
import MatchRow from './MatchRow.jsx';

export default function LeagueSection({ comp, matches, date, onTeamSelect }) {
  if (!matches.length) return null;
  const round = matches[0][M_ROUND];
  
  return (
    <section className="league-section" style={{ "--accent": comp.color, "--accent2": comp.color2 }}>
      <div className="league-header">
        <CompBadge comp={comp} />
        <div className="league-title">
          <h2>{comp.name}</h2>
          <span className="league-sub">
            {round ? `Matchday ${round} \u00b7 ` : ""}{matches.length} {matches.length === 1 ? "match" : "matches"}
          </span>
        </div>
      </div>
      <div className="match-list">
        {matches.map((m, i) => <MatchRow key={i} m={m} date={date} onTeamSelect={onTeamSelect} />)}
      </div>
    </section>
  );
}
