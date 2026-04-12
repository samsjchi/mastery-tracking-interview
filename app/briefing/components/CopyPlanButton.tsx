'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from '../briefing.module.css';

interface Props {
  planText: string;
}

const CONFIRMATION_MS = 2000;

export function CopyPlanButton({ planText }: Props) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  // Keep a ref so we can cancel the timer if the component unmounts or
  // the user clicks again mid-confirmation — otherwise we'd leak a
  // setState on an unmounted component.
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(planText);
      setStatus('copied');
    } catch {
      setStatus('error');
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setStatus('idle'), CONFIRMATION_MS);
  }, [planText]);

  return (
    <div className={styles.copyPlanWrap}>
      <button type="button" className={styles.copyPlanButton} onClick={handleCopy}>
        Copy plan
      </button>
      <p className={styles.copyPlanHelp}>
        Copy the whole plan as plain text. Paste anywhere.
      </p>
      {status === 'copied' && (
        <span className={styles.copyPlanConfirmation} role="status" aria-live="polite">
          Copied to clipboard
        </span>
      )}
      {status === 'error' && (
        <span className={styles.copyPlanError} role="status" aria-live="polite">
          Couldn&apos;t copy — try selecting the text manually.
        </span>
      )}
    </div>
  );
}
