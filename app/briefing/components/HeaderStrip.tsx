import { formatSessionWhen } from '@/lib/briefing/derive';
import styles from '../briefing.module.css';

interface Props {
  studentName: string;
  gradeLevel: string;
  sessionDate: string;
  headline: string;
}

export function HeaderStrip({ studentName, gradeLevel, sessionDate, headline }: Props) {
  // First name only — the h1 below carries the full name. The utility
  // bar is metadata, not re-introduction.
  const firstName = studentName.split(' ')[0] || studentName;
  return (
    <header className={styles.briefingHeader}>
      <p className={styles.utilityBar}>
        <span>
          {firstName} · {gradeLevel}
        </span>
        <span className={styles.utilityBarWhen}>{formatSessionWhen(sessionDate)}</span>
      </p>
      <h1 className={styles.pageHeadline}>{headline}</h1>
    </header>
  );
}
