// Tuple indices for match arrays in DATA.dateIndex
export const M_COMP = 0;
export const M_HOME = 1;
export const M_AWAY = 2;
export const M_TIME = 3;
export const M_ROUND = 4;

// Competition IDs (indices into DATA.comps)
export const COMP_EPL = 0;
export const COMP_LALIGA = 1;
export const COMP_LIGUE1 = 2;
export const COMP_BUNDESLIGA = 3;
export const COMP_UCL = 4;

// On-screen ordering: EPL → La Liga → Bundesliga → Ligue 1
export const DISPLAY_ORDER = [COMP_EPL, COMP_LALIGA, COMP_BUNDESLIGA, COMP_LIGUE1];

// Season date bounds
export const MIN_DATE = "2026-07-07";
export const MAX_DATE = "2027-06-30";

// Source timezone map — used for kickoff time conversion (README §8)
export const SOURCE_TZ = {
  [COMP_EPL]: { zone: "Europe/London", label: "UK" },
  [COMP_LALIGA]: { zone: "Europe/Madrid", label: "CET" },
  [COMP_LIGUE1]: { zone: "Europe/Paris", label: "CET" },
  [COMP_BUNDESLIGA]: { zone: "Europe/Berlin", label: "CET" },
};

// Short weekday names (Sunday-first)
export const WD_S = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Full month names
export const MO = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Viewer's timezone for display
export const VIEWER_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
