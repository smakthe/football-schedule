import fixtures from '../data/fixtures.json';

export function searchTeams(query) {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  return fixtures.teams
    .map((name, id) => ({ id, name }))
    .filter((t) => t.name.toLowerCase().includes(q))
    .sort((a, b) => {
      const aw = a.name.toLowerCase().startsWith(q) ? 0 : 1;
      const bw = b.name.toLowerCase().startsWith(q) ? 0 : 1;
      return aw - bw || a.name.localeCompare(b.name);
    });
}

export function initialsOf(name) {
  const words = name.replace(/[^A-Za-zÀ-ÿ0-9 ]/g, "").split(" ").filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}
