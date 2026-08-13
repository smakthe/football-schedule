import { useMemo, useEffect } from 'react';
import fixtures from '../data/fixtures.json';
import { M_HOME, M_AWAY, M_COMP, M_TIME, M_ROUND, COMP_BUNDESLIGA } from '../data/constants.js';
import { TEAM_COMP } from '../data/precomputed.js';
import { shortDate, longDate, fromISO } from '../utils/dates.js';
import { exportTeamSchedule } from '../utils/ics.js';
import { Download } from 'lucide-react';
import Crest from './Crest.jsx';
import { KickoffTime } from './KickoffTime.jsx';
import { getThemeAccent } from '../config/leagueThemes.js';

function useTeamFixtures(teamId) {
  return useMemo(() => {
    if (teamId == null) return [];
    const list = [];
    for (const [iso, matches] of Object.entries(fixtures.dateIndex)) {
      for (const m of matches) {
        if (m[M_HOME] === teamId || m[M_AWAY] === teamId) {
          const isHome = m[M_HOME] === teamId;
          list.push({ 
            date: iso, date2: iso, compId: m[M_COMP], isHome, 
            oppId: isHome ? m[M_AWAY] : m[M_HOME], time: m[M_TIME], round: m[M_ROUND] 
          });
        }
      }
    }
    for (const [start, end, home, away, sp] of fixtures.bundesliga) {
      if (home === teamId || away === teamId) {
        const isHome = home === teamId;
        list.push({ 
          date: start, date2: end, compId: COMP_BUNDESLIGA, isHome, 
          oppId: isHome ? away : home, time: null, round: sp 
        });
      }
    }
    list.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    return list;
  }, [teamId]);
}

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
          <span className={`venue-badge ${f.isHome ? 'home' : 'away'}`} title={f.isHome ? 'Home' : 'Away'} style={{ position: 'absolute', right: '100%', marginRight: '8px' }}>{f.isHome ? 'H' : 'A'}</span>
          <span>Next match &middot; {comp.name}{f.round ? ` \u00b7 Matchday ${f.round}` : ""}</span>
        </div>
        <span style={{ fontSize: '13px', color: 'var(--text-dim)', textTransform: 'none', letterSpacing: 'normal', fontFamily: "'Inter', sans-serif" }}>
          {f.date === f.date2 ? longDate(f.date) : `${shortDate(f.date)} \u2013 ${shortDate(f.date2)}`}
        </span>
      </span>

      <div className="nf-matchup">
        <span className="nf-team"><Crest teamId={homeId} size={38} /><span>{fixtures.teams[homeId]}</span></span>
        <span className="nf-vs">vs</span>
        <span className="nf-team"><Crest teamId={awayId} size={38} /><span>{fixtures.teams[awayId]}</span></span>
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
    <button className="team-fixture-row" onClick={() => onPick(f.date)}>
      <span className="tf-date">{f.date === f.date2 ? shortDate(f.date) : `${shortDate(f.date)}\u2013${fromISO(f.date2).getDate()}`}</span>
      <span className="tf-opp">
        <span className={`venue-badge ${f.isHome ? 'home' : 'away'}`} title={f.isHome ? 'Home' : 'Away'}>{f.isHome ? 'H' : 'A'}</span>
        <Crest teamId={f.oppId} size={22} />
        <span>vs {fixtures.teams[f.oppId]}</span>
      </span>
      <span className="tf-meta" style={{ color: getThemeAccent(f.compId) }}>{comp.short}</span>
    </button>
  );
}

export default function TeamDetailView({ teamId, onBack, onPick, today }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const teamFixtures = useTeamFixtures(teamId);
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
