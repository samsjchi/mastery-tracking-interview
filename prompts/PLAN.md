# Pre-session mastery briefing — build plan

## Context

Take-home for a contract product engineer role at Step Up Tutoring. The repo
at [/Users/samchi/Desktop/step-up-tutoring/mastery-tracking-interview](/Users/samchi/Desktop/step-up-tutoring/mastery-tracking-interview)
is a Next.js 15 / React 19 / TypeScript scaffold with seeded mock mastery data
for one Grade 2 tutor+student+session. The seeded landing page is a
docs-style surface pointing at materials, not a product.

**Goal:** replace the landing page with the front-end a **novice volunteer
tutor** sees **right before joining their next session** — a 60-second
pre-flight briefing that answers:

1. What does this student know, and what's still shaky?
2. What is the single best thing I should do today?
3. What evidence backs that up, so I trust the assessment?
4. What exact moves (questions, scaffolds, problems) can I use?

**Constraints:** 90–120 min total. Rubric is code quality + product thinking

- execution speed + tool use. No backend changes, no new frameworks, plain
  CSS reusing existing tokens, TypeScript strict, unit tests with >80%
  coverage on authored files.

## What's in the repo (verified)

- Tutor: **Sasha Patel** (`2025-t27049`). Student: **Mia Rivera**
  (`2025-s12123`, Grade 2). Session: `session-2025-04-24`.
- One cluster: _"Use place value understanding and properties of operations
  to add and subtract"_ — 7 sub-skills (`2.NBT.ADD.1`–`2.NBT.ADD.7`).
- The fake generator in [lib/generator.ts](/Users/samchi/Desktop/step-up-tutoring/mastery-tracking-interview/lib/generator.ts)
  hardcodes evidence for only 2 sub-skills: `2.NBT.ADD.3` (developing, 2
  quotes) and `2.NBT.ADD.7` (developing, 1 quote). The other 5 are
  `not_assessed`. This is the mock contract — do NOT "fix" it.
- Problem bank: 4 problems (P1–P4), **all on `2.NBT.ADD.3`**, across the CPA
  ladder: concrete → representational → abstract → application.
- Transcript has `[PROBLEM CHANGE: p1|p2|p3 …]` markers — only p1/p2/p3 were
  worked in the session (no p4). These become the anchor IDs for the
  evidence → transcript deep-link.
- **Zero test infra.** No ESLint/Prettier. tsconfig strict, `@/*` path
  alias. `.gitignore` already includes `/coverage`.
- [app/page.tsx](/Users/samchi/Desktop/step-up-tutoring/mastery-tracking-interview/app/page.tsx)
  is a Server Component. [app/layout.tsx](/Users/samchi/Desktop/step-up-tutoring/mastery-tracking-interview/app/layout.tsx)
  is minimal — do not touch.
- Styling: reuse tokens in [app/globals.css](/Users/samchi/Desktop/step-up-tutoring/mastery-tracking-interview/app/globals.css)
  (`--brand`, `--surface`, `--surface-muted`, `--border`, `--text`,
  `--text-muted`, `--brand-soft`, `--shadow`). The existing look (soft
  gradients, glass cards, `#1e5bb8` brand) is already good — extend, don't
  fight.

## Product decisions (proposed — pending green-light)

These reflect the leans in the prompt; I'm adopting them as-is because each
is sound for a pre-session 60-second read.

1. **Mastery representation:** ordinal chip with 3 states (`not_assessed`
   / `developing` / `secure`). Continuous percentages on n=1 session with
   1–2 evidence points would be false precision.
2. **`not_assessed` is a first-class state** — its own "Haven't probed
   yet" bucket so coverage gaps are visible, not hidden.
3. **Information hierarchy — single scrollable page, top-down:**
   - **Header strip:** student name + grade + cluster + last-session date
     - one-sentence headline recommendation.
   - **Today's focus card:** 1 priority sub-skill + rationale + suggested
     3-problem warm-up sequenced along the CPA ladder.
   - **Sub-skill map:** all 7 cards, grouped by bucket (Needs work /
     Developing / Haven't probed yet / Secure), evidence counts visible,
     click to expand evidence.
   - **Tutor moves card:** misconceptions to watch for, questions to ask,
     scaffolds — from `curriculum.tutor_moves`.
   - **Transcript panel:** collapsed by default; anchors at each problem
     change for deep-linking.
4. **Navigation:** single scrollable page. Not tabs.
5. **Transcript visible:** yes, collapsed by default.

## File layout

### New files

- `app/page.tsx` — **replaced**. Server component. Pulls data via
  `getDetailedReport()` and `getSeedContext()` from
  [lib/store.ts](/Users/samchi/Desktop/step-up-tutoring/mastery-tracking-interview/lib/store.ts)
  directly (cheaper than HTTP-fetching the route from a server component,
  same mock data). Renders `<Briefing report={report} tutor={...}
student={...} session={...} />`.
- `app/briefing/Briefing.tsx` — presentational shell. Takes full
  `DetailedMasteryReport` + metadata as props. This is what the full-page
  test mounts.
- `app/briefing/components/HeaderStrip.tsx` — server.
- `app/briefing/components/TodayFocusCard.tsx` — server.
- `app/briefing/components/SubSkillMap.tsx` — server.
- `app/briefing/components/SubSkillCard.tsx` — **client** (expand state).
- `app/briefing/components/StatusChip.tsx` — server.
- `app/briefing/components/EvidencePanel.tsx` — server.
- `app/briefing/components/TutorMovesCard.tsx` — server.
- `app/briefing/components/TranscriptPanel.tsx` — **client** (collapsed
  details/summary, assigns `#problem-p1|p2|p3` IDs at each PROBLEM CHANGE
  line).
- `app/briefing/briefing.module.css` — scoped CSS reusing globals.css
  tokens.
- `lib/briefing/derive.ts` — pure derivation functions.
- `lib/briefing/derive.test.ts`
- `app/briefing/components/StatusChip.test.tsx`
- `app/briefing/components/SubSkillCard.test.tsx`
- `app/briefing/components/EvidencePanel.test.tsx`
- `app/briefing/Briefing.test.tsx`
- `vitest.config.ts`
- `vitest.setup.ts` — `import '@testing-library/jest-dom/vitest'` plus
  `expect.extend(toHaveNoViolations)` from `vitest-axe`.
- `eslint.config.mjs` — ESLint 9 flat config: `eslint-config-next`,
  `@typescript-eslint`, `react`, `react-hooks`, `jsx-a11y`,
  `eslint-config-prettier` last (turns off stylistic rules that conflict
  with Prettier).
- `.prettierrc.json` — minimal (2-space, 100 cols, single quotes,
  trailing commas).
- `.prettierignore` — `.next/`, `coverage/`, `node_modules/`.
- `.editorconfig` — UTF-8, LF, 2-space, trim trailing whitespace.
- `DECISIONS.md` — ADR-lite for the interview follow-up: _What_,
  _Audience_, _Product decisions and why_, _Tech decisions and why_
  (Vitest > Jest, no Tailwind, server components default, pure-logic
  split, a11y assertions), _What I'd do next_. Doubles as the
  deliverable writeup.

### Modified

- [package.json](/Users/samchi/Desktop/step-up-tutoring/mastery-tracking-interview/package.json)
  — add test + lint + format deps and scripts: `test`, `test:watch`,
  `test:cov`, `lint`, `format`, `format:check`.
- [lib/types.ts](/Users/samchi/Desktop/step-up-tutoring/mastery-tracking-interview/lib/types.ts)
  _(nice-to-have)_ — additive fields: `confidence?: number` on
  `SubSkillSnapshot`, `affect_note?: string` on `DetailedMasterySession`.
  Keep existing fields intact.
- [lib/generator.ts](/Users/samchi/Desktop/step-up-tutoring/mastery-tracking-interview/lib/generator.ts)
  _(nice-to-have)_ — populate the new fields.

### Untouched

- [lib/store.ts](/Users/samchi/Desktop/step-up-tutoring/mastery-tracking-interview/lib/store.ts),
  [lib/seed.ts](/Users/samchi/Desktop/step-up-tutoring/mastery-tracking-interview/lib/seed.ts),
  [app/layout.tsx](/Users/samchi/Desktop/step-up-tutoring/mastery-tracking-interview/app/layout.tsx),
  `next.config.ts`, `tsconfig.json`, all API routes.

### Note on routing

Using `app/briefing/` (not `app/(briefing)/`) as a plain folder — the
components live inside but are imported into `app/page.tsx`, so the folder
doesn't need to be a route group. `Briefing.tsx` is not exported as a page.

## Pure logic — `lib/briefing/derive.ts`

Framework-free, deterministic, the testable foundation:

- `bucketSubSkills(report: LatestMasteryReport | DetailedMasteryReport): { needsWork: SubSkillSnapshot[]; developing: SubSkillSnapshot[]; secure: SubSkillSnapshot[]; notYetProbed: SubSkillSnapshot[] }`
  — groups the 7 snapshots. "Needs work" = developing with 0 evidence OR a
  misconception flag (if added later). "Developing" = developing with
  evidence. Stable order (sub-skill ID tiebreak).
- `pickPrimaryFocus(report): { subSkill: SubSkillSnapshot; rationale: string } | null`
  — top developing by evidence count; tiebreak by ID; falls back to the
  first not_assessed if nothing is developing; `null` if empty report.
- `formatHeadline(report, focus): string` — "Today: firm up [sub-skill
  name]" style. Deterministic. Handles `focus === null`.
- `orderProblemsCPA(problems: ProblemBankItem[], subSkillId: string): ProblemBankItem[]`
  — filters to the sub-skill, orders concrete → representational →
  abstract → application. Stable on missing types. Empty array if no
  matches.
- `buildWarmup(report, curriculum): ProblemBankItem[]` — wires focus +
  CPA ordering, truncates to 3. Handles "no matching problems" → empty
  array.
- `prioritizedTutorMoves(curriculum, focus): TutorMoves` — MVP is
  passthrough; hook for later filtering.

All functions are pure, no React, no I/O. Named exports.

## Implementation sequence (strict ordering)

### Phase 0 — Setup (~15 min)

1. Install test stack: `npm i -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitest/coverage-v8 vitest-axe`.
2. Install lint/format stack: `npm i -D eslint@^9 eslint-config-next @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y eslint-config-prettier prettier`.
3. Write `vitest.config.ts`: react plugin, `environment: 'jsdom'`, setup
   file, `coverage: { provider: 'v8', include: ['lib/briefing/**', 'app/briefing/**'], reporter: ['text', 'text-summary'] }`.
4. Write `vitest.setup.ts`: jest-dom matchers + vitest-axe
   `expect.extend(toHaveNoViolations)`.
5. Write `eslint.config.mjs` (flat config) pulling in next + ts + react +
   hooks + jsx-a11y, prettier config last.
6. Write `.prettierrc.json`, `.prettierignore`, `.editorconfig`.
7. `package.json` scripts:
   - `"test": "vitest run"`
   - `"test:watch": "vitest"`
   - `"test:cov": "vitest run --coverage"`
   - `"lint": "eslint ."`
   - `"format": "prettier --write ."`
   - `"format:check": "prettier --check ."`
8. Sanity: one trivial test in `lib/briefing/derive.test.ts`, run
   `npm run test` → green. Run `npm run lint` → clean.

### Phase 1 — Pure logic, TEST-FIRST (~20 min)

1. Stub `lib/briefing/derive.ts` with full signatures.
2. Write the full `derive.test.ts` matrix (below). Run red.
3. Implement until all green.

### Phase 2 — Presentational components (~30 min)

1. `StatusChip` + test.
2. `EvidencePanel` + test.
3. `SubSkillCard` (client, expand state) + test with userEvent.
4. `SubSkillMap`, `TodayFocusCard`, `HeaderStrip`, `TutorMovesCard` —
   server components, compose primitives. No individual tests; coverage
   comes through `Briefing.test.tsx`.
5. `TranscriptPanel` — client, `<details>`/`<summary>`, anchors at
   PROBLEM CHANGE lines.

### Phase 3 — Wire-up + full-page test (~15 min)

1. `Briefing.tsx` — composes everything.
2. Replace `app/page.tsx`: server component that calls
   `getDetailedReport(tutorId, studentId)` + `getSeedContext()` from
   [lib/store.ts](/Users/samchi/Desktop/step-up-tutoring/mastery-tracking-interview/lib/store.ts),
   renders `<Briefing ... />`. No fetch, no client state.
3. `Briefing.test.tsx` — mount with a hand-built mock
   `DetailedMasteryReport`; assert headline present, one developing
   sub-skill visible, not_assessed bucket title visible, a tutor-moves
   question visible, transcript summary collapsed.
4. `npm run dev`, load http://localhost:3000, verify visually, console
   clean, narrow-viewport sanity check.

### Phase 4 — Nice-to-haves, time permitting, in priority order

1. **Confidence + affect signals.** Additive fields on
   [lib/types.ts](/Users/samchi/Desktop/step-up-tutoring/mastery-tracking-interview/lib/types.ts)
   - [lib/generator.ts](/Users/samchi/Desktop/step-up-tutoring/mastery-tracking-interview/lib/generator.ts);
     render a subtle "AI certainty" indicator on each `SubSkillCard` and
     affect note on `HeaderStrip`. One new derive test.
2. **Evidence → transcript deep-link.** `EvidencePanel` quote becomes
   `<a href="#problem-p1">`; `TranscriptPanel` assigns IDs at each
   PROBLEM CHANGE line. _Note: only p1/p2/p3 exist in the transcript —
   p4 is in the bank but wasn't worked in the session._
3. **"Copy plan to clipboard"** button on `TodayFocusCard` — client,
   dumps plain text.
4. **"What changed since last session"** — only if real time left;
   requires a fabricated prior report.

### Hard stops

- **75 min:** MVP must be rendering end-to-end or cut scope.
- **100 min:** stop adding features; only bug-fix, polish, and write
  deliverable.

## Test matrix

Coverage target: **>80% on `lib/briefing/**`and`app/briefing/**`**,
scoped via `coverage.include`.

### `lib/briefing/derive.test.ts`

- `bucketSubSkills`: seeded-report shape → correct split; all-secure
  edge; all-`not_assessed` edge; stable ordering by ID.
- `pickPrimaryFocus`: picks highest-evidence developing; tiebreak by ID;
  falls back to first `not_assessed` when none developing; `null` on
  empty.
- `formatHeadline`: non-empty, mentions focus sub-skill name;
  deterministic; handles `focus === null`.
- `orderProblemsCPA`: CPA order honored across full 4-type ladder;
  sub-skill with no problems → `[]`; missing types handled without
  throwing.
- `buildWarmup`: returns ≤3; `[]` when focus sub-skill has no problems.
- `prioritizedTutorMoves`: passthrough shape (MVP).

### Component tests

- `StatusChip.test.tsx`: renders correct label + `aria-label` for each
  of 3 statuses.
- `SubSkillCard.test.tsx`: shows name / status / evidence count; evidence
  hidden by default; clicking expand (userEvent) reveals evidence quote.
- `EvidencePanel.test.tsx`: renders quote text + note; link has `href`
  matching `^#problem-`.
- `Briefing.test.tsx`: mount with a mock `DetailedMasteryReport` →
  assert headline text, at least one developing sub-skill card, the
  "Haven't probed yet" bucket title, at least one tutor-moves question,
  transcript `<summary>` present + detail collapsed. **Also**:
  `expect(await axe(container)).toHaveNoViolations()` from `vitest-axe`
  — the distinctive a11y signal.

### Testing discipline

- Query by role/label/text, not className.
- No snapshots.
- No mocks beyond what's strictly needed (userEvent clicks only).
- Tests speak in tutor language.

## Verification (all must pass before "done")

1. `npm run typecheck` → clean; no `any`; no ts-ignore.
2. `npm run lint` → clean, no disables.
3. `npm run format:check` → clean (run `npm run format` once before
   this step to normalize).
4. `npm run test:cov` → all pass; authored-file coverage ≥80%; the
   vitest-axe a11y assertion in `Briefing.test.tsx` passes. Capture
   the summary table.
5. `npm run dev` → open http://localhost:3000, confirm:
   - Header strip shows student + cluster + headline.
   - Today's focus card shows the primary sub-skill and ≤3 warm-up
     problems.
   - All 7 sub-skills rendered, grouped by bucket, `not_assessed` bucket
     visible.
   - Expand on at least one `SubSkillCard` reveals evidence.
   - Tutor moves visible.
   - Transcript `<details>` present, collapsed by default.
   - No console errors/warnings.
6. Narrow viewport (~375px) → layout does not break.

## Deliverable writeup (end of build)

Authored as `DECISIONS.md` in the repo root so reviewers can read it
alongside the code. Sections:

1. **What** — one paragraph describing the pre-session briefing.
2. **Audience** — the novice volunteer tutor, 60-second pre-flight read.
3. **Product decisions and why** — 5–8 bullets, framed for the interview
   follow-up call. Cover the 5 decisions plus the "not_assessed as a
   first-class bucket" insight and the CPA-ordered warm-up reasoning.
4. **Tech decisions and why** — Vitest > Jest, no Tailwind, server
   components default, pure-logic split in `lib/briefing/`, vitest-axe
   a11y assertion, ESLint flat config.
5. **Build summary + what was cut for time.**
6. **What I'd do next with another 2 hours** — honest, specific.
7. **Coverage table** — paste the `npm run test:cov` summary showing
   ≥80% on authored files.
