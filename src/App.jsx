import React, { useState, useMemo, Suspense, lazy } from 'react';
import fixtures from './data/fixtures.json';
import {
  M_COMP, M_HOME, M_AWAY, M_TIME, M_ROUND,
  COMP_EPL, COMP_LALIGA, COMP_LIGUE1, COMP_BUNDESLIGA,
  DISPLAY_ORDER, MIN_DATE, MAX_DATE, VIEWER_TZ
} from './data/constants.js';
import { MATCH_DATE_SET } from './data/precomputed.js';
import { todayISO, clampISO, addMonths, longDate } from './utils/dates.js';
import { matchToVEvent, buildICS, downloadICS } from './utils/ics.js';
import { copyText, buildShareText } from './utils/clipboard.js';

import ViewToggle from './components/ViewToggle.jsx';
import DateStrip from './components/DateStrip.jsx';
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

  const totalMatches = DISPLAY_ORDER.reduce((s, id) => s + matchesByComp[id].length, 0);
  const activeLeagueCount = DISPLAY_ORDER.filter((id) => matchesByComp[id].length > 0).length;
  const isEmpty = totalMatches === 0 && activeUclRounds.length === 0;

  const [copied, setCopied] = useState(false);

  function exportDay() {
    const vevents = [];
    DISPLAY_ORDER.forEach((id) => {
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
    <div className="shell">
      <div className="eyebrow">
        <span>2026/27 European Club Season</span>
      </div>

      <ViewToggle mode={viewMode} onChange={openView} />

      {viewMode === "day" && (
        <>
          <div key={selectedDate + "-top"} className={`day-transition slide-${slideDir}`}>
            <div className="headline-row">
              <h1 className="headline">{longDate(selectedDate)}</h1>
            </div>
            <p className="summary-line">
              {isEmpty && totalMatches === 0
                ? "No mathes"
                : <><b>{totalMatches}</b> {totalMatches === 1 ? "match" : "matches"} across <b>{activeLeagueCount + (activeUclRounds.length ? 1 : 0)}</b> {(activeLeagueCount + (activeUclRounds.length ? 1 : 0)) === 1 ? "league" : "leagues"}</>
              }
            </p>
            {!isEmpty && (
              <div className="day-actions">
                <button className="action-btn" onClick={exportDay}>&#128197; Export day</button>
                <button className="action-btn" onClick={handleCopyDay}>{copied ? "\u2713 Copied" : "\u2398 Copy as text"}</button>
              </div>
            )}
          </div>
          <DateStrip
            selected={selectedDate}
            onSelect={handleDateSelect}
            matchDateSet={MATCH_DATE_SET}
            dayInfo={fixtures.dayInfo}
          />
          <div key={selectedDate + "-bottom"} className={`day-transition slide-${slideDir}`}>
            {isEmpty ? (
              <EmptyState />
            ) : (
              <>
                {DISPLAY_ORDER.map((id) => (
                  <LeagueSection key={id} comp={fixtures.comps[id]} matches={matchesByComp[id]} date={selectedDate} onTeamSelect={viewTeamSchedule} />
                ))}
                <UCLSection rounds={activeUclRounds} />
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
          />
        </Suspense>
      )}

      {viewMode === "team" && (
        <Suspense fallback={<div className="empty-state">Loading teams...</div>}>
          {selectedTeamId == null ? (
            <TeamSearchPanel onPick={setSelectedTeamId} />
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
