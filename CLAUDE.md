# CLAUDE.md — Pre-Session Mastery Briefing

## Context

Tutor-facing briefing for a novice volunteer tutor (college student, not a licensed teacher). Plain language over jargon. One headline recommendation beats five. Surface uncertainty as a planning prompt, not a decoration.

[DECISIONS.md](DECISIONS.md) captures non-obvious product + tech calls and their rationale — keep it in sync with anything surprising you ship.

## Project architecture

### Pure-logic layer is sacred
- All bucketing, selection, ordering, formatting, and plan-text generation lives in [lib/briefing/derive.ts](lib/briefing/derive.ts) as plain functions — **no React, no I/O, no side effects**.
- This is why the tests are cheap and why server components can pass pre-built strings to tiny client islands. Do not pull logic into components.
- If a new feature needs a pure function, add it to `derive.ts` first, test it, then wire the UI.

### Type extensions must be additive
- New fields on `SubSkillSnapshot`, `EvidenceQuote`, `DetailedMasteryReport`, `DetailedMasterySession` go in as **optional**. Older callers keep working; newer UI silently no-ops when the analyzer doesn't emit the field. That's how real production rollouts of new signals should behave.

### Surface-when-uncertain, not show-everything
- Helpers like `describeConfidence()` return `null` when there's nothing worth saying, so call sites stay free of conditionals. Silence is a feature — don't bolt a badge onto every card.
- `LOW_CONFIDENCE_THRESHOLD` is the single source of truth; tests and UI share one number.

### Novice-tutor framing drives product calls
- Ordinal chips (`secure` / `developing` / `not yet probed`) over continuous percentages — n=1 session can't support statistical rigor.
- `not_assessed` is a first-class bucket, not hidden.
- One "today's focus" recommendation with a rationale, not a dashboard.
- CPA ordering (concrete → representational → abstract → application) for warm-ups — teaches a principled habit, not "here are three problems."
- Evidence deep-links back to the transcript and **actually works** (opens collapsed `<details>`, scrolls, moves keyboard focus).

## Testing

- **Vitest 4 + RTL + `vitest-axe`**, not Jest.
- Tests speak in **tutor language, not implementation language**: `getByRole` / `getByLabelText`, never className. Assert behavior ("clicking expand reveals the evidence"), not DOM shape.
- Integration test asserts `toHaveNoViolations()` — a11y is not an afterthought.
- Most coverage comes from `derive.ts` pure functions because it's cheap. Component tests cover the handful of interactions that matter.
- Coverage ≥80% enforced in [vitest.config.ts](vitest.config.ts). If the bar moves down, explain why in DECISIONS.md.
- When fighting the test harness (e.g. fake timers deadlocking RTL polling), drop to real timers + `fireEvent`. Test the behavior you care about; don't out-clever the harness.

## Accessibility is non-negotiable

- Skip link to `#main-content` (visually hidden until focused).
- Explicit `:focus-visible` rings on every interactive element.
- Deep-links move keyboard focus (`tabindex=-1` + `.focus()`), not just scroll.
- A volunteer tutor on a mouseless laptop between sessions has to feel first-class. If a change breaks keyboard nav, it regresses the product.

## Workflow

- **Plan before anything non-trivial.** Enter plan mode for tasks with 3+ steps or a product/architecture call. Re-plan when reality diverges.
- **Offload exploration to subagents.** Use `Explore` for grep-heavy research, `Plan` or `feature-dev:code-architect` for broader architectural thinking. One focused question per subagent. Don't duplicate searches the subagent is already running.
- **Verify before "done".** `npm run typecheck && npm run lint && npm run test` all green. For UI, open the browser and exercise the golden path + one edge case. Type checking proves code correctness, not feature correctness — if you can't exercise the feature, say so plainly.
- **Diagnose root cause.** When handed an error, log, or failing test: fix it. Don't retry the same action hoping for a different result.

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
4. Re-read your diff as a reviewer. If anything would get a "why?" from a staff engineer, fix it or defend it in DECISIONS.md.
