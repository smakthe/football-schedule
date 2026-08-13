import fixtures from '../data/fixtures.json';
import { DISPLAY_ORDER, M_HOME, M_AWAY, M_TIME, M_COMP, SOURCE_TZ, COMP_EPL } from '../data/constants.js';
import { longDate } from './dates.js';
import { kickoffToLocalDate } from './timezone.js';

function getISTTime(dateISO, time, compId) {
  if (!time) return "";
  const src = SOURCE_TZ[compId] || SOURCE_TZ[COMP_EPL];
  const localDate = kickoffToLocalDate(src.zone, dateISO, time);
  return localDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' });
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(el);
      return ok;
    } catch {
      return false;
    }
  }
}

export function buildShareText(selectedDate, matchesByComp) {
  const lines = [`\u26bd ${longDate(selectedDate)}`, ""];
  let any = false;
  
  const order = [...DISPLAY_ORDER];
  if (matchesByComp['ucl'] && matchesByComp['ucl'].length > 0) {
    order.unshift('ucl');
  }

  order.forEach((id) => {
    const matches = matchesByComp[id];
    if (!matches || !matches.length) return;
    any = true;
    const compName = id === 'ucl' ? "CHAMPIONS LEAGUE" : fixtures.comps[id].name.toUpperCase();
    lines.push(compName);
    matches.forEach((m) => {
      const home = fixtures.teams[m[M_HOME]], away = fixtures.teams[m[M_AWAY]], time = m[M_TIME];
      const istTime = getISTTime(selectedDate, time, id);
      lines.push(`${home} vs ${away}${time ? " \u2014 " + time + " UK (" + istTime + " IST)" : ""}`);
    });
    lines.push("");
  });
  if (!any) lines.push("No matches today.");
  return lines.join("\n").trim();
}
