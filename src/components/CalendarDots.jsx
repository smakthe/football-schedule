import React from 'react';
import { DOT_COLORS } from '../data/precomputed.js';

export default function CalendarDots({ ids }) {
  if (!ids.length) return null;
  return (
    <span className="cal-dots">
      {ids.slice(0, 5).map((id, i) => (
        <span key={i} className="cal-dot" style={{ background: DOT_COLORS[id] }} />
      ))}
    </span>
  );
}
