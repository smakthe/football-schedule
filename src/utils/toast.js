// Tiny pub/sub so any component can raise a toast without prop drilling.
const listeners = new Set();
let seq = 0;

export function toast(message) {
  const entry = { id: ++seq, message };
  listeners.forEach((fn) => fn(entry));
}

export function onToast(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
