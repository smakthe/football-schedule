import React from 'react';


export default function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-glyph">&#9917;</div>
      <p className="empty-title">No matches on this date.</p>
    </div>
  );
}
