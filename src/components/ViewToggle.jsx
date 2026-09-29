import { useRef } from 'react';
import { CalendarDays, Calendar, Shield } from 'lucide-react';

const VIEWS = [
  { id: "day", label: "Day", Icon: CalendarDays },
  { id: "month", label: "Month", Icon: Calendar },
  { id: "team", label: "Club", Icon: Shield },
];

export default function ViewToggle({ mode, onChange }) {
  const ref = useRef(null);
  const idx = Math.max(0, VIEWS.findIndex((v) => v.id === mode));

  function handleKeyDown(e) {
    let next;
    if (e.key === "ArrowRight") next = (idx + 1) % VIEWS.length;
    else if (e.key === "ArrowLeft") next = (idx - 1 + VIEWS.length) % VIEWS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = VIEWS.length - 1;
    else return;
    e.preventDefault();
    onChange(VIEWS[next].id);
    ref.current?.querySelectorAll("button")[next]?.focus();
  }

  return (
    <nav className="view-nav" role="tablist" aria-label="View" ref={ref} onKeyDown={handleKeyDown}>
      <span
        className="view-nav-indicator"
        aria-hidden="true"
        style={{ transform: `translateX(calc(${idx} * (100% + 2px)))` }}
      />
      {VIEWS.map(({ id, label, Icon }) => (
        <button
          key={id}
          role="tab"
          className="view-tab"
          aria-selected={mode === id}
          tabIndex={mode === id ? 0 : -1}
          onClick={() => onChange(id)}
        >
          <Icon size={17} strokeWidth={2} aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
