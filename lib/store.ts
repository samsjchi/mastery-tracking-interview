import { generateMasteryReport } from "@/lib/generator";
import { curriculumReference, seededSession, seededStudent, seededTutor } from "@/lib/seed";
import type {
  DetailedMasteryReport,
  GenerateMasteryRequest,
  LatestMasteryReport,
} from "@/lib/types";

type ReportState = {
  latest: LatestMasteryReport;
  detailed: DetailedMasteryReport;
};

function createReportState(): ReportState {
  const generated = generateMasteryReport(seededSession);
  return {
    latest: generated.summary,
    detailed: generated.detailed,
  };
}

let reportState: ReportState = createReportState();

export function getSeedContext() {
  return {
    tutor: seededTutor,
    student: seededStudent,
    session: seededSession,
    curriculum: curriculumReference,
  };
}

function ensureIdentityMatch(tutorId: string, studentId: string) {
  return tutorId === seededTutor.tutor_id && studentId === seededStudent.student_id;
}

export function getLatestReport(tutorId: string, studentId: string) {
  if (!ensureIdentityMatch(tutorId, studentId)) {
    return null;
  }

  return reportState.latest;
}

export function getDetailedReport(tutorId: string, studentId: string) {
  if (!ensureIdentityMatch(tutorId, studentId)) {
    return null;
  }

  return reportState.detailed;
}

export function regenerateReport(input: GenerateMasteryRequest) {
  if (
    !ensureIdentityMatch(input.tutor_id, input.student_id) ||
    input.session_id !== seededSession.session_id
  ) {
    return null;
  }

  reportState = createReportState();
  return reportState;
}
