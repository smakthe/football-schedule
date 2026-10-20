import fixtures from '../data/fixtures.json';
import { DISPLAY_ORDER, M_HOME, M_AWAY, M_TIME, M_COMP, SOURCE_TZ, COMP_EPL, COMP_UCL } from '../data/constants.js';
import { longDate } from './dates.js';
import { kickoffToLocalDate } from './timezone.js';

function getSourceLabel(compId) {
  return SOURCE_TZ[compId]?.label || SOURCE_TZ[COMP_EPL].label;
}

function getLocalTime(dateISO, time, compId) {
  if (!time) return "";
  const src = SOURCE_TZ[compId] || SOURCE_TZ[COMP_EPL];
  const localDate = kickoffToLocalDate(src.zone, dateISO, time);
  return localDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function buildMatchShareText(m, date) {
  const home = fixtures.teams[m[M_HOME]], away = fixtures.teams[m[M_AWAY]], time = m[M_TIME], compId = m[M_COMP];
  const compName = compId === COMP_UCL ? "UEFA Champions League" : fixtures.comps[compId]?.name || "";
  const localTime = getLocalTime(date, time, compId);
  const sourceLabel = getSourceLabel(compId);
  return `\u26bd ${home} vs ${away}\n${compName ? compName + "\n" : ""}${longDate(date)}${time ? " \u2014 " + time + " " + sourceLabel + " (" + localTime + " Local)" : ""}`;
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

export function buildShareText(selectedDate, matchesByComp, leagueFilter = null) {
  const lines = [`\u26bd ${longDate(selectedDate)}`, ""];
  let any = false;
  const order = leagueFilter == null ? [...DISPLAY_ORDER] : [leagueFilter];

  order.forEach((id) => {
    const matches = matchesByComp[id];
    if (!matches || !matches.length) return;
    any = true;
    const compName = fixtures.comps[id].name.toUpperCase();
    lines.push(compName);
    matches.forEach((m) => {
      const home = fixtures.teams[m[M_HOME]], away = fixtures.teams[m[M_AWAY]], time = m[M_TIME];
      const localTime = getLocalTime(selectedDate, time, id);
      const sourceLabel = getSourceLabel(id);
      lines.push(`${home} vs ${away}${time ? " \u2014 " + time + " " + sourceLabel + " (" + localTime + " Local)" : ""}`);
    });
    lines.push("");
  });
  if (!any) lines.push("No matches today.");
  return lines.join("\n").trim();
}
