import { useEffect, useMemo } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import fixtures from '../data/fixtures.json';
import { WD_S } from '../data/constants.js';
import { TEAM_COMP, TEAM_FIXTURES } from '../data/precomputed.js';
import { shortDate, longDate, monthLabel, fromISO } from '../utils/dates.js';
import { exportTeamSchedule } from '../utils/ics.js';
import { toast } from '../utils/toast.js';
import Crest from './Crest.jsx';
import CompBadge from './CompBadge.jsx';
import TeamLabel from './TeamLabel.jsx';
import VenueBadge from './VenueBadge.jsx';
import { KickoffTime } from './KickoffTime.jsx';

function NextFixtureCard({ f, teamId, onPick }) {
  const comp = fixtures.comps[f.compId];
  const homeId = f.isHome ? teamId : f.oppId;
  const awayId = f.isHome ? f.oppId : teamId;
  const when = f.date === f.date2 ? longDate(f.date) : `${shortDate(f.date)} – ${shortDate(f.date2)}`;

  return (
    <button className="next-fixture-card" style={{ "--league-color": comp.color2 }} onClick={() => onPick(f.date)}>
      <span className="nf-label">
        <VenueBadge isHome={f.isHome} />
        <span>Next match &middot; {comp.name}{f.round ? ` · MD ${f.round}` : ""}</span>
      </span>
      <div className="nf-matchup">
        <TeamLabel teamId={homeId} size={44} reverse={true} direction="col" className="nf-team" />
        <span className="nf-vs">vs</span>
        <TeamLabel teamId={awayId} size={44} reverse={true} direction="col" className="nf-team" />
      </div>
      <span className="nf-date">{when}</span>
      {f.time && <KickoffTime dateISO={f.date} time={f.time} compId={f.compId} />}
    </button>
  );
}

function FixtureRow({ f, index, onPick }) {
  const comp = fixtures.comps[f.compId];
  const d = fromISO(f.date);
  const isRange = f.date !== f.date2;
  return (
    <button
      className="fixture-row"
      style={{ "--i": index }}
      onClick={() => onPick(f.date)}
      aria-label={`${f.isHome ? "Home" : "Away"} vs ${fixtures.teams[f.oppId]}, ${comp.name}, ${longDate(f.date)}`}
    >
      <span className="fx-date" aria-hidden="true">
        <b>{d.getDate()}</b>
        <small>{WD_S[d.getDay()]}</small>
        {isRange && <small className="range">to {shortDate(f.date2)}</small>}
      </span>
      <VenueBadge isHome={f.isHome} />
      <span className="fx-opp">
        <Crest teamId={f.oppId} size={28} />
        <span className="fx-opp-name">{fixtures.teams[f.oppId]}</span>
      </span>
      <span className="fx-meta">
        <CompBadge comp={comp} size={20} />
        <KickoffTime dateISO={f.date} time={f.time} compId={f.compId} />
      </span>
    </button>
  );
}

export default function TeamDetailView({ teamId, compId, onBack, onPick, today }) {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const upcoming = useMemo(() => {
    let list = TEAM_FIXTURES[teamId] || [];
    if (compId != null) list = list.filter((f) => f.compId === compId);
    return list.filter((f) => f.date2 >= today);
  }, [teamId, compId, today]);

  const next = upcoming[0];
  const later = upcoming.slice(1);

  // Group the remaining fixtures by calendar month for scanning
  const months = useMemo(() => {
    const out = [];
    for (const f of later) {
      const key = f.date.slice(0, 7);
      if (!out.length || out[out.length - 1].key !== key) out.push({ key, label: monthLabel(f.date), items: [] });
      out[out.length - 1].items.push(f);
    }
    return out;
  }, [later]);

  const primaryCompId = compId != null ? compId : TEAM_COMP[teamId];
  const comp = fixtures.comps[primaryCompId];
  const teamName = fixtures.teams[teamId];

  function exportSeason() {
    exportTeamSchedule(teamId, upcoming);
    toast(`${upcoming.length} fixtures exported`);
  }

  return (
    <div>
      <button className="btn ghost back-link" onClick={onBack}>
        <ArrowLeft size={14} aria-hidden="true" /> All clubs
      </button>

      <div className="team-hero">
        <Crest teamId={teamId} size={60} />
        <div className="team-hero-text">
          <h2>{teamName}</h2>
          <span className="league-chip" style={{ "--league-color": comp.color2 }}>
            <CompBadge comp={comp} size={18} />
            {comp.name}
          </span>
        </div>
      </div>

      {next ? (
        <>
          <NextFixtureCard f={next} teamId={teamId} onPick={onPick} />
          <button className="btn block" style={{ marginTop: 14 }} onClick={exportSeason}>
            <Download size={15} aria-hidden="true" />
            Export remaining season ({upcoming.length} {upcoming.length === 1 ? "match" : "matches"})
          </button>

          {months.map((group, gi) => (
            <section key={group.key} className="month-group" aria-labelledby={`month-${group.key}`}>
              <div className="month-group-label">
                <span id={`month-${group.key}`}>{group.label}</span>
                <small>{group.items.length} {group.items.length === 1 ? "match" : "matches"}</small>
              </div>
              <div className="fixture-list">
                {group.items.map((f, i) => (
                  <FixtureRow key={`${f.date}-${f.oppId}-${f.compId}`} f={f} index={gi === 0 ? i : 0} onPick={onPick} />
                ))}
              </div>
            </section>
          ))}
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-glyph" aria-hidden="true">&#9917;</div>
          <p className="empty-title">Season complete</p>
          <p className="empty-sub">No more {teamName} fixtures remain in this dataset.</p>
        </div>
      )}
    </div>
  );
}
