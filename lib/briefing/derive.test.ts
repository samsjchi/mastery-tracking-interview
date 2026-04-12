import { describe, expect, it } from 'vitest';
import type {
  CurriculumReference,
  DetailedMasteryReport,
  ProblemBankItem,
  SubSkillSnapshot,
} from '@/lib/types';
import {
  HIGH_CONFIDENCE_THRESHOLD,
  LOW_CONFIDENCE_THRESHOLD,
  bucketSubSkills,
  buildPlanText,
  buildWarmup,
  describeConfidence,
  formatHeadline,
  formatSessionWhen,
  getFocusGoal,
  getPlainClusterName,
  indexEvidenceBySubSkill,
  orderProblemsCPA,
  pickPrimaryFocus,
  prioritizedTutorMoves,
  topMovesForFocus,
  warmupTotalMinutes,
} from './derive';

const STUDENT_NAME = 'Mia Rivera';
const PLAIN_CLUSTER = 'adding 2-digit numbers by place value';

function makeSnapshot(overrides: Partial<SubSkillSnapshot> = {}): SubSkillSnapshot {
  return {
    id: '2.NBT.ADD.1',
    name: 'Understand hundreds, tens, and ones as units',
    status: 'not_assessed',
    evidence_count: 0,
    ...overrides,
  };
}

function makeReport(subSkills: SubSkillSnapshot[]): DetailedMasteryReport {
  return {
    report_id: 'report-test',
    tutor_id: '2025-t27049',
    student_id: '2025-s12123',
    session_count: 1,
    overall_summary: 'test summary',
    created_at: '2025-04-24T16:30:00.000Z',
    cluster: {
      grade: 2,
      cluster: 'Use place value understanding and properties of operations to add and subtract',
      priority_level: 'Major Work',
    },
    sub_skills: subSkills,
    curriculum: {
      cluster: {
        grade: 2,
        cluster: 'Use place value understanding and properties of operations to add and subtract',
        priority_level: 'Major Work',
      },
      sub_skills: [],
      problems: [],
      tutor_moves: {
        common_misconceptions: [],
        questions_to_ask: [],
        scaffolds: [],
        when_to_advance: [],
      },
    },
    sessions: [],
  };
}

function makeCurriculum(problems: ProblemBankItem[] = []): CurriculumReference {
  return {
    cluster: {
      grade: 2,
      cluster: 'Use place value understanding and properties of operations to add and subtract',
      priority_level: 'Major Work',
    },
    sub_skills: [],
    problems,
    tutor_moves: {
      common_misconceptions: ['Student concatenates digits (47 + 36 = 713).'],
      questions_to_ask: ['What is 47 made of?'],
      scaffolds: ['Break numbers into tens and ones.'],
      when_to_advance: ['Student consistently adds using place value correctly.'],
    },
  };
}

describe('bucketSubSkills', () => {
  it('sorts the seeded shape into the four buckets', () => {
    const report = makeReport([
      makeSnapshot({ id: '2.NBT.ADD.1', status: 'not_assessed', evidence_count: 0 }),
      makeSnapshot({ id: '2.NBT.ADD.2', status: 'secure', evidence_count: 3 }),
      makeSnapshot({ id: '2.NBT.ADD.3', status: 'developing', evidence_count: 2 }),
      makeSnapshot({ id: '2.NBT.ADD.4', status: 'developing', evidence_count: 0 }),
      makeSnapshot({ id: '2.NBT.ADD.5', status: 'not_assessed', evidence_count: 0 }),
    ]);

    const buckets = bucketSubSkills(report);

    expect(buckets.secure.map((s) => s.id)).toEqual(['2.NBT.ADD.2']);
    expect(buckets.developing.map((s) => s.id)).toEqual(['2.NBT.ADD.3']);
    expect(buckets.needsWork.map((s) => s.id)).toEqual(['2.NBT.ADD.4']);
    expect(buckets.notYetProbed.map((s) => s.id)).toEqual(['2.NBT.ADD.1', '2.NBT.ADD.5']);
  });

  it('handles the all-not-assessed edge case (fresh student, no session yet)', () => {
    const report = makeReport([
      makeSnapshot({ id: '2.NBT.ADD.3', status: 'not_assessed' }),
      makeSnapshot({ id: '2.NBT.ADD.1', status: 'not_assessed' }),
    ]);

    const buckets = bucketSubSkills(report);

    expect(buckets.developing).toHaveLength(0);
    expect(buckets.secure).toHaveLength(0);
    expect(buckets.needsWork).toHaveLength(0);
    expect(buckets.notYetProbed.map((s) => s.id)).toEqual(['2.NBT.ADD.1', '2.NBT.ADD.3']);
  });

  it('handles the all-secure edge case (student is past this cluster)', () => {
    const report = makeReport([
      makeSnapshot({ id: '2.NBT.ADD.2', status: 'secure', evidence_count: 1 }),
      makeSnapshot({ id: '2.NBT.ADD.1', status: 'secure', evidence_count: 2 }),
    ]);

    const buckets = bucketSubSkills(report);

    expect(buckets.secure.map((s) => s.id)).toEqual(['2.NBT.ADD.1', '2.NBT.ADD.2']);
    expect(buckets.developing).toHaveLength(0);
    expect(buckets.notYetProbed).toHaveLength(0);
  });

  it('produces stable ordering by ID within each bucket', () => {
    const report = makeReport([
      makeSnapshot({ id: '2.NBT.ADD.7', status: 'developing', evidence_count: 1 }),
      makeSnapshot({ id: '2.NBT.ADD.3', status: 'developing', evidence_count: 2 }),
      makeSnapshot({ id: '2.NBT.ADD.5', status: 'developing', evidence_count: 1 }),
    ]);

    const buckets = bucketSubSkills(report);

    expect(buckets.developing.map((s) => s.id)).toEqual([
      '2.NBT.ADD.3',
      '2.NBT.ADD.5',
      '2.NBT.ADD.7',
    ]);
  });
});

describe('pickPrimaryFocus', () => {
  it('prefers a needs-work sub-skill (developing with no evidence yet)', () => {
    const report = makeReport([
      makeSnapshot({ id: '2.NBT.ADD.3', status: 'developing', evidence_count: 2 }),
      makeSnapshot({ id: '2.NBT.ADD.4', status: 'developing', evidence_count: 0 }),
    ]);

    const focus = pickPrimaryFocus(report);

    expect(focus?.subSkill.id).toBe('2.NBT.ADD.4');
    expect(focus?.rationale).toMatch(/wobble/i);
  });

  it('picks the developing sub-skill with the most evidence when nothing is needs-work', () => {
    const report = makeReport([
      makeSnapshot({ id: '2.NBT.ADD.3', status: 'developing', evidence_count: 2 }),
      makeSnapshot({ id: '2.NBT.ADD.7', status: 'developing', evidence_count: 1 }),
    ]);

    const focus = pickPrimaryFocus(report);

    expect(focus?.subSkill.id).toBe('2.NBT.ADD.3');
    expect(focus?.rationale).toMatch(/2 quotes from last session/);
  });

  it('tiebreaks equal-evidence developing sub-skills by ID', () => {
    const report = makeReport([
      makeSnapshot({ id: '2.NBT.ADD.7', status: 'developing', evidence_count: 2 }),
      makeSnapshot({ id: '2.NBT.ADD.3', status: 'developing', evidence_count: 2 }),
    ]);

    const focus = pickPrimaryFocus(report);

    expect(focus?.subSkill.id).toBe('2.NBT.ADD.3');
  });

  it('falls back to the first not-assessed sub-skill when nothing is developing', () => {
    const report = makeReport([
      makeSnapshot({ id: '2.NBT.ADD.2', status: 'secure', evidence_count: 3 }),
      makeSnapshot({ id: '2.NBT.ADD.5', status: 'not_assessed', evidence_count: 0 }),
      makeSnapshot({ id: '2.NBT.ADD.3', status: 'not_assessed', evidence_count: 0 }),
    ]);

    const focus = pickPrimaryFocus(report);

    expect(focus?.subSkill.id).toBe('2.NBT.ADD.3');
    expect(focus?.rationale).toMatch(/get a read/i);
  });

  it('returns null when the report has no sub-skills', () => {
    const report = makeReport([]);
    expect(pickPrimaryFocus(report)).toBeNull();
  });

  it('uses singular "quote" for exactly one piece of evidence', () => {
    const report = makeReport([
      makeSnapshot({ id: '2.NBT.ADD.7', status: 'developing', evidence_count: 1 }),
    ]);

    const focus = pickPrimaryFocus(report);

    expect(focus?.rationale).toMatch(/1 quote from last session/);
    expect(focus?.rationale).not.toMatch(/quotes from last session/);
  });
});

describe('formatHeadline', () => {
  const headlineOpts = {
    studentName: STUDENT_NAME,
    plainClusterName: PLAIN_CLUSTER,
  };

  it('inlines the student name and plain cluster name when there is a focus', () => {
    const report = makeReport([
      makeSnapshot({ id: '2.NBT.ADD.3', status: 'developing', evidence_count: 2 }),
    ]);
    const focus = pickPrimaryFocus(report);
    const headline = formatHeadline(report, focus, headlineOpts);

    expect(headline).toMatch(/help .* get solid/i);
    expect(headline).toContain(STUDENT_NAME);
    expect(headline).toContain(PLAIN_CLUSTER);
  });

  it('is deterministic for the same input', () => {
    const report = makeReport([
      makeSnapshot({ id: '2.NBT.ADD.3', status: 'developing', evidence_count: 2 }),
    ]);
    const focus = pickPrimaryFocus(report);

    expect(formatHeadline(report, focus, headlineOpts)).toBe(
      formatHeadline(report, focus, headlineOpts),
    );
  });

  it('produces a sensible headline when there is no focus', () => {
    const report = makeReport([]);
    const headline = formatHeadline(report, null, headlineOpts);

    expect(headline).toMatch(/today/i);
    expect(headline).toContain(STUDENT_NAME);
    expect(headline).toContain(PLAIN_CLUSTER);
  });
});

describe('getPlainClusterName', () => {
  it('maps the seeded raw Common Core cluster to plain English', () => {
    expect(
      getPlainClusterName(
        'Use place value understanding and properties of operations to add and subtract',
      ),
    ).toBe('adding 2-digit numbers by place value');
  });

  it('falls back to a lowercase version of the raw cluster for unknown clusters', () => {
    expect(getPlainClusterName('Reason About Shapes')).toBe('reason about shapes');
  });
});

describe('orderProblemsCPA', () => {
  const problems: ProblemBankItem[] = [
    { id: 'P3', sub_skill: '2.NBT.ADD.3', type: 'abstract', prompt: '47 + 36 = ?', source: 'Both' },
    {
      id: 'P1',
      sub_skill: '2.NBT.ADD.3',
      type: 'concrete',
      prompt: 'Use blocks to solve 34 + 25.',
      source: 'Eureka Math',
    },
    {
      id: 'P4',
      sub_skill: '2.NBT.ADD.3',
      type: 'application',
      prompt: 'Sticker word problem.',
      source: 'Adapted',
    },
    {
      id: 'P2',
      sub_skill: '2.NBT.ADD.3',
      type: 'representational',
      prompt: '34 + 25 = (30+20) + (4+5).',
      source: 'Illustrative Mathematics',
    },
    {
      id: 'PX',
      sub_skill: '2.NBT.ADD.4',
      type: 'concrete',
      prompt: 'Other sub-skill.',
      source: 'Other',
    },
  ];

  it('orders matching problems along the full CPA ladder', () => {
    const ordered = orderProblemsCPA(problems, '2.NBT.ADD.3');
    expect(ordered.map((p) => p.id)).toEqual(['P1', 'P2', 'P3', 'P4']);
  });

  it('returns an empty array for a sub-skill with no matching problems', () => {
    expect(orderProblemsCPA(problems, '2.NBT.ADD.9')).toEqual([]);
  });

  it('handles unknown problem types without throwing (stable order at end)', () => {
    const withUnknown: ProblemBankItem[] = [
      ...problems,
      {
        id: 'PZ',
        sub_skill: '2.NBT.ADD.3',
        type: 'unknown-type',
        prompt: 'exploratory',
        source: 'Test',
      },
    ];
    const ordered = orderProblemsCPA(withUnknown, '2.NBT.ADD.3');
    expect(ordered.map((p) => p.id)).toEqual(['P1', 'P2', 'P3', 'P4', 'PZ']);
  });
});

describe('buildWarmup', () => {
  const curriculum = makeCurriculum([
    { id: 'P1', sub_skill: '2.NBT.ADD.3', type: 'concrete', prompt: 'c', source: 's' },
    { id: 'P2', sub_skill: '2.NBT.ADD.3', type: 'representational', prompt: 'r', source: 's' },
    { id: 'P3', sub_skill: '2.NBT.ADD.3', type: 'abstract', prompt: 'a', source: 's' },
    { id: 'P4', sub_skill: '2.NBT.ADD.3', type: 'application', prompt: 'app', source: 's' },
  ]);

  it('returns at most 3 problems, CPA-ordered, for the focus sub-skill', () => {
    const report = makeReport([
      makeSnapshot({ id: '2.NBT.ADD.3', status: 'developing', evidence_count: 2 }),
    ]);
    const focus = pickPrimaryFocus(report);
    const warmup = buildWarmup(report, curriculum, focus);

    expect(warmup).toHaveLength(3);
    expect(warmup.map((p) => p.id)).toEqual(['P1', 'P2', 'P3']);
  });

  it('returns an empty array when the focus sub-skill has no matching problems', () => {
    const report = makeReport([
      makeSnapshot({ id: '2.NBT.ADD.9', status: 'developing', evidence_count: 1 }),
    ]);
    const focus = pickPrimaryFocus(report);
    const warmup = buildWarmup(report, curriculum, focus);

    expect(warmup).toEqual([]);
  });

  it('returns an empty array when there is no focus at all', () => {
    const report = makeReport([]);
    expect(buildWarmup(report, curriculum, null)).toEqual([]);
  });
});

describe('prioritizedTutorMoves', () => {
  it('passes through the full tutor-moves shape in MVP', () => {
    const curriculum = makeCurriculum();
    const moves = prioritizedTutorMoves(curriculum, null);

    expect(moves.common_misconceptions).toEqual(curriculum.tutor_moves.common_misconceptions);
    expect(moves.questions_to_ask).toEqual(curriculum.tutor_moves.questions_to_ask);
    expect(moves.scaffolds).toEqual(curriculum.tutor_moves.scaffolds);
    expect(moves.when_to_advance).toEqual(curriculum.tutor_moves.when_to_advance);
  });
});

describe('topMovesForFocus', () => {
  it('returns the first item of each actionable category', () => {
    const moves = topMovesForFocus({
      common_misconceptions: ['concatenates digits', 'ignores place value'],
      questions_to_ask: ['What is 47 made of?', 'How many tens?'],
      scaffolds: ['Use blocks.', 'Draw a picture.'],
      when_to_advance: ['Consistent strategy use.'],
    });

    expect(moves).toEqual({
      misconception: 'concatenates digits',
      question: 'What is 47 made of?',
      scaffold: 'Use blocks.',
    });
  });

  it('leaves a category undefined when the source list is empty', () => {
    const moves = topMovesForFocus({
      common_misconceptions: [],
      questions_to_ask: ['q1'],
      scaffolds: [],
      when_to_advance: [],
    });

    expect(moves.misconception).toBeUndefined();
    expect(moves.question).toBe('q1');
    expect(moves.scaffold).toBeUndefined();
  });

  it('bubbles up the move whose wording overlaps the last-session transcript', () => {
    const moves = topMovesForFocus(
      {
        common_misconceptions: ['First option', 'Ignores place value'],
        questions_to_ask: [
          'What is the weather?', // filler, none of these words are in the transcript
          'Does the student understand regrouping?',
          'What is 47 made of?', // exact phrase in transcript
        ],
        scaffolds: [
          'Breathe deeply.', // no overlap
          'Break each number apart before adding.', // "break", "number", "apart", "adding" → strong overlap
        ],
        when_to_advance: [],
      },
      {
        transcript: `00:30 TUTOR: What is 47 made of?
01:18 TUTOR: So the total is?
01:32 TUTOR: This time, start by breaking both numbers apart.`,
      },
    );

    // The transcript-matching question wins over the [0] "What is the weather?"
    expect(moves.question).toBe('What is 47 made of?');
    // Scaffold with heavier word overlap beats the unused one.
    expect(moves.scaffold).toBe('Break each number apart before adding.');
  });

  it('falls back to [0] when no transcript is provided (stable with original behavior)', () => {
    const moves = topMovesForFocus({
      common_misconceptions: ['first misconception', 'second'],
      questions_to_ask: ['first question', 'second'],
      scaffolds: ['first scaffold', 'second'],
      when_to_advance: [],
    });
    expect(moves.misconception).toBe('first misconception');
    expect(moves.question).toBe('first question');
    expect(moves.scaffold).toBe('first scaffold');
  });
});

describe('getFocusGoal', () => {
  it('returns the curriculum description for the focus sub-skill', () => {
    const curriculum = makeCurriculum();
    curriculum.sub_skills = [
      { id: '2.NBT.ADD.3', name: 'Add within 100', description: 'Student adds by breaking apart tens and ones.' },
    ];
    const report = makeReport([
      makeSnapshot({ id: '2.NBT.ADD.3', status: 'developing', evidence_count: 2 }),
    ]);
    const focus = pickPrimaryFocus(report);
    expect(getFocusGoal(focus, curriculum)).toBe('Student adds by breaking apart tens and ones.');
  });

  it('returns null when focus is null', () => {
    const curriculum = makeCurriculum();
    expect(getFocusGoal(null, curriculum)).toBeNull();
  });

  it('returns null when the curriculum has no matching sub-skill entry', () => {
    const curriculum = makeCurriculum();
    curriculum.sub_skills = [];
    const report = makeReport([
      makeSnapshot({ id: '2.NBT.ADD.3', status: 'developing', evidence_count: 2 }),
    ]);
    const focus = pickPrimaryFocus(report);
    expect(getFocusGoal(focus, curriculum)).toBeNull();
  });
});

describe('warmupTotalMinutes', () => {
  it('sums the estimated_minutes across the warm-up', () => {
    const total = warmupTotalMinutes([
      { id: 'a', sub_skill: 'x', type: 'concrete', prompt: 'p', source: 's', estimated_minutes: 5 },
      { id: 'b', sub_skill: 'x', type: 'abstract', prompt: 'p', source: 's', estimated_minutes: 7 },
    ]);
    expect(total).toBe(12);
  });

  it('returns null when no problems carry an estimate (old mocks)', () => {
    const total = warmupTotalMinutes([
      { id: 'a', sub_skill: 'x', type: 'concrete', prompt: 'p', source: 's' },
      { id: 'b', sub_skill: 'x', type: 'abstract', prompt: 'p', source: 's' },
    ]);
    expect(total).toBeNull();
  });

  it('returns null for an empty warm-up', () => {
    expect(warmupTotalMinutes([])).toBeNull();
  });
});

describe('indexEvidenceBySubSkill', () => {
  it('groups evidence by sub-skill ID across all sessions', () => {
    const report: DetailedMasteryReport = {
      ...makeReport([]),
      sessions: [
        {
          session_id: 'session-1',
          session_date: '2025-04-24T16:30:00.000Z',
          transcript: '',
          evidence_by_sub_skill: [
            {
              sub_skill_id: '2.NBT.ADD.3',
              sub_skill_name: 'Add within 100 using place value strategies',
              status: 'developing',
              evidence: [
                { id: 'e1', selected_text: '713.', note: 'misconception' },
                { id: 'e2', selected_text: '59', note: 'recovered' },
              ],
            },
            {
              sub_skill_id: '2.NBT.ADD.7',
              sub_skill_name: 'Explain strategies',
              status: 'developing',
              evidence: [{ id: 'e3', selected_text: 'tens or ones', note: 'articulated' }],
            },
          ],
        },
      ],
    };

    const index = indexEvidenceBySubSkill(report);

    expect(index['2.NBT.ADD.3']).toHaveLength(2);
    expect(index['2.NBT.ADD.3'].map((e) => e.id)).toEqual(['e1', 'e2']);
    expect(index['2.NBT.ADD.7']).toHaveLength(1);
    expect(index['2.NBT.ADD.5']).toBeUndefined();
  });

  it('returns an empty record when the report has no sessions', () => {
    const report = makeReport([]);
    expect(indexEvidenceBySubSkill(report)).toEqual({});
  });
});

describe('describeConfidence', () => {
  it('returns null when the analyzer did not emit a score', () => {
    expect(describeConfidence(undefined)).toBeNull();
  });

  it('returns null for scores in the middle band between the thresholds', () => {
    expect(describeConfidence(LOW_CONFIDENCE_THRESHOLD)).toBeNull();
    expect(describeConfidence(0.72)).toBeNull();
    expect(describeConfidence(0.8499)).toBeNull();
  });

  it('returns a "low" description when the score is below the low threshold', () => {
    expect(describeConfidence(0.55)).toEqual({ level: 'low' });
    expect(describeConfidence(0)).toEqual({ level: 'low' });
    expect(describeConfidence(0.6499)).toEqual({ level: 'low' });
  });

  it('returns a "high" description when the score is at or above the high threshold', () => {
    expect(describeConfidence(HIGH_CONFIDENCE_THRESHOLD)).toEqual({ level: 'high' });
    expect(describeConfidence(0.9)).toEqual({ level: 'high' });
    expect(describeConfidence(1)).toEqual({ level: 'high' });
  });
});

describe('buildPlanText', () => {
  const baseInput = {
    studentName: 'Mia Rivera',
    headline: 'Today: help Mia Rivera get solid on adding 2-digit numbers by place value.',
    focus: {
      subSkill: {
        id: '2.NBT.ADD.3',
        name: 'Add within 100 using place value strategies',
        status: 'developing' as const,
        evidence_count: 2,
      },
      rationale:
        'Mia Rivera has 2 quotes from last session — the clearest place to focus today.',
    },
    warmup: [
      {
        id: 'P1',
        sub_skill: '2.NBT.ADD.3',
        type: 'concrete',
        prompt: 'Use blocks to solve 34 + 25.',
        source: 'Eureka',
      },
      {
        id: 'P2',
        sub_skill: '2.NBT.ADD.3',
        type: 'representational',
        prompt: '34 + 25 = (30 + 20) + (4 + 5).',
        source: 'IM',
      },
      {
        id: 'P3',
        sub_skill: '2.NBT.ADD.3',
        type: 'abstract',
        prompt: '47 + 36 = ?',
        source: 'Both',
      },
    ],
    tutorMoves: {
      common_misconceptions: ['Student concatenates digits (47 + 36 = 713).'],
      questions_to_ask: ['What is 47 made of?'],
      scaffolds: ['Break numbers into tens and ones.'],
      when_to_advance: ['Student uses place value correctly.'],
    },
  };

  it('includes the headline, student name, focus, warmup, and top tutor moves', () => {
    const text = buildPlanText(baseInput);

    expect(text).toContain('help Mia Rivera get solid on adding 2-digit numbers by place value');
    expect(text).toContain('Student: Mia Rivera');
    expect(text).toContain('Focus sub-skill: Add within 100 using place value strategies');
    expect(text).toContain('Why: Mia Rivera has 2 quotes from last session');
    expect(text).toContain('Warm-up:');
    expect(text).toContain('1. [With blocks] Use blocks to solve 34 + 25.');
    expect(text).toContain('2. [With a drawing] 34 + 25 = (30 + 20) + (4 + 5).');
    expect(text).toContain('3. [Numbers only] 47 + 36 = ?');
    expect(text).toContain('Watch for: Student concatenates digits');
    expect(text).toContain('Question: What is 47 made of?');
    expect(text).toContain('Scaffold: Break numbers into tens and ones.');
  });

  it('is deterministic for the same input', () => {
    expect(buildPlanText(baseInput)).toBe(buildPlanText(baseInput));
  });

  it('omits the focus and warmup sections when focus is null', () => {
    const text = buildPlanText({ ...baseInput, focus: null, warmup: [] });
    expect(text).not.toContain('Focus sub-skill');
    expect(text).not.toContain('Warm-up');
    expect(text).toContain('Student: Mia Rivera');
  });

  it('omits the tutor moves section when all move categories are empty', () => {
    const text = buildPlanText({
      ...baseInput,
      tutorMoves: {
        common_misconceptions: [],
        questions_to_ask: [],
        scaffolds: [],
        when_to_advance: [],
      },
    });

    expect(text).not.toContain('Top tutor moves');
  });
});

describe('formatSessionWhen', () => {
  // Reference "now": Sunday, June 15 2025 at noon local. Mid-year so
  // DST transitions don't affect the ±14-day window around this date.
  const NOW = new Date(2025, 5, 15, 12, 0);

  // Build an ISO string for a session happening at a given calendar
  // day (relative to NOW) at the given local hour:minute. Using the
  // Date constructor's local-time form keeps the calendar-day math
  // honest on the test runner's machine.
  const iso = (daysFromNow: number, hour: number, minute: number): string =>
    new Date(2025, 5, 15 + daysFromNow, hour, minute).toISOString();

  it('renders "Today at {time}" when the session is on the same calendar day', () => {
    expect(formatSessionWhen(iso(0, 16, 30), NOW)).toMatch(/^Today at /);
  });

  it('renders "Tomorrow at {time}" when the session is the next calendar day', () => {
    expect(formatSessionWhen(iso(1, 9, 0), NOW)).toMatch(/^Tomorrow at /);
  });

  it('renders "Yesterday at {time}" when the session was the previous calendar day', () => {
    expect(formatSessionWhen(iso(-1, 13, 15), NOW)).toMatch(/^Yesterday at /);
  });

  it('renders "This {weekday}" for sessions 2-6 days ahead', () => {
    // NOW is Sunday; +3 days = Wednesday.
    expect(formatSessionWhen(iso(3, 14, 0), NOW)).toMatch(/^This Wednesday at /);
  });

  it('renders "Next {weekday}" for sessions 7-13 days ahead', () => {
    // NOW is Sunday; +10 days = Wednesday next week.
    expect(formatSessionWhen(iso(10, 10, 0), NOW)).toMatch(/^Next Wednesday at /);
  });

  it('renders "Last {weekday}" for sessions 2-6 days ago', () => {
    // NOW is Sunday; -4 days = Wednesday.
    expect(formatSessionWhen(iso(-4, 11, 30), NOW)).toMatch(/^Last Wednesday at /);
  });

  it('falls back to a full weekday + month + day phrase for sessions >13 days away', () => {
    // NOW is Sunday June 15; +100 days lands in late September.
    const result = formatSessionWhen(iso(100, 12, 0), NOW);
    expect(result).not.toMatch(/^(Today|Tomorrow|Yesterday|This |Next |Last )/);
    expect(result).toMatch(/ at /);
    // Should name a weekday AND a month abbreviation.
    expect(result).toMatch(/\w+day/);
    expect(result).toMatch(/Sep|Oct/);
  });

  it('returns the raw string when the ISO timestamp is invalid', () => {
    expect(formatSessionWhen('not-a-date', NOW)).toBe('not-a-date');
  });
});
