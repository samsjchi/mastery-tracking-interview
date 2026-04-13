# Pre-session mastery briefing

Tutor-facing briefing. **60 seconds of scanning** must answer: what's shaky, what to do today, why (evidence), what exact moves to use. Audience: novice volunteer tutor — college student, not a licensed teacher. Plain language over jargon, one recommendation over a dashboard, gaps surfaced as planning prompts.

## Product

### Recommendation is the h1, not the student's name

[HeaderStrip.tsx](app/briefing/components/HeaderStrip.tsx) renders the generated recommendation (`"Today: help Mia get solid on adding 2-digit numbers by place value."`) as `<h1>`; student name + grade + session time are demoted to a utility bar. Tutors already know who they're meeting — making that the h1 wastes the most valuable line on the page. Header is ~150px so the focus card closes above the fold at 1280×800.

### Plain-English copy, not math-ed jargon

Every string rewritten for a student volunteer. Highest-leverage swaps:

- Raw Common Core cluster → `"adding 2-digit numbers by place value"` via `PLAIN_CLUSTER_NAME` in [derive.ts](lib/briefing/derive.ts).
- CPA labels → `With blocks / With a drawing / Numbers only / Word problem`. Ordering still teaches CPA; the letters don't.
- Evidence notes converted from analyzer-speak (`"Starter output notices a likely place value misconception"`) to tutor-speak (`"Classic place-value slip — treated the digits as one number."`).
- Sub-skill IDs unrendered. Bucket descriptions deleted.

### Focus card owns the full plan

[TodayFocusCard.tsx](app/briefing/components/TodayFocusCard.tsx), top to bottom: rationale → two inline evidence quotes (zero-click trust-but-verify) → three inline moves (`Watch for:` / `Ask:` / `Try:`) → numbered warm-up with plain labels → Copy plan. The sub-skill map below re-renders the focus's evidence inline so a tutor can deep-link from either surface.

### Confidence surfaced at both ends, not just the low

`describeConfidence` in [derive.ts](lib/briefing/derive.ts) returns `{ level: 'low' | 'high' } | null`. Below 0.65 → amber `Double-check` pill. ≥0.85 → a quiet `✓` next to the chip. Middle band silent. Silencing only the low end trained tutors to distrust Secure chips; the seed tunes ADD.3 to 0.55 and ADD.7 to 0.9 so the demo exercises both.

### Compress, don't hide

`not_assessed` stays a first-class planning prompt but renders as a bulleted list of sub-skill names, not five identical grey cards that would drown the two buckets that matter. All names visible by default.

### One focus, student-agnostic rationale

`pickPrimaryFocus`: needs-work → highest-evidence developing → first `not_assessed`; tiebreak by ID. The rationale doesn't name the student — the h1 already does. Novice tutors hold one priority, not five.

## Tech

- **Pure [lib/briefing/derive.ts](lib/briefing/derive.ts).** Every derivation (buckets, focus, headline, CPA ordering, plain cluster name, plan-text, confidence, session-when formatting) is a plain function — no React, no I/O. Cheap tests; server components pre-bake strings and pass them to tiny client islands.
- **Server components default; client islands for specific reasons.** `CopyPlanButton` needs `navigator.clipboard`; `SubSkillCard` holds local expand state; `TranscriptPanel` listens for `hashchange`, opens the `<details>`, scrolls, and moves keyboard focus on deep-link (with `suppressHydrationWarning` because Chrome auto-expands on fragment before React hydrates).
- **Additive-optional mock extensions.** `transcript_anchor?`, `confidence?`, `kind?`, `estimated_minutes?`. UI features silently no-op when the analyzer doesn't emit the field — how a production rollout of a new signal should behave.
- **Vitest + RTL + `vitest-axe`.** `toHaveNoViolations()` caught a real regression (an `<h3>` inside `<summary>` when collapsing a bucket).
- **Pure CSS module, no Tailwind.** `globals.css` already has the token system; Tailwind would fight it for no payoff.
