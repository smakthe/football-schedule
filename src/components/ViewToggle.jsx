import { useRef } from 'react';

const VIEW_MODES = ["day", "month", "team"];

export default function ViewToggle({ mode, onChange }) {
  const ref = useRef(null);
  
  function handleKeyDown(e) {
    const idx = VIEW_MODES.indexOf(mode);
    let next;
    if (e.key === "ArrowRight") next = (idx + 1) % VIEW_MODES.length;
    else if (e.key === "ArrowLeft") next = (idx - 1 + VIEW_MODES.length) % VIEW_MODES.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = VIEW_MODES.length - 1;
    else return;
    
    e.preventDefault();
    onChange(VIEW_MODES[next]);
    ref.current?.querySelectorAll("button")[next]?.focus();
  }
  
  return (
    <div className="view-toggle" role="tablist" aria-label="Calendar view" ref={ref} onKeyDown={handleKeyDown}>
      {VIEW_MODES.map((m) => (
        <button
          key={m}
          role="tab"
          aria-selected={mode === m}
          tabIndex={mode === m ? 0 : -1}
          className={mode === m ? "active" : ""}
          onClick={() => onChange(m)}
        >
          {m === "team" ? "club" : m}
        </button>
      ))}
    </div>
  );
}
