import { SOURCE_TZ, COMP_EPL } from '../data/constants.js';
import { kickoffToLocalDate } from './timezone.js';
import { addDays } from './dates.js';

export function icsEscape(str) {
  return String(str).replace(/[\\,;]/g, (m) => "\\" + m).replace(/\n/g, "\\n");
}

export function icsTimestamp(date) {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export function icsDateOnly(iso) { 
  return iso.replace(/-/g, ""); 
}

let icsSeq = 0;

// Builds one VEVENT. Timed (Premier League, confirmed kickoff) matches use the
// real UTC instant computed the same way the on-screen kickoff time is; matches
// without a confirmed time become an honest all-day event rather than guessing.
export function matchToVEvent({ dateISO, compName, homeName, awayName, time, round, compId }) {
  const summary = icsEscape(`${homeName} vs ${awayName}`);
  const desc = icsEscape(`${compName}${round ? " \u00b7 Matchday " + round : ""}`);
  const uid = `fsw-${dateISO}-${homeName}-${awayName}-${icsSeq++}`.replace(/[^A-Za-z0-9-]/g, "").slice(0, 120) + "@football-schedule";
  let dtLines;
  if (time) {
    const zone = (SOURCE_TZ[compId] || SOURCE_TZ[COMP_EPL]).zone;
    const start = kickoffToLocalDate(zone, dateISO, time);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    dtLines = `DTSTART:${icsTimestamp(start)}\r\nDTEND:${icsTimestamp(end)}`;
  } else {
    dtLines = `DTSTART;VALUE=DATE:${icsDateOnly(dateISO)}\r\nDTEND;VALUE=DATE:${icsDateOnly(addDays(dateISO, 1))}`;
  }
  return [
    "BEGIN:VEVENT", `UID:${uid}`, `DTSTAMP:${icsTimestamp(new Date())}`, dtLines,
    `SUMMARY:${summary}`, `DESCRIPTION:${desc}`, "END:VEVENT",
  ].join("\r\n");
}

export function buildICS(vevents) {
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Football Schedule Widget//EN", "CALSCALE:GREGORIAN",
    ...vevents, "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadICS(filename, content) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
