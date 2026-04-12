import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import type {
  DetailedMasteryReport,
  SessionRecord,
  StudentProfile,
} from '@/lib/types';
import { Briefing } from './Briefing';

const student: StudentProfile = {
  student_id: 'student-test',
  student_name: 'Mia Rivera',
  grade_level: 'Grade 2',
};

const session: SessionRecord = {
  session_id: 'session-test',
  tutor_id: 'tutor-test',
  student_id: 'student-test',
  session_date: '2025-04-24T16:30:00.000Z',
  title: 'Place value addition check-in',
  transcript: `[PROBLEM CHANGE: p1 - "47 + 36 = ?" (start)]
00:04 TUTOR: Try it.
00:11 STUDENT: 713.
[PROBLEM CHANGE: p2 - "34 + 25" (start)]
01:38 STUDENT: 30 and 4. Then 20 and 5.
01:45 STUDENT: 50 and 9, so 59.`,
};

function makeReport(): DetailedMasteryReport {
  return {
    report_id: 'report-test',
    tutor_id: 'tutor-test',
    student_id: student.student_id,
    session_count: 1,
    overall_summary: 'Test summary.',
    created_at: '2025-04-24T16:30:00.000Z',
    cluster: {
      grade: 2,
      cluster: 'Use place value understanding and properties of operations to add and subtract',
      priority_level: 'Major Work',
    },
    sub_skills: [
      {
        id: '2.NBT.ADD.1',
        name: 'Understand hundreds, tens, and ones as units',
        status: 'not_assessed',
        evidence_count: 0,
      },
      {
        id: '2.NBT.ADD.2',
        name: 'Compose and decompose numbers',
        status: 'not_assessed',
        evidence_count: 0,
      },
      {
        id: '2.NBT.ADD.3',
        name: 'Add within 100 using place value strategies',
        status: 'developing',
        evidence_count: 2,
        confidence: 0.55,
      },
      {
        id: '2.NBT.ADD.4',
        name: 'Subtract within 100 using place value strategies',
        status: 'not_assessed',
        evidence_count: 0,
      },
      {
        id: '2.NBT.ADD.5',
        name: 'Add within 200 using place value reasoning',
        status: 'not_assessed',
        evidence_count: 0,
      },
      {
        id: '2.NBT.ADD.6',
        name: 'Subtract within 200 with regrouping',
        status: 'not_assessed',
        evidence_count: 0,
      },
      {
        id: '2.NBT.ADD.7',
        name: 'Explain strategies using place value language',
        status: 'developing',
        evidence_count: 1,
        confidence: 0.72,
      },
    ],
    curriculum: {
      cluster: {
        grade: 2,
        cluster: 'Use place value understanding and properties of operations to add and subtract',
        priority_level: 'Major Work',
      },
      sub_skills: [
        {
          id: '2.NBT.ADD.3',
          name: 'Add within 100 using place value strategies',
          description: 'Student adds by breaking apart tens and ones.',
        },
      ],
      problems: [
        {
          id: 'P1',
          sub_skill: '2.NBT.ADD.3',
          type: 'concrete',
          prompt: 'Use blocks to solve 34 + 25.',
          source: 'Eureka',
          estimated_minutes: 5,
        },
        {
          id: 'P2',
          sub_skill: '2.NBT.ADD.3',
          type: 'representational',
          prompt: '34 + 25 = (30 + 20) + (4 + 5).',
          source: 'IM',
          estimated_minutes: 5,
        },
        {
          id: 'P3',
          sub_skill: '2.NBT.ADD.3',
          type: 'abstract',
          prompt: '47 + 36 = ?',
          source: 'Both',
          estimated_minutes: 5,
        },
        {
          id: 'P4',
          sub_skill: '2.NBT.ADD.3',
          type: 'application',
          prompt: 'Sticker word problem.',
          source: 'Adapted',
          estimated_minutes: 8,
        },
      ],
      tutor_moves: {
        common_misconceptions: ['Student concatenates digits (47 + 36 = 713).'],
        questions_to_ask: ['What is 47 made of?'],
        scaffolds: ['Break numbers into tens and ones.'],
        when_to_advance: ['Student uses place value correctly.'],
      },
    },
    sessions: [
      {
        session_id: session.session_id,
        session_date: session.session_date,
        transcript: session.transcript,
        affect_note:
          'Started a little stuck at 47+36, recovered quickly with scaffolding. Stayed engaged.',
        evidence_by_sub_skill: [
          {
            sub_skill_id: '2.NBT.ADD.3',
            sub_skill_name: 'Add within 100 using place value strategies',
            status: 'developing',
            evidence: [
              {
                id: 'e1',
                selected_text: '713.',
                note: 'Place value misconception surfaced.',
                transcript_anchor: '#problem-p1',
              },
              {
                id: 'e2',
                selected_text: '50 and 9, so 59.',
                note: 'Recovered to a correct strategy with scaffolding.',
                transcript_anchor: '#problem-p2',
              },
            ],
          },
          {
            sub_skill_id: '2.NBT.ADD.7',
            sub_skill_name: 'Explain strategies using place value language',
            status: 'developing',
            evidence: [
              {
                id: 'e3',
                selected_text: 'Because each digit means tens or ones',
                note: 'Articulated place value reasoning.',
                transcript_anchor: '#problem-p3',
              },
            ],
          },
        ],
      },
    ],
  };
}

describe('Briefing', () => {
  it('renders the headline, focus, buckets, and tutor moves for the seeded student', () => {
    render(<Briefing report={makeReport()} student={student} session={session} />);

    // The page h1 IS the recommendation — a sentence the tutor can
    // speak aloud, naming both the student and the plain cluster.
    expect(
      screen.getByRole('heading', { level: 1, name: /help mia rivera get solid/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/adding 2-digit numbers by place value/i)).toBeInTheDocument();

    // The utility bar shows first name + grade + relative time.
    expect(screen.getByText(/mia · grade 2/i)).toBeInTheDocument();

    // Focus card heading (demoted from "Today's focus" — the h1 above
    // already carries "Today:").
    expect(screen.getByRole('heading', { name: /^the focus$/i })).toBeInTheDocument();

    // "Not yet seen" bucket heading is visible — not_assessed is a
    // first-class signal, surfaced as a bulleted list rather than
    // full sub-skill cards that would dominate the page.
    expect(screen.getByRole('heading', { name: /not yet seen/i })).toBeInTheDocument();

    // Tutor moves card is the secondary "back pocket" card; at least
    // one question rendered. "What is 47 made of?" appears twice: once
    // inlined on the focus card and once in the full grid, so we use
    // getAllByText.
    expect(screen.getByRole('heading', { name: /more moves to keep in your back pocket/i }))
      .toBeInTheDocument();
    expect(screen.getAllByText(/what is 47 made of/i).length).toBeGreaterThan(0);

    // Transcript collapsed by default (no `open` attribute)
    const transcriptSummary = screen.getByText(/last session transcript/i);
    const details = transcriptSummary.closest('details');
    expect(details).not.toBeNull();
    expect(details).not.toHaveAttribute('open');
  });

  it('exposes a skip link pointing at the main content landmark', () => {
    render(<Briefing report={makeReport()} student={student} session={session} />);

    const skipLink = screen.getByRole('link', { name: /skip to main content/i });
    expect(skipLink.getAttribute('href')).toBe('#main-content');
    expect(document.getElementById('main-content')).not.toBeNull();
  });

it('surfaces the low-confidence chip on the sub-skill flagged as uncertain', () => {
    render(<Briefing report={makeReport()} student={student} session={session} />);

    // 2.NBT.ADD.3 has confidence 0.55 → should show one "double-check" chip.
    // 2.NBT.ADD.7 has confidence 0.72 → middle band, should show neither signal.
    // The full "isn't sure here" sentence is in the aria-label; the visible
    // chip text is the shorter "Double-check" label.
    const chips = screen.getAllByLabelText(/isn't sure here/i);
    expect(chips).toHaveLength(1);
  });

  it('renders the copy-plan button for the focus card', () => {
    render(<Briefing report={makeReport()} student={student} session={session} />);

    expect(screen.getByRole('button', { name: /copy plan/i })).toBeInTheDocument();
  });

  it('renders the at-a-glance strip with an opener row for the top question', () => {
    render(<Briefing report={makeReport()} student={student} session={session} />);

    expect(screen.getByRole('region', { name: /at a glance/i })).toBeInTheDocument();
    expect(screen.getByText(/^Opener$/i)).toBeInTheDocument();
    // The opener value quotes the question move the tutor most recently used.
    expect(screen.getAllByText(/what is 47 made of/i).length).toBeGreaterThan(0);
  });

it('renders the focus-card Goal line from the curriculum description', () => {
    render(<Briefing report={makeReport()} student={student} session={session} />);

    expect(screen.getByText(/^Goal$/i)).toBeInTheDocument();
    // Goal text is the curriculum description for the focus sub-skill.
    expect(screen.getByText(/student adds by breaking apart tens and ones/i)).toBeInTheDocument();
  });

it('renders warm-up time estimates (~N min per tile)', () => {
    render(<Briefing report={makeReport()} student={student} session={session} />);

    // Each tile's estimated minutes renders as "~N min".
    const mins = screen.getAllByText(/^~\d+\smin$/);
    expect(mins.length).toBeGreaterThanOrEqual(3);
  });

  it('collapses the sub-skill map and tutor-moves card by default', () => {
    render(<Briefing report={makeReport()} student={student} session={session} />);

    const mapSummary = screen.getByRole('heading', { name: /sub-skill map/i });
    const mapDetails = mapSummary.closest('details');
    expect(mapDetails).not.toBeNull();
    expect(mapDetails).not.toHaveAttribute('open');

    const movesSummary = screen.getByRole('heading', {
      name: /more moves to keep in your back pocket/i,
    });
    const movesDetails = movesSummary.closest('details');
    expect(movesDetails).not.toBeNull();
    expect(movesDetails).not.toHaveAttribute('open');
  });

  it('has no axe-detectable accessibility violations', async () => {
    const { container } = render(
      <Briefing report={makeReport()} student={student} session={session} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
