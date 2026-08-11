import { MIN_DATE, MAX_DATE, WD_S, MO } from '../data/constants.js';

// All dates are plain YYYY-MM-DD strings.
// fromISO/toISO deliberately construct *local* Date objects (not UTC).
// See README §3 — avoids day-shift in negative-offset time zones.

export function pad(n) { return String(n).padStart(2, '0'); }

export function toISO(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromISO(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso, n) {
  const d = fromISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

export function addMonths(iso, n) {
  const d = fromISO(iso);
  d.setMonth(d.getMonth() + n, 1);
  return toISO(d);
}

export function clampISO(iso) {
  if (iso < MIN_DATE) return MIN_DATE;
  if (iso > MAX_DATE) return MAX_DATE;
  return iso;
}

export function todayISO() { return toISO(new Date()); }

export function getMonthCells(cursorISO) {
  const d = fromISO(cursorISO);
  const year = d.getFullYear(), month = d.getMonth();
  const first = new Date(year, month, 1);
  const startOff = first.getDay();
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const cell = new Date(year, month, 1 - startOff + i);
    cells.push({ iso: toISO(cell), inMonth: cell.getMonth() === month });
  }
  return cells;
}

export function longDate(iso) {
  const d = fromISO(iso);
  return `${WD_S[d.getDay()]}, ${d.getDate()} ${MO[d.getMonth()]} ${d.getFullYear()}`;
}

export function shortDate(iso) {
  const [, m, d] = iso.split('-');
  return `${Number(d)} ${MO[Number(m) - 1].slice(0, 3)}`;
}

export function cellLabel(iso, info) {
  const base = longDate(iso);
  if (!info) return `${base}, no matches`;
  const parts = [`${info.n} ${info.n === 1 ? "match" : "matches"}`];
  if (info.riv.length) parts.push(info.riv.join(", "));
  return `${base}, ${parts.join(", ")}`;
}
