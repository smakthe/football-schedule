import { useEffect } from 'react';
import fixtures from '../data/fixtures.json';
import { TEAM_COMP, TEAM_FIXTURES } from '../data/precomputed.js';
import { shortDate, longDate } from '../utils/dates.js';
import { exportTeamSchedule } from '../utils/ics.js';
import { Download } from 'lucide-react';
import Crest from './Crest.jsx';
import TeamLabel from './TeamLabel.jsx';
import VenueBadge from './VenueBadge.jsx';
import { KickoffTime } from './KickoffTime.jsx';
import { getThemeAccent } from '../config/leagueThemes.js';

const getMatchTeams = (f, teamId) => ({
  homeId: f.isHome ? teamId : f.oppId,
  awayId: f.isHome ? f.oppId : teamId,
});

function NextFixtureCard({ f, teamId, onPick }) {
  const comp = fixtures.comps[f.compId];
  const { homeId, awayId } = getMatchTeams(f, teamId);
  return (
    <button className="next-fixture-card" style={{ "--accent2": getThemeAccent(f.compId), position: 'relative' }} onClick={() => onPick(f.date)}>
      
      <span className="nf-label" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
          <VenueBadge isHome={f.isHome} style={{ position: 'absolute', right: '100%', marginRight: '8px' }} />
          <span>Next match &middot; {comp.name}{f.round ? ` \u00b7 Matchday ${f.round}` : ""}</span>
        </div>
        <span style={{ fontSize: '13px', color: 'var(--text-dim)', textTransform: 'none', letterSpacing: 'normal', fontFamily: "'Inter', sans-serif" }}>
          {f.date === f.date2 ? longDate(f.date) : `${shortDate(f.date)} \u2013 ${shortDate(f.date2)}`}
        </span>
      </span>

      <div className="nf-matchup">
        <TeamLabel teamId={homeId} size={38} reverse={true} className="nf-team" />
        <span className="nf-vs">vs</span>
        <TeamLabel teamId={awayId} size={38} reverse={true} className="nf-team" />
      </div>
      
      {f.time ? (
        <KickoffTime dateISO={f.date} time={f.time} compId={f.compId} />
      ) : null}
    </button>
  );
}

function TeamFixtureRow({ f, onPick }) {
  const comp = fixtures.comps[f.compId];
  return (
    <button className="team-fixture-card" onClick={() => onPick(f.date)} style={{ "--hover-color": comp.color2 }}>
      <div className="tf-card-header">
        <span className="tf-date">{shortDate(f.date)}</span>
        <VenueBadge isHome={f.isHome} />
      </div>
      <TeamLabel teamId={f.oppId} size={36} reverse={true} direction="col" className="" />
    </button>
  );
}

export default function TeamDetailView({ teamId, onBack, onPick, today }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const teamFixtures = TEAM_FIXTURES[teamId] || [];
  const upcoming = teamFixtures.filter((f) => f.date2 >= today);
  const next = upcoming[0];
  const later = upcoming.slice(1);
  const comp = fixtures.comps[TEAM_COMP[teamId]];

  function exportSeason() {
    exportTeamSchedule(teamId, upcoming);
  }

  return (
    <div className="calendar-view">
      <div className="team-header">
        <Crest teamId={teamId} size={48} />
        <div className="team-header-text">
          <h2>{fixtures.teams[teamId]}</h2>
          <span className="league-sub" style={{ color: getThemeAccent(TEAM_COMP[teamId]) }}>{comp.name}</span>
        </div>
        <button className="jump-today" onClick={onBack}>Change</button>
      </div>

      {next ? (
        <>
          <NextFixtureCard f={next} teamId={teamId} onPick={onPick} />
          <button className="action-btn" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }} onClick={exportSeason}>
            <Download size={15} /> Export full schedule ({upcoming.length} {upcoming.length === 1 ? "match" : "matches"})
          </button>
          {later.length > 0 && (
            <>
              <div className="team-browse-heading" style={{ marginTop: 22 }}>Upcoming &middot; {later.length} {later.length === 1 ? "match" : "matches"}</div>
              <div className="team-fixture-list">
                {later.map((f, i) => <TeamFixtureRow key={i} f={f} onPick={onPick} />)}
              </div>
            </>
          )}
        </>
      ) : (
        <p className="empty-sub" style={{ textAlign: "center", marginTop: 24 }}>No more {fixtures.teams[teamId]} fixtures left in these datasets for this season.</p>
      )}
    </div>
  );
}
