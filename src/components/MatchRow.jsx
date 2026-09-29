import React from 'react';
import fixtures from '../data/fixtures.json';
import { M_HOME, M_AWAY, M_TIME, M_COMP } from '../data/constants.js';
import { rivalryLabel } from '../data/precomputed.js';
import { exportSingleMatch } from '../utils/ics.js';
import { buildMatchShareText } from '../utils/clipboard.js';
import { useClipboard } from '../hooks/useClipboard.js';
import { toast } from '../utils/toast.js';
import { Download, Copy, Check } from 'lucide-react';
import TeamLabel from './TeamLabel.jsx';
import { KickoffTime } from './KickoffTime.jsx';

function MatchRow({ m, date, onTeamSelect, highlightTeamId }) {
  const homeId = m[M_HOME], awayId = m[M_AWAY], time = m[M_TIME], compId = m[M_COMP];
  const riv = rivalryLabel(homeId, awayId);
  const { copied, copy } = useClipboard();
  const rowRef = React.useRef(null);

  const isHighlighted = highlightTeamId != null && (homeId === highlightTeamId || awayId === highlightTeamId);

  React.useEffect(() => {
    if (!isHighlighted || !rowRef.current) return undefined;
    const el = rowRef.current;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('highlight-pulse');
    const t = setTimeout(() => el.classList.remove('highlight-pulse'), 2500);
    return () => clearTimeout(t);
  }, [isHighlighted, date]);

  const matchName = `${fixtures.teams[homeId]} vs ${fixtures.teams[awayId]}`;

  function handleExport(e) {
    e.stopPropagation();
    exportSingleMatch(m, date);
    toast("Calendar file downloaded");
  }

  async function handleCopy(e) {
    e.stopPropagation();
    if (await copy(buildMatchShareText(m, date))) toast("Match copied to clipboard");
  }

  return (
    <div ref={rowRef} className={"match-row" + (riv ? " rivalry" : "")}>
      <button className="team home" onClick={() => onTeamSelect(homeId)} aria-label={`View ${fixtures.teams[homeId]} schedule`}>
        <TeamLabel teamId={homeId} size={32} />
      </button>
      <div className="kickoff">
        {riv && <span className="rivalry-tag">&#9733; {riv}</span>}
        <KickoffTime dateISO={date} time={time} compId={compId} />
        <div className="row-actions">
          <button className="row-action" aria-label={`Copy ${matchName}`} title="Copy" onClick={handleCopy}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          <button className="row-action" aria-label={`Add ${matchName} to calendar`} title="Export (.ics)" onClick={handleExport}>
            <Download size={14} />
          </button>
        </div>
      </div>
      <button className="team away" onClick={() => onTeamSelect(awayId)} aria-label={`View ${fixtures.teams[awayId]} schedule`}>
        <TeamLabel teamId={awayId} size={32} reverse={true} />
      </button>
    </div>
  );
}

export default React.memo(MatchRow);
