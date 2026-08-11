import React, { useMemo, useRef, useState, useEffect } from 'react';
import { MO, WD_S, MIN_DATE, MAX_DATE } from '../data/constants.js';
import { getMonthCells, fromISO, addDays, clampISO, addMonths, cellLabel } from '../utils/dates.js';
import CalendarDots from './CalendarDots.jsx';

export default function MonthView({ cursor, onNavigate, selectedDate, today, onPick, dayInfo }) {
  const cells = useMemo(() => getMonthCells(cursor), [cursor]);
  const c = fromISO(cursor);
  const gridRef = useRef(null);
  
  // README §9 bug #3 fix: Only genuine keyboard moves pull focus, never unrelated re-renders
  const pendingFocusRef = useRef(false);
  
  const [focusedISO, setFocusedISO] = useState(() => {
    const inThisMonth = cells.some((cell) => cell.iso === selectedDate && cell.inMonth);
    return inThisMonth ? selectedDate : cursor;
  });

  useEffect(() => {
    if (!pendingFocusRef.current) return;
    pendingFocusRef.current = false;
    gridRef.current?.querySelector(`[data-iso="${focusedISO}"]`)?.focus();
  }, [cursor, focusedISO]);

  function moveFocus(deltaDays) {
    const target = clampISO(addDays(focusedISO, deltaDays));
    pendingFocusRef.current = true;
    setFocusedISO(target);
    const targetMonthKey = target.slice(0, 7), cursorMonthKey = cursor.slice(0, 7);
    if (targetMonthKey !== cursorMonthKey) {
      const [ty, tm] = target.split("-").map(Number), [cy, cm] = cursor.split("-").map(Number);
      onNavigate((ty - cy) * 12 + (tm - cm));
    }
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
    if (e.key === "PageDown") { e.preventDefault(); pageMonth(1); return; }
  }

  return (
    <div className="calendar-view">
      <div className="cal-header">
        <button className="page-btn" aria-label="Previous month" onClick={() => onNavigate(-1)}>&#8249;</button>
        <span className="cal-title">{MO[c.getMonth()]} {c.getFullYear()}</span>
        <button className="page-btn" aria-label="Next month" onClick={() => onNavigate(1)}>&#8250;</button>
      </div>
      <div className="month-grid" ref={gridRef} role="grid" aria-label={`${MO[c.getMonth()]} ${c.getFullYear()}`} onKeyDown={handleKeyDown}>
        {WD_S.map((w) => <div key={w} className="month-weekday" aria-hidden="true">{w[0]}</div>)}
        {cells.map(({ iso, inMonth }) => {
          const info = dayInfo[iso];
          const inRange = iso >= MIN_DATE && iso <= MAX_DATE;
          const cls = ["month-cell"];
          if (!inMonth) cls.push("outside");
          if (!inRange) cls.push("disabled");
          if (iso === selectedDate) cls.push("selected");
          if (iso === today) cls.push("today");
          
          return (
            <button
              key={iso} data-iso={iso} role="gridcell" className={cls.join(" ")} disabled={!inRange}
              tabIndex={iso === focusedISO ? 0 : -1}
              aria-label={cellLabel(iso, info)}
              aria-current={iso === today ? "date" : undefined}
              aria-selected={iso === selectedDate}
              onClick={() => { setFocusedISO(iso); onPick(iso); }}
            >
              {info && info.riv.length > 0 && <span className="cal-star" aria-hidden="true">&#9733;</span>}
              <span className="month-daynum" aria-hidden="true">{fromISO(iso).getDate()}</span>
              <CalendarDots ids={info ? info.c : []} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
