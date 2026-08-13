import React from 'react';

function VenueBadge({ isHome, style, className = "" }) {
  return (
    <span 
      className={`venue-badge ${isHome ? 'home' : 'away'} ${className}`} 
      title={isHome ? 'Home' : 'Away'}
      style={style}
    >
      {isHome ? 'H' : 'A'}
    </span>
  );
}

export default React.memo(VenueBadge);
