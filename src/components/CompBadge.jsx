import React from 'react';

function CompBadge({ comp, size = 30 }) {
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
