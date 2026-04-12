import { curriculumReference } from '@/lib/seed';
import type {
  DetailedMasteryReport,
  EvidenceBySubSkill,
  EvidenceKind,
  EvidenceQuote,
  LatestMasteryReport,
  SessionRecord,
  SubSkillSnapshot,
} from '@/lib/types';

function makeEvidence(
  id: string,
  selected_text: string,
  note: string,
  kind: EvidenceKind,
  transcript_anchor?: string,
): EvidenceQuote {
  return { id, selected_text, note, kind, transcript_anchor };
}

function buildEvidenceBySubSkill(): EvidenceBySubSkill[] {
  return [
    {
      sub_skill_id: '2.NBT.ADD.3',
      sub_skill_name: 'Add within 100 using place value strategies',
      status: 'developing',
      evidence: [
        makeEvidence(
          'place-value-1',
          '713.',
          'Treated the digits as one number.',
          'stumble',
          '#problem-p1',
        ),
        makeEvidence(
          'place-value-3',
          '50 and 9, so 59.',
          'Got there once she broke each number into tens and ones.',
          'recovery',
          '#problem-p2',
        ),
      ],
    },
    {
      sub_skill_id: '2.NBT.ADD.7',
      sub_skill_name: 'Explain strategies using place value language',
      status: 'developing',
      evidence: [
        makeEvidence(
          'language-1',
          'Because each digit means tens or ones, not just the number by itself.',
          'Named the strategy in her own words when prompted.',
          'clean',
          '#problem-p3',
        ),
      ],
    },
  ];
}

// Hand-tuned mock confidence scores, keyed by sub-skill ID. An actual
// analyzer would emit these per judgment; we're faking the numbers to
// exercise both ends of the confidence surfacing behavior in the UI:
// - 2.NBT.ADD.1: already-mastered foundation → secure + high confidence
//   (exercises the "Already solid" signal in the at-a-glance strip).
// - 2.NBT.ADD.3: contradictory evidence (stumble → recovery), below
//   LOW_CONFIDENCE_THRESHOLD (0.65) → surfaces "double-check" chip.
// - 2.NBT.ADD.7: one clean articulation, above HIGH_CONFIDENCE_THRESHOLD
//   (0.85) → surfaces the quiet "AI confident" checkmark.
const MOCK_CONFIDENCE: Record<string, number> = {
  '2.NBT.ADD.1': 0.95,
  '2.NBT.ADD.3': 0.55,
  '2.NBT.ADD.7': 0.9,
};

function buildSubSkillSnapshots(evidenceBySubSkill: EvidenceBySubSkill[]): SubSkillSnapshot[] {
  return curriculumReference.sub_skills.map((subSkill) => {
    // Demo override: bubble up one prior-mastered sub-skill so the
    // "Already solid" signal has data to render on the seeded page.
    // A real analyzer would emit this via evidence the same as other
    // statuses; for the mock we short-circuit by ID.
    if (subSkill.id === '2.NBT.ADD.1') {
      return {
        id: subSkill.id,
        name: subSkill.name,
        status: 'secure',
        evidence_count: 0,
        confidence: MOCK_CONFIDENCE[subSkill.id],
      };
    }
    const match = evidenceBySubSkill.find((entry) => entry.sub_skill_id === subSkill.id);

    return {
      id: subSkill.id,
      name: subSkill.name,
      status: match?.status ?? 'not_assessed',
      evidence_count: match?.evidence.length ?? 0,
      confidence: match ? MOCK_CONFIDENCE[subSkill.id] : undefined,
    };
  });
}

export function generateMasteryReport(session: SessionRecord): {
  summary: LatestMasteryReport;
  detailed: DetailedMasteryReport;
} {
  const createdAt = new Date().toISOString();
  const reportId = `report-${Date.now()}`;
  const evidenceBySubSkill = buildEvidenceBySubSkill();
  const subSkills = buildSubSkillSnapshots(evidenceBySubSkill);

  const summary: LatestMasteryReport = {
    report_id: reportId,
    tutor_id: session.tutor_id,
    student_id: session.student_id,
    session_count: 1,
    overall_summary:
      'Starter output is intentionally thin. It tags a couple of likely sub-skills and leaves most of the product and mastery decisions open.',
    created_at: createdAt,
    cluster: curriculumReference.cluster,
    sub_skills: subSkills,
  };

  const detailed: DetailedMasteryReport = {
    report_id: reportId,
    tutor_id: session.tutor_id,
    student_id: session.student_id,
    session_count: 1,
    overall_summary: summary.overall_summary,
    created_at: createdAt,
    cluster: curriculumReference.cluster,
    sub_skills: subSkills,
    curriculum: curriculumReference,
    sessions: [
      {
        session_id: session.session_id,
        session_date: session.session_date,
        transcript: session.transcript,
        evidence_by_sub_skill: evidenceBySubSkill,
        affect_note: 'Ended last session confident — she recovered well once scaffolded. You can push.',
      },
    ],
  };

  return { summary, detailed };
}
