# Pre-session mastery briefing — build plan

## Scope

Take-home for Step Up Tutoring, 90–120 min. Replace the landing page with a pre-session briefing a novice volunteer tutor opens right before a session. In a 60-second read it must answer:

1. What does this student know, and what's shaky?
2. What's the single best thing I should do today?
3. What evidence backs that up?
4. What exact moves (questions, scaffolds, problems) can I use?

## Fixed data

One seeded scenario: tutor Sasha Patel, student Mia Rivera (Grade 2), session `2025-04-24`. One cluster ("place value addition"), 7 sub-skills. Evidence hardcoded for 2 of them — `2.NBT.ADD.3` (developing, 2 quotes) and `2.NBT.ADD.7` (developing, 1 quote); other 5 are `not_assessed`. Problem bank has 4 items, all on ADD.3, across the CPA ladder. Transcript has `[PROBLEM CHANGE: pN]` markers (p1/p2/p3 only; p4 wasn't worked). **This is the mock contract — do not "fix" the gaps.**

## Constraints

No backend, no new frameworks, plain CSS reusing existing tokens (`--brand`, `--surface`, `--surface-muted`, `--border`, `--text`, `--text-muted`, `--brand-soft`, `--shadow`), TypeScript strict, tests ≥80% coverage on authored files.

## Product decisions

1. Ordinal mastery chip (`not_assessed` / `developing` / `secure`), not percentages. One session can't support statistical precision.
2. `not_assessed` is first-class — coverage gaps visible, not hidden.
3. Single scrollable page, top-down: header → focus card → sub-skill map → tutor moves → transcript. Not tabs.
4. Transcript collapsed by default; evidence quotes deep-link to anchors inside it.

## Phases

- **Phase 0 (~15 min).** Install Vitest + RTL + vitest-axe + v8 coverage; ESLint flat config + Prettier + editorconfig; `test` / `test:watch` / `test:cov` / `lint` / `format` scripts.
- **Phase 1 (~20 min).** Pure logic in [lib/briefing/derive.ts](../lib/briefing/derive.ts), test-first: `bucketSubSkills`, `pickPrimaryFocus`, `formatHeadline`, `orderProblemsCPA`, `buildWarmup`, `prioritizedTutorMoves`.
- **Phase 2 (~30 min).** Components: `StatusChip`, `EvidencePanel`, `SubSkillCard` (client, expand), `SubSkillMap`, `TodayFocusCard`, `HeaderStrip`, `TutorMovesCard`, `TranscriptPanel` (client, deep-link).
- **Phase 3 (~15 min).** `Briefing.tsx` composes the page; `app/page.tsx` calls `getDetailedReport()` directly (no localhost round-trip). `Briefing.test.tsx` covers top-level shape + `toHaveNoViolations()`.
- **Phase 4 (if time).** Confidence + affect signals, evidence → transcript deep-link, Copy plan, "what changed since last session".

## Hard stops

- **75 min:** MVP rendering end-to-end or cut scope.
- **100 min:** stop adding features; only bug-fix + polish + DECISIONS.md.

## Verification before "done"

`npm run typecheck && npm run lint && npm run test:cov`, then open the briefing and walk the golden path (expand a sub-skill card, follow an evidence quote, open the transcript, Copy plan) plus a narrow-viewport check.
