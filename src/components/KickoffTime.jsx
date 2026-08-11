import React from 'react';
import { SOURCE_TZ, COMP_EPL } from '../data/constants.js';
import { kickoffToLocalDate, formatLocalHM, localDayShift } from '../utils/timezone.js';

export function KickoffTime({ dateISO, time, compId }) {
  if (!time) return <span className="time tbc">TBC</span>;
  const src = SOURCE_TZ[compId] || SOURCE_TZ[COMP_EPL];
  const localDate = kickoffToLocalDate(src.zone, dateISO, time);
  const localStr = formatLocalHM(localDate);
  const shift = localDayShift(dateISO, localDate);
  const isSameAsSource = localStr === time && shift === 0;
  
  return (
    <span className="kickoff-stack">
      <span className="time">
        {localStr}
        {shift !== 0 && (
          <sup 
            className="day-shift" 
            title={shift > 0 ? "Falls on the next day in your time zone" : "Falls on the previous day in your time zone"}
          >
            {shift > 0 ? "+1" : "\u22121"}
          </sup>
        )}
      </span>
      {!isSameAsSource && <span className="uk-ref">{src.label} {time}</span>}
    </span>
  );
}
