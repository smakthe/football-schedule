import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { onToast } from '../utils/toast.js';

const VISIBLE_MS = 2200;
const LEAVE_MS = 160;

export default function Toaster() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const timers = new Set();
    const unsubscribe = onToast((t) => {
      setToasts((list) => [...list.slice(-1), t]);
      const leave = setTimeout(() => {
        setToasts((list) => list.map((x) => (x.id === t.id ? { ...x, leaving: true } : x)));
      }, VISIBLE_MS);
      const remove = setTimeout(() => {
        setToasts((list) => list.filter((x) => x.id !== t.id));
      }, VISIBLE_MS + LEAVE_MS);
      timers.add(leave); timers.add(remove);
    });
    return () => { unsubscribe(); timers.forEach(clearTimeout); };
  }, []);

  return (
    <div className="toaster" role="status" aria-live="polite" aria-atomic="true">
      {toasts.map((t) => (
        <div key={t.id} className={"toast" + (t.leaving ? " leaving" : "")}>
          <Check size={14} aria-hidden="true" />
          {t.message}
        </div>
      ))}
    </div>
  );
}
