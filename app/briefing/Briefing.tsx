import type {
  DetailedMasteryReport,
  SessionRecord,
  StudentProfile,
} from '@/lib/types';
import {
  bucketSubSkills,
  buildPlanText,
  buildWarmup,
  formatHeadline,
  getFocusGoal,
  getPlainClusterName,
  indexEvidenceBySubSkill,
  pickPrimaryFocus,
  prioritizedTutorMoves,
  topMovesForFocus,
  warmupTotalMinutes,
} from '@/lib/briefing/derive';
import { AtAGlanceStrip } from './components/AtAGlanceStrip';
import { HeaderStrip } from './components/HeaderStrip';
import { TodayFocusCard } from './components/TodayFocusCard';
import { SubSkillMap } from './components/SubSkillMap';
import { TutorMovesCard } from './components/TutorMovesCard';
import { TranscriptPanel } from './components/TranscriptPanel';
import styles from './briefing.module.css';

interface Props {
  report: DetailedMasteryReport;
  student: StudentProfile;
  session: SessionRecord;
}

export function Briefing({ report, student, session }: Props) {
  const plainClusterName = getPlainClusterName(report.cluster.cluster);
  const buckets = bucketSubSkills(report);
  const focus = pickPrimaryFocus(report);
  const headline = formatHeadline(report, focus, {
    studentName: student.student_name,
    plainClusterName,
  });
  const warmup = buildWarmup(report, report.curriculum, focus);
  const evidenceIndex = indexEvidenceBySubSkill(report);
  const tutorMoves = prioritizedTutorMoves(report.curriculum, focus);
  // Session-aware ranking: the transcript biases which top moves
  // bubble up, so the tutor sees moves they were already observed
  // using last time.
  const topMoves = topMovesForFocus(tutorMoves, { transcript: session.transcript });
  const focusEvidence = focus ? (evidenceIndex[focus.subSkill.id] ?? []) : [];
  const goal = getFocusGoal(focus, report.curriculum);
  const warmupMinutes = warmupTotalMinutes(warmup);
  const planText = buildPlanText({
    studentName: student.student_name,
    headline,
    focus,
    warmup,
    tutorMoves,
  });

  return (
    <>
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>
      <main id="main-content" className={styles.briefing}>
        <HeaderStrip
          studentName={student.student_name}
          gradeLevel={student.grade_level}
          sessionDate={session.session_date}
          headline={headline}
        />
        <AtAGlanceStrip
          topMoves={topMoves}
          warmup={warmup}
          warmupTotalMinutes={warmupMinutes}
          secureSubSkills={buckets.secure}
        />
        <div className={styles.mainColumn}>
          <TodayFocusCard
            focus={focus}
            warmup={warmup}
            planText={planText}
            evidence={focusEvidence}
            topMoves={topMoves}
            goal={goal}
            warmupTotalMinutes={warmupMinutes}
          />
          <SubSkillMap buckets={buckets} evidenceIndex={evidenceIndex} />
          <TutorMovesCard moves={tutorMoves} />
          <TranscriptPanel transcript={session.transcript} />
        </div>
      </main>
    </>
  );
}
