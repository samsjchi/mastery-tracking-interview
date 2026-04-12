import type { ProblemBankItem, SubSkillSnapshot } from '@/lib/types';
import styles from '../briefing.module.css';

interface TopMoves {
  misconception?: string;
  question?: string;
  scaffold?: string;
}

interface Props {
  topMoves: TopMoves;
  warmup: ProblemBankItem[];
  warmupTotalMinutes: number | null;
  secureSubSkills: SubSkillSnapshot[];
}

/**
 * A compact lookup table directly under the h1. Three optional rows;
 * each row hides itself when the underlying data isn't there.
 *
 * - OPENER: the top-ranked question move (biased toward prompts the
 *   tutor already used last time, so this row effectively reads as
 *   "try this, it's been working")
 * - PLAN: a one-line digest of the warm-up length + tail move
 * - SOLID: optional, only when one or more sub-skills have already
 *   been marked secure — primes the tutor NOT to re-teach them
 *
 * Designed as the "5-second summary" at the top of the page: a tutor
 * who reads only this block should still know what to do, what to
 * open with, and what to leave alone today.
 */
export function AtAGlanceStrip({
  topMoves,
  warmup,
  warmupTotalMinutes,
  secureSubSkills,
}: Props) {
  const opener = topMoves.question;
  const planLine = warmup.length > 0 ? buildPlanLine(warmup, warmupTotalMinutes) : null;
  const hasAnyRow = Boolean(opener) || planLine !== null || secureSubSkills.length > 0;
  if (!hasAnyRow) return null;

  return (
    <section className={styles.atAGlance} aria-label="At a glance">
      <p className={styles.atAGlanceLabel}>At a glance</p>
      <dl className={styles.atAGlanceList}>
        {opener && (
          <div className={styles.atAGlanceRow}>
            <dt className={styles.atAGlanceKey}>Opener</dt>
            <dd className={styles.atAGlanceValue}>
              &ldquo;{opener}&rdquo; <span className={styles.atAGlanceHint}>— worked last time</span>
            </dd>
          </div>
        )}
        {planLine && (
          <div className={styles.atAGlanceRow}>
            <dt className={styles.atAGlanceKey}>Plan</dt>
            <dd className={styles.atAGlanceValue}>{planLine}</dd>
          </div>
        )}
        {secureSubSkills.length > 0 && (
          <div className={styles.atAGlanceRow}>
            <dt className={styles.atAGlanceKey}>Solid</dt>
            <dd className={styles.atAGlanceValue}>
              {joinNames(secureSubSkills)}{' '}
              <span className={styles.atAGlanceHint}>— no need to re-teach</span>
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}

function buildPlanLine(warmup: ProblemBankItem[], total: number | null): string {
  const count = warmup.length;
  const openerLabel = warmup[0]?.type ? plainCpaLabel(warmup[0].type) : null;
  const suffix = total !== null ? ` · ~${total} min` : '';
  const opener = openerLabel ? ` — start ${openerLabel.toLowerCase()}` : '';
  return `${count}-problem warm-up${opener}${suffix}`;
}

// Kept in sync with the same map in [TodayFocusCard.tsx]; duplicated
// because the at-a-glance ships one plain phrase while the warm-up
// tiles ship a full label set. Intentional tiny redundancy.
const CPA_PLAIN_LABEL: Record<string, string> = {
  concrete: 'With blocks',
  representational: 'With a drawing',
  abstract: 'Numbers only',
  application: 'Word problem',
};

function plainCpaLabel(type: string): string {
  return CPA_PLAIN_LABEL[type] ?? type.charAt(0).toUpperCase() + type.slice(1);
}

function joinNames(skills: SubSkillSnapshot[]): string {
  const names = skills.map((s) => s.name);
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}
