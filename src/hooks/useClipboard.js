import { useState, useCallback, useRef, useEffect } from 'react';
import { copyText } from '../utils/clipboard.js';

export function useClipboard(timeoutMs = 1800) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const copy = useCallback(async (text) => {
    const ok = await copyText(text);
    if (ok) {
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setCopied(false);
        timerRef.current = null;
      }, timeoutMs);
    }
    return ok;
  }, [timeoutMs]);

  return { copied, copy };
}
