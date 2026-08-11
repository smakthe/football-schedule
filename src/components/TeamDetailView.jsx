import React, { useMemo } from 'react';
import fixtures from '../data/fixtures.json';
import { M_HOME, M_AWAY, M_COMP, M_TIME, M_ROUND, COMP_BUNDESLIGA } from '../data/constants.js';
import { TEAM_COMP } from '../data/precomputed.js';
import { shortDate, longDate, fromISO } from '../utils/dates.js';
import { matchToVEvent, buildICS, downloadICS } from '../utils/ics.js';
import Crest from './Crest.jsx';
import { KickoffTime } from './KickoffTime.jsx';

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

function NextFixtureCard({ f, teamId, onPick }) {
  const comp = fixtures.comps[f.compId];
  const homeId = f.isHome ? teamId : f.oppId;
  const awayId = f.isHome ? f.oppId : teamId;
  return (
    <button className="next-fixture-card" style={{ "--accent2": comp.color2 }} onClick={() => onPick(f.date)}>
      <span className="nf-label">
        <span className={`venue-badge ${f.isHome ? 'home' : 'away'}`} title={f.isHome ? 'Home' : 'Away'}>{f.isHome ? 'H' : 'A'}</span>
        Next fixture &middot; {comp.name}{f.round ? ` \u00b7 Matchday ${f.round}` : ""}
      </span>
      <div className="nf-matchup">
        <span className="nf-team"><Crest teamId={homeId} size={38} /><span>{fixtures.teams[homeId]}</span></span>
        <span className="nf-vs">vs</span>
        <span className="nf-team"><Crest teamId={awayId} size={38} /><span>{fixtures.teams[awayId]}</span></span>
      </div>
      <span className="nf-date">
        {f.date === f.date2 ? longDate(f.date) : `${shortDate(f.date)} \u2013 ${shortDate(f.date2)}`}
        {f.time ? <> &middot; <KickoffTime dateISO={f.date} time={f.time} compId={f.compId} /></> : null}
      </span>
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
      <span className="tf-meta" style={{ color: comp.color2 }}>{comp.short}</span>
    </button>
  );
}

export default function TeamDetailView({ teamId, onBack, onPick, today }) {
  const teamFixtures = useTeamFixtures(teamId);
  const upcoming = teamFixtures.filter((f) => f.date2 >= today);
  const next = upcoming[0];
  const later = upcoming.slice(1);
  const comp = fixtures.comps[TEAM_COMP[teamId]];

  function exportSeason() {
    const teamName = fixtures.teams[teamId];
    const vevents = upcoming.map((f) => matchToVEvent({
      dateISO: f.date,
      compName: fixtures.comps[f.compId].name,
      homeName: f.isHome ? teamName : fixtures.teams[f.oppId],
      awayName: f.isHome ? fixtures.teams[f.oppId] : teamName,
      time: f.time,
      round: f.round,
      compId: f.compId,
    }));
    downloadICS(`${teamName.replace(/[^A-Za-z0-9]+/g, "-")}-remaining-fixtures.ics`, buildICS(vevents));
  }

  return (
    <div className="calendar-view">
      <div className="team-header">
        <Crest teamId={teamId} size={48} />
        <div className="team-header-text">
          <h2>{fixtures.teams[teamId]}</h2>
          <span className="league-sub" style={{ color: comp.color2 }}>{comp.name}</span>
        </div>
        <button className="jump-today" onClick={onBack}>Change</button>
      </div>

      {next ? (
        <>
          <NextFixtureCard f={next} teamId={teamId} onPick={onPick} />
          <button className="action-btn" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }} onClick={exportSeason}>
            &#128197; Export remaining schedule ({upcoming.length}) to calendar
          </button>
          {later.length > 0 && (
            <>
              <div className="team-browse-heading" style={{ marginTop: 22 }}>Remaining schedule &middot; {later.length} {later.length === 1 ? "match" : "matches"}</div>
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
