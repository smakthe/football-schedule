import { useEffect, useRef } from 'react';

// Horizontal swipe detection for touch/pen. Pair with `touch-action: pan-y`
// on the element so vertical scrolling still belongs to the browser.
export function useSwipe(ref, { onSwipeLeft, onSwipeRight, threshold = 56 }) {
  const handlers = useRef({ onSwipeLeft, onSwipeRight });
  handlers.current = { onSwipeLeft, onSwipeRight };

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    let startX = 0, startY = 0, tracking = false;

    function down(e) {
      if (e.pointerType === 'mouse') return;
      startX = e.clientX; startY = e.clientY; tracking = true;
    }
    function up(e) {
      if (!tracking) return;
      tracking = false;
      const dx = e.clientX - startX, dy = e.clientY - startY;
      if (Math.abs(dx) < threshold || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      if (dx < 0) handlers.current.onSwipeLeft?.();
      else handlers.current.onSwipeRight?.();
    }
    function cancel() { tracking = false; }

    const opts = { passive: true };
    el.addEventListener('pointerdown', down, opts);
    el.addEventListener('pointerup', up, opts);
    el.addEventListener('pointercancel', cancel, opts);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', cancel);
    };
  }, [ref, threshold]);
}
