export type SubSkillStatus = 'not_assessed' | 'developing' | 'secure';

export interface TutorProfile {
  tutor_id: string;
  tutor_name: string;
}

export interface StudentProfile {
  student_id: string;
  student_name: string;
  grade_level: string;
}

export interface PriorityCluster {
  grade: number;
  cluster: string;
  priority_level: string;
}

export interface SubSkill {
  id: string;
  name: string;
  description: string;
}

export interface ProblemBankItem {
  id: string;
  sub_skill: string;
  type: string;
  prompt: string;
  source: string;
  /**
   * Rough minutes a tutor should budget for this problem with a
   * student at the expected proficiency. Optional — renders as a
   * small tag on the warm-up tile when present; silently omitted
   * otherwise.
   */
  estimated_minutes?: number;
}

export interface TutorMoves {
  common_misconceptions: string[];
  questions_to_ask: string[];
  scaffolds: string[];
  when_to_advance: string[];
}

export interface CurriculumReference {
  cluster: PriorityCluster;
  sub_skills: SubSkill[];
  problems: ProblemBankItem[];
  tutor_moves: TutorMoves;
}

export interface SessionRecord {
  session_id: string;
  tutor_id: string;
  student_id: string;
  session_date: string;
  title: string;
  transcript: string;
}

export type EvidenceKind = 'stumble' | 'recovery' | 'clean';

export interface EvidenceQuote {
  id: string;
  selected_text: string;
  note: string;
  /**
   * Optional anchor into the transcript (`#problem-pN`) so the UI can
   * deep-link an evidence quote back to where it came from.
   */
  transcript_anchor?: string;
  /**
   * Optional classification of WHAT kind of moment the quote captured:
   * - `'stumble'`: a mistake or misconception surfaced
   * - `'recovery'`: got it right, usually after scaffolding
   * - `'clean'`: got it right on their own
   *
   * Renders as a small colored tag on the focus card so a tutor can
   * scan the arc of the session without reading the quotes.
   */
  kind?: EvidenceKind;
}

export interface SubSkillSnapshot {
  id: string;
  name: string;
  status: SubSkillStatus;
  evidence_count: number;
  /**
   * Optional per-judgment confidence from the analyzer, in `[0, 1]`.
   * Surfaced as a visible "low confidence" signal to the tutor when
   * below the UI threshold — "the AI isn't sure here" is actionable
   * in a way that a raw number isn't.
   */
  confidence?: number;
}

export interface EvidenceBySubSkill {
  sub_skill_id: string;
  sub_skill_name: string;
  status: SubSkillStatus;
  evidence: EvidenceQuote[];
}

export interface LatestMasteryReport {
  report_id: string;
  tutor_id: string;
  student_id: string;
  session_count: number;
  overall_summary: string;
  created_at: string;
  cluster: PriorityCluster;
  sub_skills: SubSkillSnapshot[];
}

export interface DetailedMasterySession {
  session_id: string;
  session_date: string;
  transcript: string;
  evidence_by_sub_skill: EvidenceBySubSkill[];
  /**
   * Optional plain-language summary of observed student affect /
   * engagement during the session ("started frustrated, recovered after
   * scaffolding"). Helps a novice tutor walk into the next session with
   * a read on the student's emotional state, not just their skills.
   */
  affect_note?: string;
}

export interface DetailedMasteryReport {
  report_id: string;
  tutor_id: string;
  student_id: string;
  session_count: number;
  overall_summary: string;
  created_at: string;
  cluster: PriorityCluster;
  /**
   * The per-sub-skill snapshot for this cluster — mirrored from the
   * latest report so the detailed view is a semantic superset of the
   * summary view.
   */
  sub_skills: SubSkillSnapshot[];
  curriculum: CurriculumReference;
  sessions: DetailedMasterySession[];
}

export interface GenerateMasteryRequest {
  tutor_id: string;
  student_id: string;
  session_id: string;
}

export interface GenerateMasteryResponse {
  success: boolean;
  report: LatestMasteryReport;
  detailed_report: DetailedMasteryReport;
}
