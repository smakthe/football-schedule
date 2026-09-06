import React, { useState, useEffect } from 'react';

// Singleton promise — shared by all CompBadge instances.
let leagueLogosPromise = null;
let leagueLogosData = null;

function ensureLeagueLogos() {
  if (!leagueLogosPromise) {
    leagueLogosPromise = import('../data/leagueLogos.json').then((module) => {
      leagueLogosData = module.default;
      return leagueLogosData;
    });
  }
  return leagueLogosPromise;
}

function CompBadge({ comp, size = 30 }) {
  const [ready, setReady] = useState(leagueLogosData !== null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (leagueLogosData) return;
    let cancelled = false;
    ensureLeagueLogos().then(() => {
      if (!cancelled) setReady(true);
    }).catch(() => {
      if (!cancelled) setFailed(true);
    });
    return () => { cancelled = true; };
  }, []);

  const key = comp.id !== undefined ? String(comp.id) : (comp.short === 'UCL' ? 'ucl' : null);
  const src = leagueLogosData?.[key];

  if (src && !failed && ready) {
    return (
      <div 
        className="comp-badge" 
        style={{ 
          width: size, 
          height: size, 
          background: '#ffffff', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
          padding: size * 0.15, 
          boxSizing: 'border-box'
        }}
      >
        <img src={src} alt={comp.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={() => setFailed(true)} />
      </div>
    );
  }

  return (
    <div
      className="comp-badge"
      aria-hidden="true"
      style={{
        width: size, height: size, fontSize: size * 0.34,
        background: `linear-gradient(155deg, ${comp.color2}, ${comp.color})`,
      }}
    >
      {comp.short}
    </div>
  );
}

export default React.memo(CompBadge);
