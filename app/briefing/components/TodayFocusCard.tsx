import type { EvidenceQuote, EvidenceKind, ProblemBankItem } from '@/lib/types';
import type { PrimaryFocus } from '@/lib/briefing/derive';
import { CopyPlanButton } from './CopyPlanButton';
import styles from '../briefing.module.css';

interface TopMoves {
  misconception?: string;
  question?: string;
  scaffold?: string;
}

interface Props {
  focus: PrimaryFocus | null;
  warmup: ProblemBankItem[];
  planText: string;
  evidence?: EvidenceQuote[];
  topMoves?: TopMoves;
  goal?: string | null;
  warmupTotalMinutes?: number | null;
}

// Plain-English labels for the underlying CPA+ problem types. Keep in
// sync with the map in `lib/briefing/derive.ts`.
const CPA_PLAIN_LABEL: Record<string, string> = {
  concrete: 'With blocks',
  representational: 'With a drawing',
  abstract: 'Numbers only',
  application: 'Word problem',
};

function plainLabel(type: string): string {
  return CPA_PLAIN_LABEL[type] ?? type.charAt(0).toUpperCase() + type.slice(1);
}

function hasAnyMove(moves: TopMoves | undefined): moves is TopMoves {
  if (!moves) return false;
  return Boolean(moves.misconception || moves.question || moves.scaffold);
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

export function TodayFocusCard({
  focus,
  warmup,
  planText,
  evidence,
  topMoves,
  goal,
  warmupTotalMinutes,
}: Props) {
  if (!focus) {
    return (
      <section className={styles.focusCard} aria-labelledby="focus-heading">
        <h2 id="focus-heading" className={styles.cardHeading}>
          The focus
        </h2>
        <p className={styles.focusEmpty}>
          No single focus identified. Use today to explore the cluster and see which sub-skills
          you haven&apos;t seen yet.
        </p>
      </section>
    );
  }

  // Show up to 2 evidence quotes on the focus card to preserve the
  // narrative arc (stumble → recovery). The full list is still
  // rendered on the SubSkillCard below when relevant.
  const topQuotes = evidence?.slice(0, 2) ?? [];
  const hasQuotes = topQuotes.length > 0;
  // When we have evidence, the quotes speak for themselves — the
  // rationale paragraph ("clearest place to focus — 2 quotes from
  // last session") just restates what the tutor is about to read.
  // Only render rationale when there are no quotes to carry the why.
  const showRationale = !hasQuotes;

  const warmupLabel =
    warmupTotalMinutes && warmupTotalMinutes > 0 ? `Warm-up · ~${warmupTotalMinutes} min` : 'Warm-up';

  return (
    <section className={styles.focusCard} aria-labelledby="focus-heading">
      <div className={styles.focusHeader}>
        <div>
          <h2 id="focus-heading" className={styles.cardHeading}>
            The focus
          </h2>
          <p className={styles.focusSubSkillName}>{focus.subSkill.name}</p>
        </div>
      </div>
      {goal && (
        <p className={styles.focusGoal}>
          <span className={styles.focusGoalLabel}>Goal</span>
          <span className={styles.focusGoalText}>{goal}</span>
        </p>
      )}
      {showRationale && <p className={styles.focusRationale}>{focus.rationale}</p>}
      {hasQuotes && (
        <div className={styles.focusEvidence}>
          <ul className={styles.focusEvidenceList}>
            {topQuotes.map((quote) => (
              <li key={quote.id} className={styles.focusEvidenceItem}>
                <div className={styles.focusEvidenceNoteRow}>
                  {quote.kind && (
                    <span className={`${styles.evidenceKind} ${KIND_CLASS[quote.kind]}`}>
                      {KIND_LABEL[quote.kind]}
                    </span>
                  )}
                  <p className={styles.focusEvidenceNote}>{quote.note}</p>
                </div>
                {quote.transcript_anchor ? (
                  <a href={quote.transcript_anchor} className={styles.focusEvidenceCitation}>
                    &ldquo;{quote.selected_text}&rdquo;
                  </a>
                ) : (
                  <blockquote className={styles.focusEvidenceCitation}>
                    &ldquo;{quote.selected_text}&rdquo;
                  </blockquote>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {hasAnyMove(topMoves) && (
        <ul className={styles.focusInlineMoves} aria-label="Top tutor moves for this focus">
          {topMoves.misconception && (
            <li>
              <span className={styles.focusInlineMoveLabel}>Watch for:</span> {topMoves.misconception}
            </li>
          )}
          {topMoves.question && (
            <li>
              <span className={styles.focusInlineMoveLabel}>Ask:</span> {topMoves.question}
            </li>
          )}
          {topMoves.scaffold && (
            <li>
              <span className={styles.focusInlineMoveLabel}>Try:</span> {topMoves.scaffold}
            </li>
          )}
        </ul>
      )}
      {warmup.length > 0 ? (
        <div className={styles.warmup}>
          <p className={styles.warmupLabel}>{warmupLabel}</p>
          <ol className={styles.warmupList}>
            {warmup.map((problem, index) => (
              <li key={problem.id} className={styles.warmupItem}>
                <div className={styles.warmupItemHeader}>
                  <span className={styles.warmupNumber} aria-hidden="true">
                    {index + 1}
                  </span>
                  <span className={styles.warmupType}>{plainLabel(problem.type)}</span>
                  {problem.estimated_minutes !== undefined && (
                    <span className={styles.warmupMinutes} aria-label={`about ${problem.estimated_minutes} minutes`}>
                      ~{problem.estimated_minutes} min
                    </span>
                  )}
                </div>
                <p className={styles.warmupPrompt}>{problem.prompt}</p>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <p className={styles.warmupEmpty}>
          No problems in the bank for this sub-skill — improvise using today&apos;s tutor moves.
        </p>
      )}
      <CopyPlanButton planText={planText} />
    </section>
  );
}
