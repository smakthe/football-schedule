import React, { useState, useMemo, useEffect, Suspense, lazy } from 'react';
import fixtures from './data/fixtures.json';
import { LEAGUE_THEMES, THEME_CSS_VARS } from './config/leagueThemes.js';
import {
  M_COMP, M_HOME, M_AWAY, M_TIME, M_ROUND,
  COMP_EPL, COMP_LALIGA, COMP_LIGUE1, COMP_BUNDESLIGA,
  DISPLAY_ORDER, MIN_DATE, MAX_DATE, VIEWER_TZ
} from './data/constants.js';
import { MATCH_DATE_SET } from './data/precomputed.js';
import { todayISO, clampISO, addMonths, longDate } from './utils/dates.js';
import { matchToVEvent, buildICS, downloadICS } from './utils/ics.js';
import { copyText, buildShareText } from './utils/clipboard.js';

import LeagueFilter from './components/LeagueFilter.jsx';
import ViewToggle from './components/ViewToggle.jsx';
import DateStrip from './components/DateStrip.jsx';
import { Copy, Download, Check } from 'lucide-react';
import LeagueSection from './components/LeagueSection.jsx';
import UCLSection from './components/UCLSection.jsx';
import EmptyState from './components/EmptyState.jsx';

// Lazy load the larger, less-frequently used views
const MonthView = lazy(() => import('./components/MonthView.jsx'));
const TeamSearchPanel = lazy(() => import('./components/TeamSearchPanel.jsx'));
const TeamDetailView = lazy(() => import('./components/TeamDetailView.jsx'));

export default function App() {
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [slideDir, setSlideDir] = useState("right");
  const [viewMode, setViewMode] = useState("day");
  // Independent from selectedDate so browsing Month view doesn't disturb
  // the day you actually have open until you tap a specific cell.
  const [calendarCursor, setCalendarCursor] = useState(todayISO());
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [leagueFilter, setLeagueFilter] = useState(null);

  // Sync league theme variables to <html> so body background also changes
  useEffect(() => {
    const root = document.documentElement;
    if (leagueFilter !== null && LEAGUE_THEMES[leagueFilter]) {
      const theme = LEAGUE_THEMES[leagueFilter].cssVars;
      for (const [key, val] of Object.entries(theme)) {
        root.style.setProperty(key, val);
      }
    } else {
      THEME_CSS_VARS.forEach(key => root.style.removeProperty(key));
    }
  }, [leagueFilter]);

  // Reset selected team when league filter changes so it reverts to the list of clubs
  useEffect(() => {
    setSelectedTeamId(null);
  }, [leagueFilter]);

  function openView(mode) {
    if (mode !== "day") setCalendarCursor(selectedDate);
    setViewMode(mode);
  }
  function pickDay(iso) {
    if (iso < MIN_DATE || iso > MAX_DATE) return;
    if (iso > selectedDate) setSlideDir("right");
    else if (iso < selectedDate) setSlideDir("left");
    setSelectedDate(iso);
    setViewMode("day");
  }

  function handleDateSelect(iso) {
    if (iso > selectedDate) setSlideDir("right");
    else if (iso < selectedDate) setSlideDir("left");
    setSelectedDate(iso);
  }

  function viewTeamSchedule(teamId) {
    setSelectedTeamId(teamId);
    openView("team");
  }  // O(matches that day) instead of O(all 1,372 fixtures): a direct dateIndex
  // lookup for the three single-day leagues, plus a scan of just Bundesliga's
  // 306 rows (the only competition stored as date ranges).
  const matchesByComp = useMemo(() => {
    const grouped = { [COMP_EPL]: [], [COMP_LALIGA]: [], [COMP_LIGUE1]: [], [COMP_BUNDESLIGA]: [] };
    const dayList = fixtures.dateIndex[selectedDate];
    if (dayList) for (const m of dayList) grouped[m[M_COMP]].push(m);
    for (const row of fixtures.bundesliga) {
      if (selectedDate >= row[0] && selectedDate <= row[1]) {
        grouped[COMP_BUNDESLIGA].push([COMP_BUNDESLIGA, row[2], row[3], null, row[4]]);
      }
    }
    return grouped;
  }, [selectedDate]);

  const activeUclRounds = useMemo(() => {
    return fixtures.ucl.rounds.filter((r) => selectedDate >= r.d && selectedDate <= r.d2);
  }, [selectedDate]);

  const filteredOrder = leagueFilter != null
    ? DISPLAY_ORDER.filter(id => id === leagueFilter)
    : DISPLAY_ORDER;
  const showUcl = leagueFilter === null;

  const totalMatches = filteredOrder.reduce((s, id) => s + matchesByComp[id].length, 0);
  const activeLeagueCount = filteredOrder.filter((id) => matchesByComp[id].length > 0).length;
  const filteredUclRounds = showUcl ? activeUclRounds : [];
  const isEmpty = totalMatches === 0 && filteredUclRounds.length === 0;

  const [copied, setCopied] = useState(false);

  function exportDay() {
    const vevents = [];
    filteredOrder.forEach((id) => {
      matchesByComp[id].forEach((m) => {
        vevents.push(matchToVEvent({
          dateISO: selectedDate, compName: fixtures.comps[id].name,
          homeName: fixtures.teams[m[M_HOME]], awayName: fixtures.teams[m[M_AWAY]], time: m[M_TIME], round: m[M_ROUND], compId: id,
        }));
      });
    });
    downloadICS(`football-${selectedDate}.ics`, buildICS(vevents));
  }

  async function handleCopyDay() {
    const ok = await copyText(buildShareText(selectedDate, matchesByComp));
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1800); }
  }

  return (
    <div className="shell" data-league={leagueFilter}>
      <div className="eyebrow">
        <span>2026/27 European Club Season</span>
      </div>

      <LeagueFilter active={leagueFilter} onChange={setLeagueFilter} />
      <ViewToggle mode={viewMode} onChange={openView} />

      {viewMode === "day" && (
        <>
          <div key={selectedDate + "-top"} className={`day-transition slide-${slideDir}`}>
            <div className="day-top-stable">
              <div>
                <div className="headline-row">
                  <h1 className="headline">{longDate(selectedDate)}</h1>
                </div>
                <p className="summary-line">
                  {isEmpty && totalMatches === 0
                    ? "No matches"
                    : <><b>{totalMatches}</b> {totalMatches === 1 ? "match" : "matches"} across <b>{activeLeagueCount + (filteredUclRounds.length ? 1 : 0)}</b> {(activeLeagueCount + (filteredUclRounds.length ? 1 : 0)) === 1 ? "league" : "leagues"}</>
                  }
                </p>
              </div>
              {!isEmpty && (
                <div className="day-actions">
                  <button className="action-btn" onClick={handleCopyDay} aria-label="Copy to clipboard" title="Copy">
                    {copied ? <Check size={15} /> : <Copy size={15} />}
                  </button>
                  <button className="action-btn" onClick={exportDay} aria-label="Export schedule" title="Export">
                    <Download size={15} />
                  </button>
                </div>
              )}
            </div>
          </div>
          <DateStrip
            selected={selectedDate}
            onSelect={handleDateSelect}
            matchDateSet={MATCH_DATE_SET}
            dayInfo={fixtures.dayInfo}
            leagueFilter={leagueFilter}
          />
          <div key={selectedDate + "-bottom"} className={`day-transition slide-${slideDir}`}>
            {isEmpty ? (
              <EmptyState />
            ) : (
              <>
                {filteredOrder.map((id) => (
                  <LeagueSection key={id} comp={fixtures.comps[id]} matches={matchesByComp[id]} date={selectedDate} onTeamSelect={viewTeamSchedule} />
                ))}
                {showUcl && <UCLSection rounds={activeUclRounds} />}
              </>
            )}
          </div>
        </>
      )}

      {viewMode === "month" && (
        <Suspense fallback={<div className="empty-state">Loading calendar...</div>}>
          <MonthView
            cursor={calendarCursor}
            onNavigate={(n) => setCalendarCursor(clampISO(addMonths(calendarCursor, n)))}
            selectedDate={selectedDate}
            today={todayISO()}
            onPick={pickDay}
            dayInfo={fixtures.dayInfo}
            leagueFilter={leagueFilter}
          />
        </Suspense>
      )}

      {viewMode === "team" && (
        <Suspense fallback={<div className="empty-state">Loading teams...</div>}>
          {selectedTeamId == null ? (
            <TeamSearchPanel onPick={setSelectedTeamId} leagueFilter={leagueFilter} />
          ) : (
            <TeamDetailView teamId={selectedTeamId} onBack={() => setSelectedTeamId(null)} onPick={pickDay} today={todayISO()} />
          )}
        </Suspense>
      )}

      <p className="footnote">
        Premier League &amp; La Liga fixtures confirmed in full &mdash; La Liga's 15&ndash;27 Aug opening includes the post-World Cup date changes for four clubs.<br />
        Ligue 1's opening weekend (21&ndash;23 Aug) is exact too; other Ligue 1 &amp; all Bundesliga rounds show the official matchday window, confirmed closer to play.<br />
        Champions League pairings land 27 Aug 2026. &#9733; marks a marquee derby.<br />
        Kickoff times convert to your device's time zone ({VIEWER_TZ}); the small tag shows the original published time.
      </p>
    </div>
  );
}
