import fixtures from '../data/fixtures.json';
import { DISPLAY_ORDER, M_HOME, M_AWAY, M_TIME } from '../data/constants.js';
import { longDate } from './dates.js';

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
  DISPLAY_ORDER.forEach((id) => {
    const matches = matchesByComp[id];
    if (!matches.length) return;
    any = true;
    lines.push(fixtures.comps[id].name.toUpperCase());
    matches.forEach((m) => {
      const home = fixtures.teams[m[M_HOME]], away = fixtures.teams[m[M_AWAY]], time = m[M_TIME];
      lines.push(`${home} vs ${away}${time ? " \u2014 " + time + " UK" : ""}`);
    });
    lines.push("");
  });
  if (!any) lines.push("No matches from these five competitions today.");
  return lines.join("\n").trim();
}
