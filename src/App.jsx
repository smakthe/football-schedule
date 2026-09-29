import { useState, useMemo, useCallback, useEffect, useRef, Suspense, lazy } from 'react';
import { ChevronDown } from 'lucide-react';
import fixtures from './data/fixtures.json';
import { LEAGUE_THEMES, THEME_CSS_VARS } from './config/leagueThemes.js';
import {
  M_COMP, M_HOME, M_AWAY, M_TIME, M_ROUND,
  COMP_EPL, COMP_LALIGA, COMP_LIGUE1, COMP_BUNDESLIGA, COMP_UCL,
  DISPLAY_ORDER, MIN_DATE, MAX_DATE, VIEWER_TZ,
} from './data/constants.js';
import { todayISO, clampISO, addDays, addMonths } from './utils/dates.js';
import { matchToVEvent, buildICS, downloadICS } from './utils/ics.js';
import { buildShareText } from './utils/clipboard.js';
import { toast } from './utils/toast.js';
import { useClipboard } from './hooks/useClipboard.js';
import { useSwipe } from './hooks/useSwipe.js';

import LeagueFilter from './components/LeagueFilter.jsx';
import ViewToggle from './components/ViewToggle.jsx';
import DayHeader from './components/DayHeader.jsx';
import DateStrip from './components/DateStrip.jsx';
import LeagueSection from './components/LeagueSection.jsx';
import EmptyState from './components/EmptyState.jsx';
import Toaster from './components/Toaster.jsx';

const MonthView = lazy(() => import('./components/MonthView.jsx'));
const TeamSearchPanel = lazy(() => import('./components/TeamSearchPanel.jsx'));
const TeamDetailView = lazy(() => import('./components/TeamDetailView.jsx'));

export default function App() {
  const todayStr = useMemo(() => clampISO(todayISO()), []);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [slideDir, setSlideDir] = useState("right");
  const [viewMode, setViewMode] = useState("day");
  // Independent from selectedDate so browsing Month view doesn't disturb
  // the day you actually have open until you tap a specific cell.
  const [calendarCursor, setCalendarCursor] = useState(todayStr);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [selectedTeamCompId, setSelectedTeamCompId] = useState(null);
  const [leagueFilter, setLeagueFilter] = useState(null);

  // Apply the league palette on <html> and keep the browser chrome in sync.
  useEffect(() => {
    const root = document.documentElement;
    const theme = leagueFilter != null ? LEAGUE_THEMES[leagueFilter]?.cssVars : null;
    THEME_CSS_VARS.forEach((key) => root.style.removeProperty(key));
    if (theme) for (const [key, val] of Object.entries(theme)) root.style.setProperty(key, val);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = getComputedStyle(root).getPropertyValue("--bg").trim();
  }, [leagueFilter]);

  // Changing league scope returns the club view to the browse list.
  useEffect(() => {
    setSelectedTeamId(null);
    setSelectedTeamCompId(null);
  }, [leagueFilter]);

  const openView = useCallback((mode) => {
    if (mode !== "day") setCalendarCursor(selectedDate);
    setViewMode(mode);
  }, [selectedDate]);

  const goToDate = useCallback((iso) => {
    if (iso < MIN_DATE || iso > MAX_DATE) return;
    setSlideDir((prev) => (iso > selectedDate ? "right" : iso < selectedDate ? "left" : prev));
    setSelectedDate(iso);
  }, [selectedDate]);

  const pickDay = useCallback((iso) => {
    goToDate(iso);
    setViewMode("day");
  }, [goToDate]);

  const viewTeamSchedule = useCallback((teamId) => {
    setSelectedTeamId(teamId);
    setSelectedTeamCompId(null);
    openView("team");
  }, [openView]);

  // Direct dateIndex lookup for single-day leagues plus a scan of
  // Bundesliga's range rows (shown on the window's start date only).
  const matchesByComp = useMemo(() => {
    const grouped = { [COMP_EPL]: [], [COMP_LALIGA]: [], [COMP_LIGUE1]: [], [COMP_BUNDESLIGA]: [], [COMP_UCL]: [] };
    const dayList = fixtures.dateIndex[selectedDate];
    if (dayList) for (const m of dayList) grouped[m[M_COMP]].push(m);
    for (const row of fixtures.bundesliga) {
      if (selectedDate === row[0]) grouped[COMP_BUNDESLIGA].push([COMP_BUNDESLIGA, row[2], row[3], null, row[4]]);
    }
    return grouped;
  }, [selectedDate]);

  const filteredOrder = useMemo(
    () => (leagueFilter != null ? DISPLAY_ORDER.filter((id) => id === leagueFilter) : DISPLAY_ORDER),
    [leagueFilter],
  );

  const { totalMatches, activeLeagueCount } = useMemo(() => {
    const total = filteredOrder.reduce((s, id) => s + matchesByComp[id].length, 0);
    const active = filteredOrder.filter((id) => matchesByComp[id].length > 0).length;
    return { totalMatches: total, activeLeagueCount: active };
  }, [filteredOrder, matchesByComp]);
  const isEmpty = totalMatches === 0;

  const { copied, copy: copyDay } = useClipboard();

  const exportDay = useCallback(() => {
    const vevents = [];
    filteredOrder.forEach((id) => {
      matchesByComp[id].forEach((m) => {
        vevents.push(matchToVEvent({
          dateISO: selectedDate, compName: fixtures.comps[id].name,
          homeName: fixtures.teams[m[M_HOME]], awayName: fixtures.teams[m[M_AWAY]],
          time: m[M_TIME], round: m[M_ROUND], compId: id,
        }));
      });
    });
    downloadICS(`football-${selectedDate}.ics`, buildICS(vevents));
    toast(`${vevents.length} ${vevents.length === 1 ? "match" : "matches"} exported`);
  }, [filteredOrder, matchesByComp, selectedDate]);

  const handleCopyDay = useCallback(async () => {
    if (await copyDay(buildShareText(selectedDate, matchesByComp))) toast("Day copied to clipboard");
  }, [copyDay, selectedDate, matchesByComp]);

  // Swipe the match list to step through days on touch devices
  const swipeRef = useRef(null);
  useSwipe(swipeRef, {
    onSwipeLeft: () => goToDate(clampISO(addDays(selectedDate, 1))),
    onSwipeRight: () => goToDate(clampISO(addDays(selectedDate, -1))),
  });

  const visibleSections = filteredOrder.filter((id) => matchesByComp[id].length > 0);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>

      <header className="app-header">
        <div className="app-header-inner">
          <div className="brand-row">
            <div className="brand">
              <span className="brand-mark" aria-hidden="true">&#9917;</span>
              <span className="brand-text">
                <span className="brand-title">Football 2026/27</span>
                <span className="brand-sub">European club season</span>
              </span>
            </div>
          </div>
          <LeagueFilter active={leagueFilter} onChange={setLeagueFilter} />
        </div>
      </header>

      <main id="main" className="shell">
        <ViewToggle mode={viewMode} onChange={openView} />

        {viewMode === "day" && (
          <>
            <div key={selectedDate + "-top"} className={`day-transition slide-${slideDir}`}>
              <DayHeader
                date={selectedDate}
                today={todayStr}
                totalMatches={totalMatches}
                activeLeagueCount={activeLeagueCount}
                copied={copied}
                onCopy={handleCopyDay}
                onExport={exportDay}
                onToday={() => goToDate(todayStr)}
              />
            </div>
            <DateStrip
              selected={selectedDate}
              today={todayStr}
              onSelect={goToDate}
              dayInfo={fixtures.dayInfo}
              leagueFilter={leagueFilter}
            />
            <div ref={swipeRef} className="swipe-area">
              <div key={selectedDate + "-bottom"} className={`day-transition slide-${slideDir}`}>
                {isEmpty ? (
                  <EmptyState date={selectedDate} leagueFilter={leagueFilter} onPick={goToDate} />
                ) : (
                  visibleSections.map((id, i) => (
                    <LeagueSection
                      key={id}
                      index={i}
                      comp={fixtures.comps[id]}
                      matches={matchesByComp[id]}
                      date={selectedDate}
                      onTeamSelect={viewTeamSchedule}
                      highlightTeamId={selectedTeamId}
                    />
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {viewMode === "month" && (
          <Suspense fallback={<div className="loading">Loading calendar…</div>}>
            <MonthView
              cursor={calendarCursor}
              onNavigate={(n) => setCalendarCursor(clampISO(addMonths(calendarCursor, n)))}
              selectedDate={selectedDate}
              today={todayStr}
              onPick={pickDay}
              dayInfo={fixtures.dayInfo}
              leagueFilter={leagueFilter}
            />
          </Suspense>
        )}

        {viewMode === "team" && (
          <Suspense fallback={<div className="loading">Loading clubs…</div>}>
            {selectedTeamId == null ? (
              <TeamSearchPanel
                onPick={({ id, compId }) => { setSelectedTeamId(id); setSelectedTeamCompId(compId); }}
                leagueFilter={leagueFilter}
              />
            ) : (
              <TeamDetailView
                teamId={selectedTeamId}
                compId={selectedTeamCompId}
                onBack={() => { setSelectedTeamId(null); setSelectedTeamCompId(null); }}
                onPick={pickDay}
                today={todayStr}
              />
            )}
          </Suspense>
        )}

        <details className="about">
          <summary>About this data <ChevronDown size={13} aria-hidden="true" /></summary>
          <p>
            Premier League &amp; La Liga fixtures confirmed in full &mdash; La Liga's 15&ndash;27 Aug opening includes the post-World Cup date changes for four clubs.
            Ligue 1's opening weekend (21&ndash;23 Aug) is exact too; other Ligue 1 &amp; all Bundesliga rounds show the official matchday window, confirmed closer to play.
            Champions League pairings land 27 Aug 2026. &#9733; marks a marquee derby.
          </p>
          <p>Kickoff times convert to your device's time zone ({VIEWER_TZ}); the small tag shows the original published time.</p>
        </details>
      </main>

      <Toaster />
    </>
  );
}
