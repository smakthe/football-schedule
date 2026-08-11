import React from 'react';
import fixtures from '../data/fixtures.json';
import CompBadge from './CompBadge.jsx';

export default function UCLSection({ rounds }) {
  if (!rounds.length) return null;
  const comp = fixtures.ucl;
  
  return (
    <section className="league-section ucl" style={{ "--accent": comp.color, "--accent2": comp.color2 }}>
      <div className="league-header">
        <CompBadge comp={comp} />
        <div className="league-title">
          <h2>{comp.name}</h2>
          <span className="league-sub">Pairings confirmed after the 27 Aug 2026 draw</span>
        </div>
      </div>
      <div className="ucl-rounds">
        {rounds.map((r, i) => (
          <div className="ucl-round" key={i}>
            <span className="ucl-round-label">{r.label}</span>
            {r.note && <span className="ucl-round-note">{r.note}</span>}
          </div>
        ))}
      </div>
    </section>
  );
}
