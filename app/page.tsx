import { Briefing } from './briefing/Briefing';
import { getDetailedReport, getSeedContext } from '@/lib/store';

export default function Home() {
  const { tutor, student, session } = getSeedContext();
  const report = getDetailedReport(tutor.tutor_id, student.student_id);

  if (!report) {
    return (
      <main className="page-shell">
        <section className="shell-card shell-card--hero">
          <h1>No briefing available</h1>
          <p className="shell-copy">
            The mock mastery pipeline did not produce a report for this tutor/student pair.
          </p>
        </section>
      </main>
    );
  }

  return <Briefing report={report} student={student} session={session} />;
}
