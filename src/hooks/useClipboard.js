import { useState, useCallback } from 'react';
import { copyText } from '../utils/clipboard.js';

export function useClipboard(timeoutMs = 1800) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text) => {
    const ok = await copyText(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), timeoutMs);
    }
    return ok;
  }, [timeoutMs]);

  return { copied, copy };
}
