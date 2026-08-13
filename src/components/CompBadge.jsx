import React, { useState, useEffect } from 'react';

function CompBadge({ comp, size = 30 }) {
  const [src, setSrc] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    import('../data/leagueLogos.json').then((module) => {
      const key = comp.id !== undefined ? String(comp.id) : (comp.short === 'UCL' ? 'ucl' : null);
      setSrc(module.default[key]);
    }).catch(() => {
      setFailed(true);
    });
  }, [comp.id, comp.short]);

  if (src && !failed) {
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
