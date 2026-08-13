import React from 'react';
import fixtures from '../data/fixtures.json';
import { M_HOME, M_AWAY, M_TIME, M_COMP } from '../data/constants.js';
import { rivalryLabel } from '../data/precomputed.js';
import { exportSingleMatch } from '../utils/ics.js';
import { copyText, buildMatchShareText } from '../utils/clipboard.js';
import { Download, Copy, Check } from 'lucide-react';
import Crest from './Crest.jsx';
import { KickoffTime } from './KickoffTime.jsx';

function MatchRow({ m, date, onTeamSelect }) {
  const homeId = m[M_HOME], awayId = m[M_AWAY], time = m[M_TIME], compId = m[M_COMP];
  const riv = rivalryLabel(homeId, awayId);
  const [copied, setCopied] = React.useState(false);
  
  function exportMatch(e) {
    e.stopPropagation();
    exportSingleMatch(m, date);
  }

  async function handleCopyMatch(e) {
    e.stopPropagation();
    const text = buildMatchShareText(m, date);
    const ok = await copyText(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }
  
  return (
    <div className={"match-row" + (riv ? " rivalry" : "")}>
      <button className="team home" onClick={() => onTeamSelect(homeId)}>
        <span className="team-name">{fixtures.teams[homeId]}</span>
        <Crest teamId={homeId} size={32} />
      </button>
      <div className="kickoff">
        {riv && <span className="rivalry-tag">&#9733; {riv}</span>}
        <KickoffTime dateISO={date} time={time} compId={compId} />
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="row-export-btn" aria-label="Copy match details" title="Copy" onClick={handleCopyMatch}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          <button className="row-export-btn" aria-label={`Add ${fixtures.teams[homeId]} vs ${fixtures.teams[awayId]} to calendar`} title="Export" onClick={exportMatch}>
            <Download size={14} />
          </button>
        </div>
      </div>
      <button className="team away" onClick={() => onTeamSelect(awayId)}>
        <Crest teamId={awayId} size={32} />
        <span className="team-name">{fixtures.teams[awayId]}</span>
      </button>
    </div>
  );
}

export default React.memo(MatchRow);
