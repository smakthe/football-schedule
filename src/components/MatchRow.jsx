import React from 'react';
import fixtures from '../data/fixtures.json';
import { M_HOME, M_AWAY, M_TIME, M_COMP, M_ROUND } from '../data/constants.js';
import { rivalryLabel } from '../data/precomputed.js';
import { matchToVEvent, buildICS, downloadICS } from '../utils/ics.js';
import Crest from './Crest.jsx';
import { KickoffTime } from './KickoffTime.jsx';

function MatchRow({ m, date, onTeamSelect }) {
  const homeId = m[M_HOME], awayId = m[M_AWAY], time = m[M_TIME], compId = m[M_COMP];
  const riv = rivalryLabel(homeId, awayId);
  
  function exportMatch(e) {
    e.stopPropagation();
    const comp = fixtures.comps[compId];
    const vevent = matchToVEvent({
      dateISO: date, compName: comp.name, homeName: fixtures.teams[homeId], awayName: fixtures.teams[awayId], time, round: m[M_ROUND], compId,
    });
    downloadICS(`${fixtures.teams[homeId]}-vs-${fixtures.teams[awayId]}.ics`.replace(/[^A-Za-z0-9.-]+/g, "-"), buildICS([vevent]));
  }
  
  return (
    <div className={"match-row" + (riv ? " rivalry" : "")}>
      <button className="team home" onClick={() => onTeamSelect(homeId)}>
        <span className="team-name">{fixtures.teams[homeId]}</span>
        <Crest teamId={homeId} />
      </button>
      <div className="kickoff">
        {riv && <span className="rivalry-tag">&#9733; {riv}</span>}
        <KickoffTime dateISO={date} time={time} compId={compId} />
        <button className="row-export-btn" aria-label={`Add ${fixtures.teams[homeId]} vs ${fixtures.teams[awayId]} to calendar`} onClick={exportMatch}>&#128197;</button>
      </div>
      <button className="team away" onClick={() => onTeamSelect(awayId)}>
        <Crest teamId={awayId} />
        <span className="team-name">{fixtures.teams[awayId]}</span>
      </button>
    </div>
  );
}

export default React.memo(MatchRow);
