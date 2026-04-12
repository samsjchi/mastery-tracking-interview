# CLAUDE.md — Mastery Tracking Interview

## Context: this is a graded, time-boxed interview

A ~2 hour take-home for Step Up Tutoring. Rubric: **code quality, product
thinking, execution speed, use of tools**. Every decision should defend itself
against all four — not just one. DECISIONS.md is the artifact the reviewer
reads alongside the diff; keep it in sync with anything non-obvious you ship.

**Audience of the product:** novice volunteer tutors (college students, not
licensed teachers). Plain language over jargon. One headline recommendation
beats five. Surface uncertainty as a planning prompt, not a decoration.

## Workflow orchestration

### 1. Plan before building anything non-trivial
- Enter plan mode for any task with 3+ steps or a product/architecture call.
- Re-plan the moment reality diverges from the plan — don't keep pushing a
  broken approach.
- Plan mode is also for *verification* (what would make me believe this works?),
  not just construction.

### 2. Use subagents liberally to protect main context
- Offload exploration, grep-heavy research, and parallel analysis to the
  `Explore` subagent. One focused question per subagent.
- For broader product/architecture thinking, use `feature-dev:code-architect`
  or `Plan`. Don't duplicate searches the subagent is already running.
- When the main context is filling with raw file dumps, that's a signal —
  delegate the next read to a subagent that returns a summary.

### 3. Verification before "done"
- Never mark a task complete without proving behavior. Run `npm run test`,
  `npm run typecheck`, `npm run lint`. For UI, open it in the browser and
  exercise the golden path + one edge case.
- Ask: "would a staff engineer approve this?" before handing back.
- Type checking proves code correctness, not feature correctness. If you
  can't actually exercise the feature, say so plainly.

### 4. Demand elegance on non-trivial changes (balanced)
- Pause on anything beyond a one-liner: "is there a simpler shape?"
- If a fix feels hacky, re-implement it properly before moving on. Skip
  this ceremony for obvious fixes — don't over-engineer.
- Three similar lines beats a premature abstraction.

### 5. Autonomous bug fixing
- When handed an error, log, or failing test: diagnose and fix. Don't ask
  for hand-holding on things you can read yourself.
- Diagnose root cause before switching tactics; don't retry the same action
  hoping for a different result.

### 6. Self-correction
- When the user corrects you, add the rule to memory via the auto-memory
  system (feedback type) so future sessions don't repeat the mistake.
- Also save quiet *confirmations* of non-obvious calls — they're easy to
  miss but keep you from drifting away from validated approaches.

## Project architecture (load-bearing rules)

### Pure-logic layer is sacred
- All bucketing, selection, ordering, formatting, and plan-text generation
  lives in [lib/briefing/derive.ts](lib/briefing/derive.ts) as plain
  functions — **no React, no I/O, no side effects**.
- This is why the tests are cheap and why server components can pass
  pre-built strings to tiny client islands. Do not pull logic into
  components.
- If a new feature needs a pure function, add it to `derive.ts` first,
  test it, then wire the UI.

### Server components by default
- `"use client"` only when the component genuinely needs browser APIs or
  local state. Current client islands: `SubSkillCard` (expand state),
  `CopyPlanButton` (`navigator.clipboard`), `TranscriptPanel` (hash-sync +
  focus management). Everything else is a server component.
- Prefer calling `getDetailedReport()` directly from server components over
  HTTP-fetching the local API route. Cheaper, no network hop against
  localhost, no port assumptions.

### Type extensions must be additive
- New fields on `SubSkillSnapshot`, `EvidenceQuote`, `DetailedMasteryReport`,
  `DetailedMasterySession` go in as **optional**. Older callers keep working;
  newer UI silently no-ops when the analyzer doesn't emit the field. That's
  how real production rollouts of new signals should behave.

### Surface-when-uncertain, not show-everything
- Helpers like `describeConfidence()` return `null` when there's nothing
  worth saying, so call sites stay free of conditionals. "Silence is a
  feature" — don't bolt a badge onto every card.
- `LOW_CONFIDENCE_THRESHOLD` is the single source of truth; tests and UI
  share one number.

### Novice-tutor framing drives product calls
- Ordinal chips (`secure` / `developing` / `not yet probed`) over continuous
  percentages — n=1 session can't support statistical rigor.
- `not_assessed` is a first-class bucket, not hidden.
- One "today's focus" recommendation with a rationale, not a dashboard.
- CPA ordering (concrete → representational → abstract → application) for
  warm-ups — teaches a principled habit, not "here are three problems."
- Evidence deep-links back to the transcript and **actually works** (opens
  collapsed `<details>`, scrolls, moves keyboard focus).

## Testing philosophy

- **Vitest 4 + RTL + `vitest-axe`**, not Jest. Config is one file.
- Tests speak in **tutor language, not implementation language**: `getByRole`
  / `getByLabelText`, never className. Assert behavior ("clicking expand
  reveals the evidence"), not DOM shape.
- Integration test asserts `toHaveNoViolations()` — the a11y signal is part
  of the rubric, not an afterthought.
- Most coverage comes from `derive.ts` pure functions because it's cheap.
  Component tests cover the handful of interactions that matter.
- Coverage thresholds are enforced at ≥80% in [vitest.config.ts](vitest.config.ts).
  If the bar moves down, explain why in DECISIONS.md.
- When fighting the test harness (e.g. fake timers deadlocking RTL polling),
  drop to the simpler real-timer + `fireEvent` path. Test the behavior you
  actually care about, don't out-clever the harness.

## Accessibility is non-negotiable

- Skip link to `#main-content` (visually hidden until focused).
- Explicit `:focus-visible` rings on every interactive element.
- Deep-links move keyboard focus (`tabindex=-1` + `.focus()`), not just scroll.
- A volunteer tutor on a mouseless laptop between sessions has to feel
  first-class. If a change breaks keyboard nav, it regresses the product.

## Commands

```bash
nvm use                 # Node 20 via .nvmrc
npm install
npm run dev             # http://localhost:3000
npm run typecheck
npm run lint
npm run test            # Vitest run, ~1.2s
npm run test:cov        # with coverage, thresholds enforced
npm run format:check
```

## Before handing work back

1. `npm run typecheck && npm run lint && npm run test` — all green.
2. Exercise the change in the browser for UI work.
3. Update DECISIONS.md if you made a non-obvious call (why > what).
4. Re-read your diff as a reviewer. If anything would get a "why?" from a
   staff engineer, either fix it or defend it in DECISIONS.md.
