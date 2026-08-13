import React from 'react';
import fixtures from '../data/fixtures.json';
import { M_HOME, M_AWAY, M_TIME, M_COMP } from '../data/constants.js';
import { rivalryLabel } from '../data/precomputed.js';
import { exportSingleMatch } from '../utils/ics.js';
import { buildMatchShareText } from '../utils/clipboard.js';
import { useClipboard } from '../hooks/useClipboard.js';
import { Download, Copy, Check } from 'lucide-react';
import TeamLabel from './TeamLabel.jsx';
import { KickoffTime } from './KickoffTime.jsx';

function MatchRow({ m, date, onTeamSelect, highlightTeamId }) {
  const homeId = m[M_HOME], awayId = m[M_AWAY], time = m[M_TIME], compId = m[M_COMP];
  const riv = rivalryLabel(homeId, awayId);
  const { copied, copy: copyMatch } = useClipboard();
  const rowRef = React.useRef(null);

  const isHighlighted = highlightTeamId && (homeId === highlightTeamId || awayId === highlightTeamId);

  React.useEffect(() => {
    if (isHighlighted && rowRef.current) {
      rowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      rowRef.current.classList.add('highlight-pulse');
      const t = setTimeout(() => {
        if (rowRef.current) rowRef.current.classList.remove('highlight-pulse');
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [isHighlighted, date]);

  function exportMatch(e) {
    e.stopPropagation();
    exportSingleMatch(m, date);
  }

  function handleCopyMatch(e) {
    e.stopPropagation();
    copyMatch(buildMatchShareText(m, date));
  }
  
  return (
    <div ref={rowRef} className={"match-row" + (riv ? " rivalry" : "")}>
      <button className="team home" onClick={() => onTeamSelect(homeId)}>
        <TeamLabel teamId={homeId} size={32} />
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
        <TeamLabel teamId={awayId} size={32} reverse={true} />
      </button>
    </div>
  );
}

export default React.memo(MatchRow);
