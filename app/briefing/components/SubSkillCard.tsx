import type { EvidenceQuote, SubSkillSnapshot } from '@/lib/types';
import { describeConfidence } from '@/lib/briefing/derive';
import { StatusChip } from './StatusChip';
import { EvidencePanel } from './EvidencePanel';
import styles from '../briefing.module.css';

interface Props {
  snapshot: SubSkillSnapshot;
  evidence: EvidenceQuote[];
}

export function SubSkillCard({ snapshot, evidence }: Props) {
  const hasEvidence = evidence.length > 0;
  // Surface a signal at both ends of the confidence range: a "worth
  // double-checking" nudge when the AI is uncertain, and a quiet
  // checkmark when it's highly confident. Middle band stays silent.
  const confidence = describeConfidence(snapshot.confidence);
  const lowConfidence = confidence?.level === 'low';
  const highConfidence = confidence?.level === 'high';

  return (
    <article className={styles.subSkillCard}>
      <header className={styles.subSkillHeader}>
        <div>
          <h4 className={styles.subSkillName}>{snapshot.name}</h4>
        </div>
        <div className={styles.subSkillStatus}>
          <StatusChip status={snapshot.status} />
          {lowConfidence && (
            <span
              className={styles.confidenceBadgeLow}
              aria-label="The AI isn't sure here — worth double-checking this sub-skill today."
              title="The AI isn't sure here — worth double-checking today"
            >
              <span aria-hidden="true" className={styles.confidenceBadgeLowIcon}>
                !
              </span>
              Double-check
            </span>
          )}
          {highConfidence && (
            <span
              className={styles.confidenceBadgeHigh}
              aria-label="AI is confident in this read"
              title="AI is confident in this read"
            >
              <span aria-hidden="true" className={styles.confidenceBadgeHighIcon}>
                ✓
              </span>
              AI confident
            </span>
          )}
        </div>
      </header>
      {hasEvidence && (
        <div className={styles.subSkillEvidence}>
          <EvidencePanel evidence={evidence} />
        </div>
      )}
    </article>
  );
}
