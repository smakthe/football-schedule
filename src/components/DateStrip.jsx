import React, { useRef, useState, useMemo, useEffect } from 'react';
import { MIN_DATE, MAX_DATE, WD_S } from '../data/constants.js';
import { addDays, clampISO, fromISO, cellLabel } from '../utils/dates.js';
import CalendarDots from './CalendarDots.jsx';

export default function DateStrip({ selected, onSelect, matchDateSet, dayInfo }) {
  const scrollerRef = useRef(null);
  const days = useMemo(() => {
    const arr = [];
    for (let i = -7; i <= 7; i++) arr.push(addDays(selected, i));
    return arr;
  }, [selected]);

  const [focusIdx, setFocusIdx] = useState(7);
  useEffect(() => {
    const idx = days.findIndex((d) => d === selected);
    setFocusIdx(idx === -1 ? 7 : idx);
  }, [days, selected]);

  useEffect(() => {
    const el = scrollerRef.current?.querySelector(".day-pill.selected");
    if (el && typeof el.scrollIntoView === "function") el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [selected]);

  function focusPillAt(idx) {
    setFocusIdx(idx);
    const btn = scrollerRef.current?.querySelectorAll(".day-pill")[idx];
    btn?.focus();
  }

  function handleKeyDown(e) {
    let next;
    if (e.key === "ArrowRight") next = focusIdx + 1;
    else if (e.key === "ArrowLeft") next = focusIdx - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = days.length - 1;
    else return;
    
    e.preventDefault();
    const dir = next >= focusIdx ? 1 : -1;
    while (next >= 0 && next < days.length && (days[next] < MIN_DATE || days[next] > MAX_DATE)) next += dir;
    if (next < 0 || next >= days.length) return;
    focusPillAt(next);
  }

  return (
    <div className="date-strip-wrap">
      <button className="page-btn" aria-label="Previous day" onClick={() => onSelect(clampISO(addDays(selected, -1)))}>&#8249;</button>
      <div className="date-strip" ref={scrollerRef} role="group" aria-label="Browse nearby dates" onKeyDown={handleKeyDown}>
        {days.map((iso, i) => {
          const d = fromISO(iso);
          const isSel = iso === selected;
          const hasMatch = matchDateSet.has(iso);
          const inRange = iso >= MIN_DATE && iso <= MAX_DATE;
          return (
            <button
              key={iso}
              className={"day-pill" + (isSel ? " selected" : "") + (!inRange ? " disabled" : "")}
              disabled={!inRange}
              tabIndex={i === focusIdx ? 0 : -1}
              aria-current={isSel ? "date" : undefined}
              aria-label={cellLabel(iso, dayInfo[iso])}
              onClick={() => { setFocusIdx(i); onSelect(iso); }}
            >
              <span className="day-wd" aria-hidden="true">{WD_S[d.getDay()]}</span>
              <span className="day-num" aria-hidden="true">{d.getDate()}</span>
              {dayInfo[iso]?.c?.length > 0 ? (
                <CalendarDots ids={dayInfo[iso].c} />
              ) : (
                <span className="day-dot" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>
      <button className="page-btn" aria-label="Next day" onClick={() => onSelect(clampISO(addDays(selected, 1)))}>&#8250;</button>
    </div>
  );
}
