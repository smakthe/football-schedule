export const LEAGUE_THEMES = {
  0: {
    id: 0,
    emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    colors: {
      primary: "#3D1F8C", // Original fixtures.comps[0].color
      secondary: "#6C3FE0", // Original fixtures.comps[0].color2
    },
    cssVars: {
      "--bg": "#0E0A1E",
      "--surface": "#17123A",
      "--surface-2": "#201848",
      "--border": "rgba(180,160,255,0.1)",
      "--text-dim": "#A89DC8",
      "--text-faint": "#6B5F8E"
    }
  },
  1: {
    id: 1,
    emoji: "🇪🇸",
    colors: {
      primary: "#E0402C",
      secondary: "#FF6A45",
    },
    cssVars: {
      "--bg": "#1C0C08",
      "--surface": "#2E1610",
      "--surface-2": "#3D1E16",
      "--border": "rgba(255,150,120,0.1)",
      "--text-dim": "#CBA090",
      "--text-faint": "#8E6558"
    }
  },
  2: {
    id: 2,
    emoji: "🇫🇷",
    colors: {
      primary: "#0A3399",
      secondary: "#3B6FE0",
    },
    cssVars: {
      "--bg": "#080D1E",
      "--surface": "#0F1838",
      "--surface-2": "#152248",
      "--border": "rgba(120,160,255,0.1)",
      "--text-dim": "#97ABCB",
      "--text-faint": "#5A6E8E"
    }
  },
  3: {
    id: 3,
    emoji: "🇩🇪",
    colors: {
      primary: "#C8102E",
      secondary: "#FF3B4E",
    },
    cssVars: {
      "--bg": "#1C0A0E",
      "--surface": "#2E1218",
      "--surface-2": "#3D1A22",
      "--border": "rgba(255,120,140,0.1)",
      "--text-dim": "#CB9AA2",
      "--text-faint": "#8E5860"
    }
  }
};

export const THEME_CSS_VARS = [
  "--bg",
  "--surface",
  "--surface-2",
  "--border",
  "--text-dim",
  "--text-faint"
];

// Helper to get the fallback accent color for UI components
import fixtures from '../data/fixtures.json';
export function getThemeAccent(compId) {
  return LEAGUE_THEMES[compId]?.colors.secondary || fixtures.comps[compId]?.color2;
}
