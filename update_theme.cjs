const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'index.css');
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Root variables
css = css.replace(/:root\s*\{[^}]*\}/, `:root {
  --bg: #FDFDF8;
  --surface: #F9F6E8;
  --surface-2: #F0E8CE;
  --border: rgba(0, 0, 0, 0.08);
  --text: #1E1B15;
  --text-dim: #716853;
  --text-faint: #A69E8A;
}`);

// 2. Pill fg fallback (add to active)
css = css.replace(/background: var\(--pill-bg, #2A4A3C\);/g, 'background: var(--pill-bg, #FEF08A);');
css = css.replace(/color: #fff;/g, 'color: var(--pill-fg, #1E1B15);'); // Only in .filter-pill.active! Wait, let's be more precise:
css = css.replace(/color: var\(--pill-fg, #1E1B15\);/g, 'color: #fff;'); // Revert if already modified

css = css.replace(/.filter-pill.active \{[\s\S]*?\}/, `.filter-pill.active {
  background: var(--pill-bg, #FEF08A);
  color: var(--pill-fg, #1E1B15);
  border-color: var(--pill-color, #FACC15);
  box-shadow: 0 0 16px -2px color-mix(in srgb, var(--pill-color, #FACC15) 40%, transparent);
  transform: scale(1);
}`);

// 3. Selection background
css = css.replace(/::selection \{ background: #3B6FE0; color: white; \}/g, '::selection { background: #FEF08A; color: #1E1B15; }');

// 4. Calendar gradient and border
css = css.replace(/#2A4A3C/g, '#FEF08A');
css = css.replace(/#16281F/g, '#FDE047');
css = css.replace(/#3E6A54/g, '#FACC15');

// 5. Month cell hover border
css = css.replace(/border-color: rgba\(255,255,255,0\.2\);/g, 'border-color: rgba(0, 0, 0, 0.15);');
css = css.replace(/border-color: rgba\(255, 255, 255, 0\.2\);/g, 'border-color: rgba(0, 0, 0, 0.15);');

// 6. Day pill hover
css = css.replace(/\.day-pill:hover:not\(\.selected\) \{ border-color: rgba\(255,255,255,0\.2\); color: var\(--text\); \}/, '.day-pill:hover:not(.selected) { border-color: rgba(0,0,0,0.15); color: var(--text); }');

// 7. #5FE0A5 -> #D97706
css = css.replace(/#5FE0A5/g, '#D97706');

// 8. #E0B84A -> #D97706 (Make star match)
css = css.replace(/#E0B84A/g, '#D97706');

// 9. Venue badge away
css = css.replace(/rgba\(255, 255, 255, 0\.1\)/g, 'rgba(0, 0, 0, 0.05)');
css = css.replace(/rgba\(255, 255, 255, 0\.15\)/g, 'rgba(0, 0, 0, 0.1)');

// 10. rgba(95, 224, 165... -> rgba(217, 119, 6...
css = css.replace(/rgba\(95, 224, 165, 0\.25\)/g, 'rgba(217, 119, 6, 0.25)');
css = css.replace(/rgba\(95, 224, 165, 0\.5\)/g, 'rgba(217, 119, 6, 0.5)');
css = css.replace(/rgba\(95, 224, 165, 0\.15\)/g, 'rgba(217, 119, 6, 0.15)');
css = css.replace(/rgba\(95, 224, 165, 0\.3\)/g, 'rgba(217, 119, 6, 0.3)');

// 11. Empty state
css = css.replace(/background: rgba\(255, 255, 255, 0\.03\);/g, 'background: rgba(0, 0, 0, 0.03);');

// 12. Fix `.month-cell.selected` text color to ensure dark text on champagne gradient
css = css.replace(/\.month-cell\.selected \{ background: linear-gradient\(160deg, #FEF08A, #FDE047\); border-color: #FACC15; \}/, '.month-cell.selected { background: linear-gradient(160deg, #FEF08A, #FDE047); border-color: #FACC15; color: #1E1B15; }');

// 13. Fix `.day-pill.selected` text color
css = css.replace(/\.day-pill\.selected \{\s+background: linear-gradient\(160deg, #FEF08A, #FDE047\);\s+border-color: #FACC15;\s+color: var\(--text\);\s+\}/, `.day-pill.selected {
  background: linear-gradient(160deg, #FEF08A, #FDE047);
  border-color: #FACC15;
  color: #1E1B15;
}`);

// 14. Fix month-daynum color in selected state
css = css.replace(/\.month-cell\.selected \.month-daynum/g, '.month-cell.selected .month-daynum { color: #1E1B15; }'); // wait, that doesn't exist yet, we can just append it
if (!css.includes('.month-cell.selected .month-daynum')) {
  css += '\n.month-cell.selected .month-daynum { color: #1E1B15; }\n';
  css += '.month-cell.selected .month-weekday { color: rgba(30,27,21,0.6); }\n';
}

fs.writeFileSync(cssPath, css);
console.log('CSS updated successfully.');
