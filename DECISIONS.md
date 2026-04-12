# Pre-session mastery briefing

A tutor-facing briefing for Grade 2 Mia Rivera and her tutor. **60 seconds of scanning** should answer: what's shaky, what to do today, why (evidence), what exact moves to use. Audience: **novice volunteer tutor** — college student, not a licensed teacher. Plain language over jargon, one recommendation over a wall of metrics, gaps surfaced as planning prompts (not hidden).

## Product

### Recommendation IS the h1, not the student's name

[HeaderStrip.tsx](app/briefing/components/HeaderStrip.tsx) renders the generated sentence as `<h1>` (`"Today: help Mia get solid on adding 2-digit numbers by place value."`). Utility bar above is metadata; `Last time:` block below is affect context. An earlier draft made `Mia Rivera · Grade 2` the h1 — wrong; tutors already know who they're meeting. Header is ~150px flush to the page so the focus card closes above the fold at 1280×800.

### Plain-English copy, not math-ed jargon

Every string pass-rewritten for a 19-year-old volunteer. Highest-leverage swaps: raw Common Core cluster `"Use place value understanding and properties of operations to add and subtract"` → `"adding 2-digit numbers by place value"` via a `PLAIN_CLUSTER_NAME` map in [derive.ts](lib/briefing/derive.ts); CPA labels → `With blocks / With a drawing / Numbers only / Word problem` (the ordering is still the pedagogy; the letters aren't); evidence notes from analyzer-speak to tutor-speak (`"Starter output notices a likely place value misconception"` → `"Classic place-value slip — treated the digits as one number."`). Sub-skill IDs unrendered. Bucket descriptions deleted.

### Focus card owns the full plan

[TodayFocusCard.tsx](app/briefing/components/TodayFocusCard.tsx), top to bottom: rationale → top 2 evidence quotes inline (zero-click "trust but verify" for the primary focus) → 3 inline moves (`Watch for:` / `Ask:` / `Try:`) → 3 numbered warm-up problems with plain-English labels → Copy plan. The sub-skill map below renders the focus sub-skill as a header-only card with a `"See the focus card above"` caption, avoiding a straight duplicate while keeping bucket counts honest.

### Confidence surfaced at BOTH ends, not just the low

`describeConfidence` in [derive.ts](lib/briefing/derive.ts) returns `{ level: 'low' | 'high' } | null`. Below 0.65 → an amber `Double-check` pill next to the status chip. At/above 0.85 → a quiet `✓` glyph next to the chip. Middle band silent. The old "silence above threshold" pattern trained tutors to distrust Secure chips. The seed generator tunes ADD.3 to 0.55 and ADD.7 to 0.9 so the demo exercises both ends.

### Compress, don't hide

The `not_assessed` bucket stays a first-class planning prompt but renders as a single compact block with a bulleted list of sub-skill names — not five identical grey cards that would drown the two buckets actually worth reading. All names visible by default.

### One focus, student-agnostic rationale

`pickPrimaryFocus` picks one sub-skill (needs-work → highest-evidence developing → first not_assessed; tiebreak by ID). The rationale string doesn't name the student — the h1 already does, and a third mention reads as repetition. Novice tutors can hold one priority in their head, not five.

## Tech

- **Pure [lib/briefing/derive.ts](lib/briefing/derive.ts).** Every derivation (buckets, focus, headline, CPA ordering, plain cluster name, top moves, relative-time formatting, plan-text, confidence, latest affect) is a plain function with no React and no I/O. Drives cheap tests and lets the server component pre-bake the copy-plan string and pass it as a prop to a tiny client island.
- **Server components default; two client islands with specific reasons.** `CopyPlanButton` needs `navigator.clipboard`. `TranscriptPanel` listens for `hashchange`, opens the `<details>`, scrolls + focuses the anchor on a deep-link — and carries `suppressHydrationWarning` on the `<details>` because Chrome's native auto-expand-on-fragment fires before React hydrates.
- **Additive-optional mock extensions.** `transcript_anchor?`, `confidence?`, `affect_note?`, and a `sub_skills` field on `DetailedMasteryReport` — all optional. UI features silently no-op when the analyzer doesn't emit the field. This is how a production rollout of a new signal should behave.
- **Vitest + RTL + `vitest-axe`.** `toHaveNoViolations()` caught a real regression (keeping `<h3>` inside `<summary>` when collapsing the "Haven't seen yet" bucket).
- **Pure CSS module, no Tailwind.** The existing `globals.css` already has the token system; Tailwind would fight it for no visible payoff.
