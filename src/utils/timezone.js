// Timezone conversion — how it works without a library (README §8)
// 1. Guess a UTC instant by treating published wall-clock time as UTC
// 2. Ask what UTC offset the source league's time zone has at that instant
// 3. Subtract that offset to get true UTC instant
// 4. Display it with toLocaleTimeString (defaults to viewer's device zone)

export function tzFormatter(zone) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
    hour12: false
  });
}

export function zoneOffsetMinutes(zone, dateObj) {
  const f = tzFormatter(zone);
  const parts = f.formatToParts(dateObj);
  const get = (type) => parseInt(parts.find(p => p.type === type).value, 10);
  // Construct what the time is *in that zone*
  const zDate = new Date(Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second')));
  // Offset is difference between that and the actual UTC instant we asked about
  return Math.round((zDate.getTime() - dateObj.getTime()) / 60000);
}

export function kickoffToLocalDate(sourceZone, dateISO, timeStr) {
  const [hh, mm] = timeStr.split(':').map(Number);
  const [y, m, d] = dateISO.split('-').map(Number);
  
  // 1. Guess UTC
  const guessUTC = new Date(Date.UTC(y, m - 1, d, hh, mm));
  
  // 2. Get offset of the source zone at that guessed instant
  const sourceOffset = zoneOffsetMinutes(sourceZone, guessUTC);
  
  // 3. Subtract offset to get true UTC instant
  const trueUTC = new Date(guessUTC.getTime() - sourceOffset * 60000);
  return trueUTC;
}

export function formatLocalHM(dateObj) {
  return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function localDayShift(originalISO, localDateObj) {
  const localISO = `${localDateObj.getFullYear()}-${String(localDateObj.getMonth()+1).padStart(2,'0')}-${String(localDateObj.getDate()).padStart(2,'0')}`;
  if (localISO === originalISO) return 0;
  return localISO > originalISO ? 1 : -1;
}
