import React from 'react';
import { M_ROUND } from '../data/constants.js';
import MatchRow from './MatchRow.jsx';
import SectionHeader from './SectionHeader.jsx';

function LeagueSection({ comp, matches, date, onTeamSelect, highlightTeamId, index = 0 }) {
  if (!matches.length) return null;
  const round = matches[0][M_ROUND];

  return (
    <section
      className="league-section"
      style={{ "--league-color": comp.color2, "--i": index }}
      aria-labelledby={`league-${comp.id}-heading`}
    >
      <SectionHeader
        comp={comp}
        headingId={`league-${comp.id}-heading`}
        subtitle={`${round ? `Matchday ${round} · ` : ""}${matches.length} ${matches.length === 1 ? "match" : "matches"}`}
      />
      <div className="match-list">
        {matches.map((m, i) => (
          <MatchRow key={i} m={m} date={date} onTeamSelect={onTeamSelect} highlightTeamId={highlightTeamId} />
        ))}
      </div>
    </section>
  );
}

export default React.memo(LeagueSection);
