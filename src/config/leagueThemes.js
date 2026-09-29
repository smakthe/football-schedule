// Per-league page palettes, applied as inline custom properties on <html>
// while a league filter is active. Competition accent colours (badges, dots,
// chips) come from fixtures.comps — this file only owns the page-level look.
import fixtures from '../data/fixtures.json';

// Every league theme is dark, so native controls, hover borders and shadows
// all need the same adjustments relative to the cream default.
const DARK_SHARED = {
  "color-scheme": "dark",
  "--text": "#F3F5F0",
  "--border-hover": "rgba(255, 255, 255, 0.22)",
  "--shadow-card": "0 4px 12px rgba(0, 0, 0, 0.3)",
  "--shadow-card-hover": "0 10px 28px rgba(0, 0, 0, 0.45)",
  "--shadow-badge": "0 2px 8px rgba(0, 0, 0, 0.4)",
  "--shadow-float": "0 12px 32px rgba(0, 0, 0, 0.5)",
};

function theme(id, palette) {
  return {
    id,
    cssVars: {
      ...DARK_SHARED,
      "--glow": `color-mix(in srgb, ${fixtures.comps[id].color2} 28%, transparent)`,
      ...palette,
    },
  };
}

export const LEAGUE_THEMES = {
  0: theme(0, {
    "--bg": "#0E0A1E",
    "--surface": "#17123A",
    "--surface-2": "#201848",
    "--border": "rgba(180,160,255,0.1)",
    "--text-dim": "#A89DC8",
    "--text-faint": "#6B5F8E",
  }),
  1: theme(1, {
    "--bg": "#1C0C08",
    "--surface": "#2E1610",
    "--surface-2": "#3D1E16",
    "--border": "rgba(255,150,120,0.1)",
    "--text-dim": "#CBA090",
    "--text-faint": "#8E6558",
  }),
  2: theme(2, {
    "--bg": "#080D1E",
    "--surface": "#0F1838",
    "--surface-2": "#152248",
    "--border": "rgba(120,160,255,0.1)",
    "--text-dim": "#97ABCB",
    "--text-faint": "#5A6E8E",
  }),
  3: theme(3, {
    "--bg": "#1C0A0E",
    "--surface": "#2E1218",
    "--surface-2": "#3D1A22",
    "--border": "rgba(255,120,140,0.1)",
    "--text-dim": "#CB9AA2",
    "--text-faint": "#8E5860",
  }),
  4: theme(4, {
    "--bg": "#02072D",
    "--surface": "#040F59",
    "--surface-2": "#071B85",
    "--border": "rgba(179,181,189,0.15)",
    "--text-dim": "#B3B5BD",
    "--text-faint": "#696E7E",
  }),
};

// Every property a theme may set — used to clear them when the filter is removed.
export const THEME_CSS_VARS = [
  ...new Set(Object.values(LEAGUE_THEMES).flatMap((t) => Object.keys(t.cssVars))),
];
