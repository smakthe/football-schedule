import React from 'react';
import fixtures from '../data/fixtures.json';
import Crest from './Crest.jsx';

// Reusable component to render a team's crest and name
// `reverse` changes the order (e.g. for away teams)
function TeamLabel({ teamId, size = 32, reverse = false, className = "team-label", direction = "row" }) {
  const content = reverse ? (
    <>
      <Crest teamId={teamId} size={size} />
      <span className={direction === 'col' ? "tf-opp-name" : "team-name"}>{fixtures.teams[teamId]}</span>
    </>
  ) : (
    <>
      <span className={direction === 'col' ? "tf-opp-name" : "team-name"}>{fixtures.teams[teamId]}</span>
      <Crest teamId={teamId} size={size} />
    </>
  );

  return (
    <span className={className} style={{ display: 'flex', alignItems: 'center', gap: direction === 'col' ? '10px' : '8px', flexDirection: direction === 'col' ? 'column' : 'row', minWidth: 0, justifyContent: reverse ? 'flex-start' : 'flex-end' }}>
      {content}
    </span>
  );
}

export default React.memo(TeamLabel);
