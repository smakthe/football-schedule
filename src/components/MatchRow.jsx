import React from 'react';
import fixtures from '../data/fixtures.json';
import { M_HOME, M_AWAY, M_TIME, M_COMP, M_ROUND } from '../data/constants.js';
import { rivalryLabel } from '../data/precomputed.js';
import { getThemeAccent } from '../config/leagueThemes.js';
import { exportSingleMatch } from '../utils/ics.js';
import { Download } from 'lucide-react';
import Crest from './Crest.jsx';
import { KickoffTime } from './KickoffTime.jsx';

function MatchRow({ m, date, onTeamSelect }) {
  const homeId = m[M_HOME], awayId = m[M_AWAY], time = m[M_TIME], compId = m[M_COMP];
  const riv = rivalryLabel(homeId, awayId);
  const isUcl = compId === 'ucl';
  const showLeague = compId !== null && !isUcl;
  
  function exportMatch(e) {
    e.stopPropagation();
    exportSingleMatch(m, date);
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
        <button className="row-export-btn" aria-label={`Add ${fixtures.teams[homeId]} vs ${fixtures.teams[awayId]} to calendar`} title="Export match" onClick={exportMatch}>
          <Download size={14} />
        </button>
      </div>
      <button className="team away" onClick={() => onTeamSelect(awayId)}>
        <Crest teamId={awayId} />
        <span className="team-name">{fixtures.teams[awayId]}</span>
        {showLeague && (
          <span className="league-badge" style={{ color: getThemeAccent(compId) }}>{fixtures.comps[compId].short}</span>
        )}
      </button>
    </div>
  );
}

export default React.memo(MatchRow);
