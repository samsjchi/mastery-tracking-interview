import type { SubSkillStatus } from '@/lib/types';
import styles from '../briefing.module.css';

const LABEL: Record<SubSkillStatus, string> = {
  secure: 'Secure',
  developing: 'Developing',
  not_assessed: 'Not yet probed',
};

const ARIA: Record<SubSkillStatus, string> = {
  secure: 'Mastery status: secure',
  developing: 'Mastery status: developing',
  not_assessed: 'Mastery status: not yet probed',
};

const VARIANT_CLASS: Record<SubSkillStatus, string> = {
  secure: styles.statusChipSecure,
  developing: styles.statusChipDeveloping,
  not_assessed: styles.statusChipNotAssessed,
};

export function StatusChip({ status }: { status: SubSkillStatus }) {
  return (
    <span className={`${styles.statusChip} ${VARIANT_CLASS[status]}`} aria-label={ARIA[status]}>
      {LABEL[status]}
    </span>
  );
}
