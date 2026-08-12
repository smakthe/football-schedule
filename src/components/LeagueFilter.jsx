import { useState, useRef, useCallback, useEffect } from 'react';
import fixtures from '../data/fixtures.json';
import { DISPLAY_ORDER } from '../data/constants.js';
import { LEAGUE_THEMES } from '../config/leagueThemes.js';

export default function LeagueFilter({ active, onChange }) {
  const [expanded, setExpanded] = useState(false);
  const collapseTimer = useRef(null);
  const wrapRef = useRef(null);

  // Close on click/tap outside
  useEffect(() => {
    if (!expanded) return;
    function onDown(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setExpanded(false);
      }
    }
    document.addEventListener('pointerdown', onDown, true);
    return () => document.removeEventListener('pointerdown', onDown, true);
  }, [expanded]);

  function handlePick(compId) {
    onChange(active === compId ? null : compId);
  }

  function handleToggle() {
    setExpanded(!expanded);
  }

  const clearCollapseTimer = useCallback(() => {
    if (collapseTimer.current) {
      clearTimeout(collapseTimer.current);
      collapseTimer.current = null;
    }
  }, []);

  const startCollapseTimer = useCallback(() => {
    clearCollapseTimer();
    collapseTimer.current = setTimeout(() => {
      setExpanded(false);
    }, 100);
  }, [clearCollapseTimer]);

  const hasFilter = active !== null;
  const activeComp = hasFilter ? LEAGUE_THEMES[active] : null;

  return (
    <div
      className="league-filter-wrap"
      ref={wrapRef}
      onMouseEnter={() => { clearCollapseTimer(); setExpanded(true); }}
      onMouseLeave={startCollapseTimer}
    >
      <button
        className={"league-filter-toggle" + (hasFilter ? " filtered" : "")}
        onClick={handleToggle}
        aria-label={expanded ? "Collapse league filter" : "Expand league filter"}
        aria-expanded={expanded}
        style={hasFilter ? { color: activeComp.colors.secondary } : undefined}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M1 2h14M3 5.5h10M5.5 9h5M7 12.5h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        {hasFilter && !expanded && (
          <span className="filter-active-label" style={{ fontSize: '14px' }}>{activeComp.emoji}</span>
        )}
      </button>
      <div className={"league-filter-pills" + (expanded ? " open" : "")}>
        {DISPLAY_ORDER.map((id) => {
          const comp = LEAGUE_THEMES[id];
          const origComp = fixtures.comps[id];
          return (
            <button
              key={id}
              className={"filter-pill" + (active === id ? " active" : "")}
              style={{
                "--pill-color": comp.colors.secondary,
                "--pill-bg": comp.colors.primary,
                fontSize: '14px'
              }}
              onClick={() => handlePick(id)}
              aria-label={origComp.name}
            >
              {comp.emoji}
            </button>
          );
        })}
      </div>
    </div>
  );
}
