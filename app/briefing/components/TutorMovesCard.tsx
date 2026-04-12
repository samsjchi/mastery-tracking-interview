import type { TutorMoves } from '@/lib/types';
import styles from '../briefing.module.css';

interface Props {
  moves: TutorMoves;
}

interface MoveSection {
  title: string;
  items: string[];
}

export function TutorMovesCard({ moves }: Props) {
  const sections: MoveSection[] = [
    { title: 'Common stumbles', items: moves.common_misconceptions },
    { title: 'Questions to ask', items: moves.questions_to_ask },
    { title: 'Scaffolds to try', items: moves.scaffolds },
    { title: 'Ready to move on when…', items: moves.when_to_advance },
  ];

  return (
    <details className={styles.tutorMovesCard} aria-labelledby="tutor-moves-heading">
      <summary className={styles.tutorMovesSummary}>
        <h2 id="tutor-moves-heading" className={styles.tutorMovesHeading}>
          More moves to keep in your back pocket
        </h2>
        <span className={styles.tutorMovesHint}>Click to expand</span>
      </summary>
      <div className={styles.tutorMovesGrid}>
        {sections.map((section) => (
          <div key={section.title} className={styles.tutorMoveSection}>
            <h3 className={styles.tutorMoveTitle}>{section.title}</h3>
            <ul className={styles.tutorMoveList}>
              {section.items.map((item, index) => (
                <li key={`${section.title}-${index}`}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </details>
  );
}
