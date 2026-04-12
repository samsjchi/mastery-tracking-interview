import type { CurriculumReference, SessionRecord, StudentProfile, TutorProfile } from '@/lib/types';

export const seededTutor: TutorProfile = {
  tutor_id: '2025-t27049',
  tutor_name: 'Sasha Patel',
};

export const seededStudent: StudentProfile = {
  student_id: '2025-s12123',
  student_name: 'Mia Rivera',
  grade_level: 'Grade 2',
};

export const curriculumReference: CurriculumReference = {
  cluster: {
    grade: 2,
    cluster: 'Use place value understanding and properties of operations to add and subtract',
    priority_level: 'Major Work',
  },
  sub_skills: [
    {
      id: '2.NBT.ADD.1',
      name: 'Understand hundreds, tens, and ones as units',
      description: 'Student identifies and represents numbers using base-ten structure.',
    },
    {
      id: '2.NBT.ADD.2',
      name: 'Compose and decompose numbers',
      description: 'Student breaks numbers into tens and ones.',
    },
    {
      id: '2.NBT.ADD.3',
      name: 'Add within 100 using place value strategies',
      description: 'Student adds by breaking apart tens and ones.',
    },
    {
      id: '2.NBT.ADD.4',
      name: 'Subtract within 100 using place value strategies',
      description: 'Student subtracts using decomposition.',
    },
    {
      id: '2.NBT.ADD.5',
      name: 'Add within 200 using place value reasoning',
      description: 'Student extends strategies to larger numbers.',
    },
    {
      id: '2.NBT.ADD.6',
      name: 'Subtract within 200 with regrouping',
      description: 'Student understands regrouping conceptually.',
    },
    {
      id: '2.NBT.ADD.7',
      name: 'Explain strategies using place value language',
      description: 'Student justifies reasoning using math language.',
    },
  ],
  problems: [
    {
      id: 'P1',
      sub_skill: '2.NBT.ADD.3',
      type: 'concrete',
      prompt: 'Use drawings or blocks to solve 34 + 25.',
      source: 'Eureka Math',
      estimated_minutes: 5,
    },
    {
      id: 'P2',
      sub_skill: '2.NBT.ADD.3',
      type: 'representational',
      prompt: '34 + 25 = (30 + 20) + (4 + 5).',
      source: 'Illustrative Mathematics',
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
      prompt: 'A student has 47 stickers and gets 36 more. How many now?',
      source: 'Adapted',
      estimated_minutes: 8,
    },
  ],
  tutor_moves: {
    common_misconceptions: [
      'Digits-as-a-single-number confusion.',
      'Adds ones or tens without attending to place value.',
    ],
    questions_to_ask: [
      'What is 47 made of?',
      'How many tens do we have?',
      'How many ones do we have?',
    ],
    scaffolds: ['Break each number apart before adding.', 'Use drawings or base-ten blocks.'],
    when_to_advance: [
      'Student consistently adds using place value correctly.',
      'Student can explain the strategy in place value language.',
    ],
  },
};

export const seededSession: SessionRecord = {
  session_id: 'session-2025-04-24',
  tutor_id: seededTutor.tutor_id,
  student_id: seededStudent.student_id,
  session_date: '2025-04-24T16:30:00.000Z',
  title: 'Place value addition check-in',
  transcript: `[PROBLEM CHANGE: p1 - "47 + 36 = ?" (start)]
// Whiteboard shows 47 + 36 with space to break numbers into tens and ones.
00:04 TUTOR: Try it any way that makes sense to you.
00:11 STUDENT: 713.
00:15 TUTOR: Can you show me how you got 713?
00:22 STUDENT: I put the 7 and the 3 together, and then the 4 and the 6.
00:30 TUTOR: Let's slow down. What is 47 made of?
00:36 STUDENT: 4 tens and 7 ones.
00:42 TUTOR: What about 36?
00:46 STUDENT: 3 tens and 6 ones.
00:53 TUTOR: So how many tens do we have? How many ones?
01:00 STUDENT: 7 tens and 13 ones.
01:07 TUTOR: What could we do with 13 ones?
01:12 STUDENT: Make 1 more ten and 3 ones.
01:18 TUTOR: So the total is?
01:20 STUDENT: 83.

[PROBLEM CHANGE: p2 - "34 + 25" (start)]
// Tutor asks the student to solve it by breaking apart each number first.
01:32 TUTOR: This time, start by breaking both numbers apart.
01:38 STUDENT: 30 and 4. Then 20 and 5.
01:45 STUDENT: 50 and 9, so 59.

[PROBLEM CHANGE: p3 - "A student has 47 stickers and gets 36 more. How many now?" (start)]
// Tutor points back to the earlier tens-and-ones work.
01:58 TUTOR: What would you do first?
02:04 STUDENT: Add the tens, then the ones.
02:10 TUTOR: Can you explain why that works?
02:18 STUDENT: Because each digit means tens or ones, not just the number by itself.
02:28 TUTOR: Good. Next time I want you to set that up without my help.`,
};
