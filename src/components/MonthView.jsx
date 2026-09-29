import React, { useMemo, useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CalendarCheck } from 'lucide-react';
import fixtures from '../data/fixtures.json';
import { MO, WD_S, MIN_DATE, MAX_DATE, DISPLAY_ORDER } from '../data/constants.js';
import { getMonthCells, fromISO, addDays, clampISO, addMonths, cellLabel } from '../utils/dates.js';
import { RIVALRY_COMP, DOT_COLORS } from '../data/precomputed.js';
import { useSwipe } from '../hooks/useSwipe.js';
import CalendarDots from './CalendarDots.jsx';

const MonthCell = React.memo(({
  iso, inMonth, info, inRange, selectedDate, today, focusedISO, leagueFilter, onPick, onFocus,
}) => {
  const ids = info?.c || [];
  const hasMatches = leagueFilter == null ? ids.length > 0 : ids.includes(leagueFilter);
  const cls = ["month-cell"];
  if (!inMonth) cls.push("outside");
  if (iso === selectedDate) cls.push("selected");
  if (iso === today) cls.push("today");
  if (hasMatches) cls.push("has-matches");

  const filteredRiv = info?.riv
    ? (leagueFilter != null ? info.riv.filter((r) => RIVALRY_COMP[r] === leagueFilter) : info.riv)
    : [];

  return (
    <button
      data-iso={iso} role="gridcell" className={cls.join(" ")} disabled={!inRange}
      tabIndex={iso === focusedISO ? 0 : -1}
      aria-label={cellLabel(iso, info, leagueFilter, RIVALRY_COMP)}
      aria-current={iso === today ? "date" : undefined}
      aria-selected={iso === selectedDate}
      onClick={() => { onFocus(iso); onPick(iso); }}
    >
      {filteredRiv.length > 0 && <span className="cal-star" aria-hidden="true">&#9733;</span>}
      <span className="month-daynum" aria-hidden="true">{fromISO(iso).getDate()}</span>
      {leagueFilter == null
        ? <CalendarDots ids={ids} />
        : hasMatches && <span className="cal-dots"><span className="cal-dot filtered" /></span>}
    </button>
  );
});

function monthDelta(fromISOStr, toISOStr) {
  const [fy, fm] = fromISOStr.split("-").map(Number), [ty, tm] = toISOStr.split("-").map(Number);
  return (ty - fy) * 12 + (tm - fm);
}

export default function MonthView({ cursor, onNavigate, selectedDate, today, onPick, dayInfo, leagueFilter }) {
  const cells = useMemo(() => getMonthCells(cursor), [cursor]);
  const c = fromISO(cursor);
  const gridRef = useRef(null);
  const swipeRef = useRef(null);

  // Direction-aware slide when paging months
  const prevCursor = useRef(cursor);
  const slideDir = cursor >= prevCursor.current ? "right" : "left";
  useEffect(() => { prevCursor.current = cursor; }, [cursor]);

  const pendingFocusRef = useRef(false);
  const [focusedISO, setFocusedISO] = useState(() =>
    cells.some((cell) => cell.iso === selectedDate && cell.inMonth) ? selectedDate : cursor
  );

  useEffect(() => {
    if (!pendingFocusRef.current) return;
    pendingFocusRef.current = false;
    gridRef.current?.querySelector(`[data-iso="${focusedISO}"]`)?.focus();
  }, [cursor, focusedISO]);

  function moveFocus(deltaDays) {
    const target = clampISO(addDays(focusedISO, deltaDays));
    pendingFocusRef.current = true;
    setFocusedISO(target);
    const d = monthDelta(cursor, target);
    if (d !== 0) onNavigate(d);
  }

  function pageMonth(dir) {
    pendingFocusRef.current = true;
    setFocusedISO(clampISO(addMonths(cursor, dir)));
    onNavigate(dir);
  }

  function handleKeyDown(e) {
    const map = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 7, ArrowUp: -7 };
    if (e.key in map) { e.preventDefault(); moveFocus(map[e.key]); return; }
    if (e.key === "Home") { e.preventDefault(); moveFocus(-fromISO(focusedISO).getDay()); return; }
    if (e.key === "End") { e.preventDefault(); moveFocus(6 - fromISO(focusedISO).getDay()); return; }
    if (e.key === "PageUp") { e.preventDefault(); pageMonth(-1); return; }
    if (e.key === "PageDown") { e.preventDefault(); pageMonth(1); }
  }

  const canPrev = addMonths(cursor, -1) >= MIN_DATE.slice(0, 7) + "-01";
  const canNext = addMonths(cursor, 1) <= MAX_DATE;
  const onTodayMonth = cursor.slice(0, 7) === today.slice(0, 7);

  useSwipe(swipeRef, {
    onSwipeLeft: () => canNext && onNavigate(1),
    onSwipeRight: () => canPrev && onNavigate(-1),
  });

  const legendComps = leagueFilter == null ? DISPLAY_ORDER : [];

  return (
    <div>
      <div className="month-header">
        <button className="btn round" aria-label="Previous month" disabled={!canPrev} onClick={() => onNavigate(-1)}>
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <span className="month-title" aria-live="polite">
          {MO[c.getMonth()]} <small>{c.getFullYear()}</small>
        </span>
        <div className="btn-group">
          {!onTodayMonth && (
            <button className="btn icon" aria-label="Go to current month" title="Current month" onClick={() => onNavigate(monthDelta(cursor, today))}>
              <CalendarCheck size={16} aria-hidden="true" />
            </button>
          )}
          <button className="btn round" aria-label="Next month" disabled={!canNext} onClick={() => onNavigate(1)}>
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div ref={swipeRef} className="swipe-area">
        <div key={cursor} className={`day-transition slide-${slideDir}`}>
          <div className="month-grid" ref={gridRef} role="grid" aria-label={`${MO[c.getMonth()]} ${c.getFullYear()}`} onKeyDown={handleKeyDown}>
            {WD_S.map((w) => <div key={w} className="month-weekday" aria-hidden="true">{w[0]}</div>)}
            {cells.map(({ iso, inMonth }) => (
              <MonthCell
                key={iso}
                iso={iso}
                inMonth={inMonth}
                info={dayInfo[iso]}
                inRange={iso >= MIN_DATE && iso <= MAX_DATE}
                selectedDate={selectedDate}
                today={today}
                focusedISO={focusedISO}
                leagueFilter={leagueFilter}
                onPick={onPick}
                onFocus={setFocusedISO}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="month-legend" aria-hidden="true">
        {legendComps.map((id) => (
          <span key={id}><i style={{ background: DOT_COLORS[id] }} />{fixtures.comps[id].short}</span>
        ))}
        <span><i style={{ background: "var(--accent)" }} />&#9733; Derby</span>
      </div>
    </div>
  );
}
