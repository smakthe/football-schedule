import React from 'react';
import { M_ROUND } from '../data/constants.js';
import MatchRow from './MatchRow.jsx';
import SectionHeader from './SectionHeader.jsx';

function LeagueSection({ comp, matches, date, onTeamSelect }) {
  if (!matches.length) return null;
  const round = matches[0][M_ROUND];
  
  return (
    <section className="league-section" style={{ "--accent": comp.color, "--accent2": comp.color2 }}>
      <SectionHeader 
        comp={comp} 
        subtitle={`${round ? `Matchday ${round} \u00b7 ` : ""}${matches.length} ${matches.length === 1 ? "match" : "matches"}`} 
      />
      <div className="match-list">
        {matches.map((m, i) => <MatchRow key={i} m={m} date={date} onTeamSelect={onTeamSelect} />)}
      </div>
    </section>
  );
}

export default React.memo(LeagueSection);
