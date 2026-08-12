import React from 'react';
import CompBadge from './CompBadge.jsx';

export default function SectionHeader({ comp, subtitle }) {
  return (
    <div className="league-header">
      <CompBadge comp={comp} />
      <div className="league-title">
        <h2>{comp.name}</h2>
        <span className="league-sub">{subtitle}</span>
      </div>
    </div>
  );
}
