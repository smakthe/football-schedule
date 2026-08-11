import React, { useState, useEffect } from 'react';
import fixtures from '../data/fixtures.json';
import { initialsOf } from '../utils/search.js';

export function Crest({ teamId, size = 26 }) {
  const name = fixtures.teams[teamId];
  const [src, setSrc] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // Dynamic import for logos.json so it lazy loads (160KB payload)
    import('../data/logos.json').then((module) => {
      setSrc(module.default[teamId]);
    }).catch(() => {
      setFailed(true);
    });
  }, [teamId]);

  if (!src || failed) {
    return (
      <div className="crest-fallback" style={{ width: size, height: size, fontSize: size * 0.36 }}>
        {initialsOf(name)}
      </div>
    );
  }
  return <img src={src} alt="" className="crest" style={{ width: size, height: size }} onError={() => setFailed(true)} />;
}

// React.memo prevents re-rendering on parent updates
export default React.memo(Crest);
