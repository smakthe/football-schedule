import { useEffect, useRef } from 'react';
import fixtures from '../data/fixtures.json';
import { DISPLAY_ORDER } from '../data/constants.js';
import CompBadge from './CompBadge.jsx';

// Always-visible chip rail. Tapping the active league clears it; "All" is an
// explicit escape hatch so the behaviour is discoverable on touch.
export default function LeagueFilter({ active, onChange }) {
  const railRef = useRef(null);

  useEffect(() => {
    railRef.current
      ?.querySelector('[aria-checked="true"]')
      ?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [active]);

  function handleKeyDown(e) {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const chips = [...railRef.current.querySelectorAll('[role="radio"]')];
    const cur = chips.indexOf(document.activeElement);
    let next = cur;
    if (e.key === "ArrowRight") next = (cur + 1) % chips.length;
    else if (e.key === "ArrowLeft") next = (cur - 1 + chips.length) % chips.length;
    else if (e.key === "Home") next = 0;
    else next = chips.length - 1;
    chips[next]?.focus();
    chips[next]?.click();
  }

  return (
    <div
      ref={railRef}
      className="league-rail"
      role="radiogroup"
      aria-label="Filter by competition"
      onKeyDown={handleKeyDown}
    >
      <button
        role="radio"
        aria-checked={active == null}
        tabIndex={active == null ? 0 : -1}
        className={"chip all" + (active == null ? " active" : "")}
        onClick={() => onChange(null)}
      >
        All
      </button>
      {DISPLAY_ORDER.map((id) => {
        const comp = fixtures.comps[id];
        const isActive = active === id;
        return (
          <button
            key={id}
            role="radio"
            aria-checked={isActive}
            tabIndex={isActive ? 0 : -1}
            className={"chip" + (isActive ? " active" : "")}
            style={{ "--chip-color": comp.color }}
            onClick={() => onChange(isActive ? null : id)}
          >
            <CompBadge comp={comp} size={20} />
            <span>{comp.name}</span>
          </button>
        );
      })}
    </div>
  );
}
