import fixtures from './fixtures.json';

export const MATCH_DATE_SET = new Set(fixtures.matchDates);

const RIVALRY_MAP = new Map();
for (const [homeId, awayId, label] of fixtures.rivalries) {
  RIVALRY_MAP.set(`${homeId}-${awayId}`, label);
  RIVALRY_MAP.set(`${awayId}-${homeId}`, label);
}

export function rivalryLabel(homeId, awayId) {
  return RIVALRY_MAP.get(`${homeId}-${awayId}`) || null;
}

export const TEAM_COMP = new Array(76);
export const TEAMS_BY_COMP = {};
for (const comp of fixtures.comps) {
  TEAMS_BY_COMP[comp.id] = [];
}

for (const date in fixtures.dateIndex) {
  for (const m of fixtures.dateIndex[date]) {
    TEAM_COMP[m[1]] = m[0];
    TEAM_COMP[m[2]] = m[0];
  }
}
for (const m of fixtures.bundesliga) {
  TEAM_COMP[m[2]] = 3;
  TEAM_COMP[m[3]] = 3;
}

export const RIVALRY_COMP = {};
for (const [homeId, , label] of fixtures.rivalries) {
  RIVALRY_COMP[label] = TEAM_COMP[homeId];
}

for (let i = 0; i < fixtures.teams.length; i++) {
  const compId = TEAM_COMP[i];
  if (compId !== undefined && TEAMS_BY_COMP[compId]) {
    TEAMS_BY_COMP[compId].push({ id: i });
  }
}

export const DOT_COLORS = {};
for (const comp of fixtures.comps) {
  DOT_COLORS[comp.id] = comp.color;
}
DOT_COLORS[4] = fixtures.ucl.color;

// Precompute team fixtures (O(1) lookup vs O(N) scan on render)
export const TEAM_FIXTURES = new Array(fixtures.teams.length).fill(null).map(() => []);

for (const [iso, matches] of Object.entries(fixtures.dateIndex)) {
  for (const m of matches) {
    const compId = m[0], home = m[1], away = m[2], time = m[3], round = m[4];
    TEAM_FIXTURES[home].push({ date: iso, date2: iso, compId, isHome: true, oppId: away, time, round });
    TEAM_FIXTURES[away].push({ date: iso, date2: iso, compId, isHome: false, oppId: home, time, round });
  }
}

for (const [start, end, home, away, round] of fixtures.bundesliga) {
  TEAM_FIXTURES[home].push({ date: start, date2: end, compId: 3, isHome: true, oppId: away, time: null, round });
  TEAM_FIXTURES[away].push({ date: start, date2: end, compId: 3, isHome: false, oppId: home, time: null, round });
}

for (let i = 0; i < TEAM_FIXTURES.length; i++) {
  TEAM_FIXTURES[i].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}
