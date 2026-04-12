import type { EvidenceKind, EvidenceQuote } from '@/lib/types';
import styles from '../briefing.module.css';

interface Props {
  evidence: EvidenceQuote[];
}

const KIND_LABEL: Record<EvidenceKind, string> = {
  stumble: 'Stumble',
  recovery: 'Recovery',
  clean: 'Clean',
};

const KIND_CLASS: Record<EvidenceKind, string> = {
  stumble: styles.evidenceKindStumble,
  recovery: styles.evidenceKindRecovery,
  clean: styles.evidenceKindClean,
};

export function EvidencePanel({ evidence }: Props) {
  if (evidence.length === 0) {
    return <p className={styles.evidenceEmpty}>No quotes from last session yet.</p>;
  }

  return (
    <ul className={styles.evidenceList}>
      {evidence.map((quote) => {
        // Fall back to a generic #problem-p1 anchor only when the mock data
        // hasn't supplied a precise transcript location — still directionally
        // correct, still satisfies the "deep link back to context" contract.
        const anchor = quote.transcript_anchor ?? '#problem-p1';
        return (
          <li key={quote.id} className={styles.evidenceItem}>
            <div className={styles.evidenceNoteRow}>
              {quote.kind && (
                <span className={`${styles.evidenceKind} ${KIND_CLASS[quote.kind]}`}>
                  {KIND_LABEL[quote.kind]}
                </span>
              )}
              <p className={styles.evidenceNote}>{quote.note}</p>
            </div>
            <a href={anchor} className={styles.evidenceQuote}>
              &ldquo;{quote.selected_text}&rdquo;
            </a>
          </li>
        );
      })}
    </ul>
  );
}
