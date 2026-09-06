import React, { useState, useEffect } from 'react';
import fixtures from '../data/fixtures.json';
import { initialsOf } from '../utils/search.js';

// Singleton promise — shared by all Crest instances.
// The dynamic import is called once; subsequent calls return the cached module.
let logosPromise = null;
let logosData = null;

function ensureLogos() {
  if (!logosPromise) {
    logosPromise = import('../data/logos.json').then((module) => {
      logosData = module.default;
      return logosData;
    });
  }
  return logosPromise;
}

export function Crest({ teamId, size = 26 }) {
  const name = fixtures.teams[teamId];
  const [ready, setReady] = useState(logosData !== null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (logosData) return; // Already loaded
    let cancelled = false;
    ensureLogos().then(() => {
      if (!cancelled) setReady(true);
    }).catch(() => {
      if (!cancelled) setFailed(true);
    });
    return () => { cancelled = true; };
  }, []);

  const src = logosData?.[teamId];

  if (!src || failed || !ready) {
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
