import type { EvidenceQuote } from '@/lib/types';
import type { SubSkillBuckets } from '@/lib/briefing/derive';
import { SubSkillCard } from './SubSkillCard';
import styles from '../briefing.module.css';

interface Props {
  buckets: SubSkillBuckets;
  evidenceIndex: Record<string, EvidenceQuote[]>;
}

interface BucketSpec {
  key: keyof SubSkillBuckets;
  title: string;
}

const BUCKET_ORDER: BucketSpec[] = [
  { key: 'needsWork', title: 'Needs work' },
  { key: 'developing', title: 'Developing' },
  { key: 'secure', title: 'Secure' },
  { key: 'notYetProbed', title: 'Not yet seen' },
];

// A short summary-line fragment per bucket for the collapsed header —
// e.g. "2 developing · 5 not yet seen · 1 secure". Only non-empty
// buckets contribute. Keeps the default state to a single line.
const SUMMARY_LABEL: Record<keyof SubSkillBuckets, (n: number) => string> = {
  needsWork: (n) => `${n} needs work`,
  developing: (n) => `${n} developing`,
  secure: (n) => `${n} secure`,
  notYetProbed: (n) => `${n} not yet seen`,
};

function buildSummary(buckets: SubSkillBuckets): string {
  const parts: string[] = [];
  BUCKET_ORDER.forEach(({ key }) => {
    const n = buckets[key].length;
    if (n > 0) parts.push(SUMMARY_LABEL[key](n));
  });
  return parts.join(' · ');
}

export function SubSkillMap({ buckets, evidenceIndex }: Props) {
  return (
    <details className={styles.subSkillMap} aria-labelledby="map-heading">
      <summary className={styles.subSkillMapSummary}>
        <span className={styles.subSkillMapHeadingGroup}>
          <h2 id="map-heading" className={styles.subSkillMapHeading}>
            Sub-skill map
          </h2>
          <span className={styles.subSkillMapCounts}>{buildSummary(buckets)}</span>
        </span>
        <span className={styles.subSkillMapHint}>Click to expand</span>
      </summary>
      <div className={styles.subSkillMapBody}>
        {BUCKET_ORDER.map((spec) => {
          const skills = buckets[spec.key];
          if (skills.length === 0) return null;

          // Not-yet-seen: same bucketSection chrome as the other buckets
          // so the heading matches. Body is a bulleted list instead of a
          // sub-skill card grid — the tutor just needs to know the names
          // exist, not the full card treatment.
          if (spec.key === 'notYetProbed') {
            return (
              <div key={spec.key} className={styles.bucketSection}>
                <h3 className={styles.bucketTitle}>
                  {spec.title} <span className={styles.bucketCount}>({skills.length})</span>
                </h3>
                <ul className={styles.notYetProbedList}>
                  {skills.map((s) => (
                    <li key={s.id}>{s.name}</li>
                  ))}
                </ul>
              </div>
            );
          }

          return (
            <div key={spec.key} className={styles.bucketSection}>
              <h3 className={styles.bucketTitle}>
                {spec.title} <span className={styles.bucketCount}>({skills.length})</span>
              </h3>
              <div className={styles.subSkillGrid}>
                {skills.map((snapshot) => (
                  <SubSkillCard
                    key={snapshot.id}
                    snapshot={snapshot}
                    evidence={evidenceIndex[snapshot.id] ?? []}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </details>
  );
}
