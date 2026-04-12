/**
 * Pure, framework-free derivation layer for the pre-session briefing.
 *
 * These helpers take mock mastery-report data and compute the views the
 * tutor-facing UI renders: status buckets, today's focus, the headline,
 * and a CPA-ordered warm-up sequence. Keeping them pure makes the UI
 * thin and the tests cheap.
 */
import type {
  CurriculumReference,
  DetailedMasteryReport,
  EvidenceQuote,
  LatestMasteryReport,
  ProblemBankItem,
  SubSkillSnapshot,
  TutorMoves,
} from '@/lib/types';

export type BriefingReport = LatestMasteryReport | DetailedMasteryReport;

export interface SubSkillBuckets {
  needsWork: SubSkillSnapshot[];
  developing: SubSkillSnapshot[];
  secure: SubSkillSnapshot[];
  notYetProbed: SubSkillSnapshot[];
}

export interface PrimaryFocus {
  subSkill: SubSkillSnapshot;
  rationale: string;
}

export interface HeadlineOptions {
  studentName: string;
  plainClusterName: string;
}

const CPA_ORDER: readonly string[] = ['concrete', 'representational', 'abstract', 'application'];

/**
 * Tutor-facing plain-English labels for the `type` field on a
 * `ProblemBankItem`. The underlying taxonomy is Concrete /
 * Representational / Abstract / Application (CPA+), which is standard
 * math-ed pedagogy — but a novice volunteer tutor doesn't know those
 * words. These labels describe what the tutor will actually be holding
 * during the problem.
 */
const CPA_PLAIN_LABEL: Record<string, string> = {
  concrete: 'With blocks',
  representational: 'With a drawing',
  abstract: 'Numbers only',
  application: 'Word problem',
};

function plainCpaLabel(type: string): string {
  return CPA_PLAIN_LABEL[type] ?? type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Plain-English rewrite of the raw Common Core cluster string. The raw
 * prose ("Use place value understanding and properties of operations to
 * add and subtract") is written for teachers; the map below gives a
 * sentence a college volunteer tutor can actually read aloud. Unknown
 * clusters fall through to a lowercase version of the raw string.
 */
export const PLAIN_CLUSTER_NAME: Record<string, string> = {
  'Use place value understanding and properties of operations to add and subtract':
    'adding 2-digit numbers by place value',
};

export function getPlainClusterName(cluster: string): string {
  return PLAIN_CLUSTER_NAME[cluster] ?? cluster.toLowerCase();
}

/**
 * Group the cluster's sub-skills by working status. The "not yet probed"
 * bucket is a first-class signal — gaps in what the AI has observed are
 * themselves useful for a tutor planning their next session.
 *
 * Stable ordering: within each bucket, sub-skills are sorted by ID so the
 * UI render order is deterministic across renders and runs.
 */
export function bucketSubSkills(report: BriefingReport): SubSkillBuckets {
  const buckets: SubSkillBuckets = {
    needsWork: [],
    developing: [],
    secure: [],
    notYetProbed: [],
  };

  for (const skill of report.sub_skills) {
    if (skill.status === 'secure') {
      buckets.secure.push(skill);
    } else if (skill.status === 'not_assessed') {
      buckets.notYetProbed.push(skill);
    } else if (skill.evidence_count === 0) {
      // Developing but with no evidence captured yet — treat as the highest
      // priority "needs work" signal, since the AI flagged it but has
      // nothing concrete to back it up.
      buckets.needsWork.push(skill);
    } else {
      buckets.developing.push(skill);
    }
  }

  const byId = (a: SubSkillSnapshot, b: SubSkillSnapshot) => a.id.localeCompare(b.id);
  buckets.needsWork.sort(byId);
  buckets.developing.sort(byId);
  buckets.secure.sort(byId);
  buckets.notYetProbed.sort(byId);

  return buckets;
}

/**
 * Pick the single sub-skill the tutor should work on today. Preference
 * order: any "needs work" (developing, zero evidence) first; otherwise
 * the developing sub-skill with the most evidence (most signal to act
 * on); tiebreak by ID. Falls back to the first `not_assessed` skill if
 * nothing is developing — "we don't know yet, let's find out" is a
 * valid plan.
 *
 * Rationale strings are student-agnostic — the h1 already names the
 * student, and the focus card sits directly under the h1, so a third
 * mention in the rationale reads as repetition.
 */
export function pickPrimaryFocus(report: BriefingReport): PrimaryFocus | null {
  if (report.sub_skills.length === 0) return null;

  const buckets = bucketSubSkills(report);

  if (buckets.needsWork.length > 0) {
    const subSkill = buckets.needsWork[0];
    return {
      subSkill,
      rationale: "Wobble here but no evidence yet — worth building up.",
    };
  }

  if (buckets.developing.length > 0) {
    const sorted = [...buckets.developing].sort((a, b) => {
      if (b.evidence_count !== a.evidence_count) return b.evidence_count - a.evidence_count;
      return a.id.localeCompare(b.id);
    });
    const subSkill = sorted[0];
    const quoteWord = subSkill.evidence_count === 1 ? 'quote' : 'quotes';
    return {
      subSkill,
      rationale: `Clearest place to focus — ${subSkill.evidence_count} ${quoteWord} from last session.`,
    };
  }

  if (buckets.notYetProbed.length > 0) {
    const subSkill = buckets.notYetProbed[0];
    return {
      subSkill,
      rationale: "Haven't seen this yet — use today to get a read.",
    };
  }

  return null;
}

/**
 * A one-sentence headline for the top of the briefing. Deterministic so
 * it doesn't jiggle between renders. The headline IS the page h1 — it
 * must read like a sentence a tutor can speak, not a report heading.
 */
export function formatHeadline(
  _report: BriefingReport,
  focus: PrimaryFocus | null,
  opts: HeadlineOptions,
): string {
  const { studentName, plainClusterName } = opts;
  if (!focus) {
    return `Today: free exploration with ${studentName} on ${plainClusterName}.`;
  }
  return `Today: help ${studentName} get solid on ${plainClusterName}.`;
}

/**
 * Filter the problem bank to a single sub-skill and order along the
 * Concrete → Pictorial/Representational → Abstract → Application ladder
 * (the standard math pedagogy progression). Unknown types land at the
 * end in a stable order so the output is deterministic.
 */
export function orderProblemsCPA(
  problems: ProblemBankItem[],
  subSkillId: string,
): ProblemBankItem[] {
  const matching = problems.filter((p) => p.sub_skill === subSkillId);
  return [...matching].sort((a, b) => {
    const aIdx = CPA_ORDER.indexOf(a.type);
    const bIdx = CPA_ORDER.indexOf(b.type);
    const aRank = aIdx === -1 ? CPA_ORDER.length : aIdx;
    const bRank = bIdx === -1 ? CPA_ORDER.length : bIdx;
    if (aRank !== bRank) return aRank - bRank;
    return a.id.localeCompare(b.id);
  });
}

/**
 * Build the suggested 3-problem warm-up for the focus sub-skill.
 * Truncated to 3 so the tutor has a crisp plan, not a homework
 * assignment. Returns `[]` when the focus has no matching problems —
 * the UI should handle this gracefully, not crash.
 */
export function buildWarmup(
  report: BriefingReport,
  curriculum: CurriculumReference,
  focus: PrimaryFocus | null,
): ProblemBankItem[] {
  if (!focus) return [];
  const ordered = orderProblemsCPA(curriculum.problems, focus.subSkill.id);
  return ordered.slice(0, 3);
}

/**
 * Pass-through for MVP. Future iteration: filter or re-order based on
 * which misconceptions showed up in the focus sub-skill's evidence.
 */
export function prioritizedTutorMoves(
  curriculum: CurriculumReference,
  _focus: PrimaryFocus | null,
): TutorMoves {
  return curriculum.tutor_moves;
}

/**
 * Score a curriculum-generic move by how well its wording overlaps the
 * last-session transcript. Words ≥4 chars are used as simple tokens;
 * each token that appears (case-insensitive) in the transcript adds
 * one point. This is intentionally a cheap heuristic, not NLP — its
 * only job is to bias `topMovesForFocus` toward moves the tutor was
 * already observed using.
 */
function scoreMoveAgainstTranscript(text: string, transcript: string): number {
  if (!text) return 0;
  const haystack = transcript.toLowerCase();
  const tokens = text
    .toLowerCase()
    .split(/\W+/)
    .filter((t) => t.length >= 4);
  if (tokens.length === 0) return 0;
  return tokens.filter((t) => haystack.includes(t)).length;
}

function pickBestMove(candidates: string[], transcript?: string): string | undefined {
  if (candidates.length === 0) return undefined;
  if (!transcript) return candidates[0];
  // Stable sort: keep original order for ties, prefer higher score.
  const scored = candidates.map((text, i) => ({
    text,
    i,
    score: scoreMoveAgainstTranscript(text, transcript),
  }));
  scored.sort((a, b) => (b.score - a.score) || (a.i - b.i));
  return scored[0].text;
}

/**
 * Inline "most likely to fire today" tutor moves for the focus card.
 * Returns the first entry from each of three actionable categories
 * (misconception / question / scaffold) — optionally re-ranked by
 * which move wording overlaps the last-session transcript, so moves
 * the tutor ALREADY used (and that presumably worked) bubble up
 * ahead of generic curriculum options.
 *
 * Deliberately skips `when_to_advance`: "signs to advance" belongs
 * in its own advance-path block, not this inline trio.
 */
export function topMovesForFocus(
  moves: TutorMoves,
  opts: { transcript?: string } = {},
): {
  misconception?: string;
  question?: string;
  scaffold?: string;
} {
  return {
    misconception: pickBestMove(moves.common_misconceptions, opts.transcript),
    question: pickBestMove(moves.questions_to_ask, opts.transcript),
    scaffold: pickBestMove(moves.scaffolds, opts.transcript),
  };
}

/**
 * A single sentence — a goal the tutor can work toward today — derived
 * from the curriculum's per-sub-skill `description`. Returns `null` if
 * the focus has no matching curriculum entry, in which case the UI
 * falls back to not rendering a goal line.
 */
export function getFocusGoal(
  focus: PrimaryFocus | null,
  curriculum: CurriculumReference,
): string | null {
  if (!focus) return null;
  const match = curriculum.sub_skills.find((s) => s.id === focus.subSkill.id);
  return match?.description ?? null;
}

/**
 * Sum of `estimated_minutes` across a warm-up. Returns `null` when no
 * problems carry estimates (old mocks), so the UI can skip the
 * total-minute tag rather than showing a zero.
 */
export function warmupTotalMinutes(warmup: ProblemBankItem[]): number | null {
  const total = warmup.reduce((sum, p) => sum + (p.estimated_minutes ?? 0), 0);
  return total > 0 ? total : null;
}

/**
 * Aggregate evidence quotes across all sessions into a lookup keyed by
 * sub-skill ID. Returns a plain record (serializable across server →
 * client component boundaries).
 */
export function indexEvidenceBySubSkill(
  report: DetailedMasteryReport,
): Record<string, EvidenceQuote[]> {
  const index: Record<string, EvidenceQuote[]> = {};
  for (const session of report.sessions) {
    for (const entry of session.evidence_by_sub_skill) {
      if (!index[entry.sub_skill_id]) {
        index[entry.sub_skill_id] = [];
      }
      index[entry.sub_skill_id].push(...entry.evidence);
    }
  }
  return index;
}

/**
 * Format a session's ISO timestamp as a human-scannable "when" phrase
 * for the pre-session utility bar — e.g. "Today at 4:30 PM",
 * "Tomorrow at 9:00 AM", "This Thursday at 2:15 PM", "Next Monday at
 * 10:00 AM", "Last Wednesday at 11:30 AM". For sessions outside ±13
 * calendar days, falls back to a full weekday + month + day phrase so
 * the output stays unambiguous.
 *
 * Pure function: takes `now` as an argument so tests can pin the
 * reference time and assert behavior deterministically.
 */
export function formatSessionWhen(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  // Calendar-day delta (DST-safe). Using UTC day indices of each
  // Date's local calendar date sidesteps off-by-one rounding on weeks
  // that contain a DST transition.
  const toDayIndex = (d: Date) =>
    Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000);
  const deltaDays = toDayIndex(date) - toDayIndex(now);

  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });

  let day: string;
  if (deltaDays === 0) day = 'Today';
  else if (deltaDays === 1) day = 'Tomorrow';
  else if (deltaDays === -1) day = 'Yesterday';
  else if (deltaDays >= 2 && deltaDays <= 6) day = `This ${weekday}`;
  else if (deltaDays >= 7 && deltaDays <= 13) day = `Next ${weekday}`;
  else if (deltaDays >= -6 && deltaDays <= -2) day = `Last ${weekday}`;
  else {
    day = date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  }

  return `${day} at ${time}`;
}

/**
 * Confidence thresholds. Below `LOW` the UI shows a "worth
 * double-checking" nudge; at or above `HIGH` the UI shows a quiet
 * "AI is confident" checkmark next to the status chip. Scores in the
 * middle band get nothing — silence is a feature in the middle but a
 * bug at both ends.
 */
export const LOW_CONFIDENCE_THRESHOLD = 0.65;
export const HIGH_CONFIDENCE_THRESHOLD = 0.85;

/**
 * Tutor-facing representation of a confidence score. Returns `null`
 * when the analyzer didn't emit a score, or when the score lives in
 * the middle band where neither a warning nor a trust signal is
 * useful.
 */
export function describeConfidence(
  confidence: number | undefined,
): { level: 'low' | 'high' } | null {
  if (confidence === undefined) return null;
  if (confidence < LOW_CONFIDENCE_THRESHOLD) return { level: 'low' };
  if (confidence >= HIGH_CONFIDENCE_THRESHOLD) return { level: 'high' };
  return null;
}

interface BuildPlanTextInput {
  studentName: string;
  headline: string;
  focus: PrimaryFocus | null;
  warmup: ProblemBankItem[];
  tutorMoves: TutorMoves;
}

/**
 * Build a plain-text version of today's plan, suitable for pasting into
 * the tutor's session notes or a Slack message. Deterministic; only
 * includes sections it has data for.
 */
export function buildPlanText(input: BuildPlanTextInput): string {
  const { studentName, headline, focus, warmup, tutorMoves } = input;
  const lines: string[] = [];

  lines.push(headline);
  lines.push('');
  lines.push(`Student: ${studentName}`);

  if (focus) {
    lines.push('');
    lines.push(`Focus sub-skill: ${focus.subSkill.name}`);
    lines.push(`Why: ${focus.rationale}`);
  }

  if (warmup.length > 0) {
    lines.push('');
    lines.push('Warm-up:');
    warmup.forEach((problem, index) => {
      lines.push(`  ${index + 1}. [${plainCpaLabel(problem.type)}] ${problem.prompt}`);
    });
  }

  const topMisconception = tutorMoves.common_misconceptions[0];
  const topQuestion = tutorMoves.questions_to_ask[0];
  const topScaffold = tutorMoves.scaffolds[0];

  if (topMisconception || topQuestion || topScaffold) {
    lines.push('');
    lines.push('Top tutor moves:');
    if (topMisconception) lines.push(`  Watch for: ${topMisconception}`);
    if (topQuestion) lines.push(`  Question: ${topQuestion}`);
    if (topScaffold) lines.push(`  Scaffold: ${topScaffold}`);
  }

  return lines.join('\n');
}
