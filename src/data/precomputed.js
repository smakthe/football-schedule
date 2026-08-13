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
for (const [homeId, awayId, label] of fixtures.rivalries) {
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
