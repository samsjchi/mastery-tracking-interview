'use client';

import { useEffect, useMemo, useRef } from 'react';
import styles from '../briefing.module.css';

interface Props {
  transcript: string;
}

interface TranscriptFragment {
  kind: 'anchor' | 'line';
  text: string;
  anchorId?: string;
}

// Matches seeded lines like: [PROBLEM CHANGE: p1 - "47 + 36 = ?" (start)]
const PROBLEM_CHANGE_RE = /^\[PROBLEM CHANGE: (p\d+) - .* \(start\)\]$/;
const PROBLEM_HASH_RE = /^#problem-p\d+$/;

function parseTranscript(transcript: string): TranscriptFragment[] {
  return transcript.split('\n').map((line) => {
    const match = line.match(PROBLEM_CHANGE_RE);
    if (match) {
      return { kind: 'anchor', text: line, anchorId: `problem-${match[1]}` };
    }
    return { kind: 'line', text: line };
  });
}

export function TranscriptPanel({ transcript }: Props) {
  const fragments = useMemo(() => parseTranscript(transcript), [transcript]);
  const detailsRef = useRef<HTMLDetailsElement | null>(null);

  // Deep-link handling: when an evidence quote's href="#problem-pN" is
  // followed, the browser won't scroll to a target that lives inside a
  // collapsed <details>. We open the details element manually, then
  // scroll + move focus to the anchor (tabIndex=-1 makes it focusable
  // for keyboard users so the next Tab continues from there).
  useEffect(() => {
    function openIfTargeted() {
      if (typeof window === 'undefined') return;
      const hash = window.location.hash;
      if (!PROBLEM_HASH_RE.test(hash)) return;
      const details = detailsRef.current;
      if (details && !details.open) details.open = true;
      // Wait one frame so the target is laid out now that <details> is open.
      requestAnimationFrame(() => {
        const target = document.getElementById(hash.slice(1));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          target.focus({ preventScroll: true });
        }
      });
    }

    openIfTargeted();
    window.addEventListener('hashchange', openIfTargeted);
    return () => window.removeEventListener('hashchange', openIfTargeted);
  }, []);

  return (
    // suppressHydrationWarning: Chrome's native "auto-expand <details>
    // on fragment navigation" fires before React hydrates when the URL
    // contains a hash matching an element inside this <details>. The
    // server rendered `<details>` (closed); the client DOM has
    // `<details open>`. That mismatch is intentional browser behavior
    // and our useEffect would re-open it anyway on hashchange.
    <details
      ref={detailsRef}
      className={styles.transcriptDetails}
      id="transcript"
      suppressHydrationWarning
    >
      <summary className={styles.transcriptSummary}>
        <span className={styles.transcriptSummaryLabel}>Last session transcript</span>
        <span className={styles.transcriptSummaryHint}>Click to expand</span>
      </summary>
      <pre className={styles.transcriptBody}>
        {fragments.map((fragment, index) => {
          if (fragment.kind === 'anchor' && fragment.anchorId) {
            return (
              <span
                key={index}
                id={fragment.anchorId}
                tabIndex={-1}
                className={styles.transcriptAnchor}
              >
                {fragment.text}
                {'\n'}
              </span>
            );
          }
          return (
            <span key={index}>
              {fragment.text}
              {'\n'}
            </span>
          );
        })}
      </pre>
    </details>
  );
}
