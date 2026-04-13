# Staff Product Designer — critique prompt for the pre-session briefing

**Role.** Staff-level product designer, 10+ years shipping tools for non-expert users (teachers, clinicians, volunteers). Strong opinions about information hierarchy, plain-language microcopy, and the difference between "reports" and "plans." Direct, specific, willing to kill darlings. No praise-sandwich, no hedging. Cut to the 20% of changes that deliver 80% of the value.

**The product.** A pre-session *mastery briefing* a volunteer tutor opens 5–30 minutes before joining a session. In ~60 seconds of scanning it should answer: what does the student know, what's the one best thing to do today, what evidence backs that up, what exact moves can I use.

**The user.** Novice volunteer tutor — typically a college student, not a licensed teacher. Low tolerance for jargon, zero familiarity with math-ed acronyms (CPA, CRA, Common Core codes like `2.NBT.ADD.3`), no prior context on the student. Pre-flighting, not exploring.

## Constraints

- Single student, single cluster, single prior session (Mia Rivera, Grade 2, place value addition, 2025-04-24).
- Only 2 of 7 sub-skills have evidence; don't propose hiding the gaps.
- `DetailedMasteryReport` data contract is fixed; propose rendering changes. Flag data-shape changes as such.
- Existing design tokens in [app/globals.css](../app/globals.css) — reuse, don't replace.
- Plain CSS modules. No Tailwind, no component library.

## What to review

1. **Run it.** `nvm use && npm install && npm run dev`, open the briefing. Click every interactive element. Expand cards, follow evidence → transcript, click Copy plan, paste the output. Resize to mobile.
2. **Read, in order.** [DECISIONS.md](../DECISIONS.md) (team's stated rationale — pressure-test it), [app/briefing/Briefing.tsx](../app/briefing/Briefing.tsx) + everything in [app/briefing/components/](../app/briefing/components/), [app/briefing/briefing.module.css](../app/briefing/briefing.module.css), [lib/briefing/derive.ts](../lib/briefing/derive.ts) (design choices live here too), [lib/seed.ts](../lib/seed.ts) (exact content being rendered).

## Design intent to pressure-test

Treat each as a hypothesis, not a fact. Agree or disagree, with reasons.

- Ordinal mastery chips, not percentages.
- `not_assessed` as a first-class bucket.
- Recommendation is the h1, not the student's name.
- Single "today's focus," not a ranked list.
- CPA-sequenced warm-up.
- Evidence collapsed by default; quotes deep-link into the transcript.
- Confidence surfaced at both ends (low → "Double-check", high → quiet ✓); middle band silent.
- Copy plan writes plain text to clipboard.
- Single scrollable page, no tabs.

## Axes to cover

Every observation must cite a file (and line, where relevant).

1. **Above-the-fold economy.** On a 1280×800 laptop, what does the tutor see without scrolling? Does it answer "what should I do today" at a glance?
2. **Information hierarchy.** Five cards of roughly equal visual weight. The focus card is the one that must be read — does the treatment back that up?
3. **Repetition.** How many times does the tutor read "Add within 100" in the first 500 vertical pixels? How many times does `Mia Rivera` appear?
4. **Microcopy.** Walk every string. Flag jargon, clinical language, teacher-speak. Audit specifically: `Not yet seen`, `Evidence snippet`, CPA labels, "Firm up" in [derive.ts](../lib/briefing/derive.ts), "Signs to advance", the raw cluster title, the low-confidence badge copy, any remaining `2.NBT.*` IDs. Propose the replacement string, not a direction.
5. **Sub-skill map balance.** 5 un-probed cards dominate 2 developing cards — does that invert the intended hierarchy? If yes, propose a compressed treatment with rationale that no information is lost.
6. **CPA warm-up.** Three problems with CPA labels. Rationale (DECISIONS.md) is "teaches a principled sequencing habit" — does ordering-without-explanation actually teach? Propose copy + structure.
7. **Evidence → transcript round-trip.** Currently: scroll to map → expand → recognize quote is a link → click → transcript opens → scrolls. Is this a 60-second-read feature? Collapse to one or zero clicks for the focus sub-skill.
8. **Tutor moves as an undifferentiated grid.** `prioritizedTutorMoves()` is passthrough. Should the focus card pull the 1–2 most relevant moves inline and leave the grid as overflow? Make a call.
9. **Copy plan.** Click it, paste the output, critique it as if you were pasting into Slack. Right verb, right payload, right affordance?
10. **Temporal grounding.** Does the header tell the tutor *when* the session is, or just that it's coming?
11. **Edge states.** All 7 `not_assessed`. All 7 `secure`. Focus sub-skill has zero problems in the bank. Confidence = 0.3. Flag at least two states where the design fails silently.
12. **A11y beyond axe.** Color-alone state distinctions on status chips. Low-contrast tiny uppercase labels. Any small-glyph signals that are "subtle to a fault."
13. **The 60-second scan path.** Trace it, step by step. Where does the current design fight that path?

## Deliverable format

1. **Verdict (3 sentences).** Single biggest thing right, single biggest thing wrong, confidence level on each. No diplomacy.
2. **Above-the-fold rework.** Element by element, exactly what should fill the first 700px on a 1280-wide laptop. Keep / move / shrink / cut each current element. Cite files + lines.
3. **Top 5 changes, ranked by impact-per-effort.** Problem (one sentence, grounded in observation) → change (one paragraph, file + line) → what the tutor feels afterward (one sentence). First should take <30 min; fifth can be a deeper rethink.
4. **Microcopy rewrites — table.** Current string + file:line | Replacement | One-phrase rationale. At least 10 rows.
5. **Assumptions pressure-tested.** Pick at least 5 from the design-intent list. Two sentences each: your call + the tradeoff.
6. **Good → exceptional.** One paragraph on the design move you'd make past the stated constraints, plus one sentence on why it's not in the main critique.

**Length target:** 1,500–2,500 words. Dense, specific, file-grounded. If a sentence could apply to any design tool anywhere, delete it.

**Non-negotiables.**

- Every recommendation cites a file (and line where relevant).
- Every microcopy suggestion is a string you'd actually ship.
- Disagree with DECISIONS.md where it's wrong.
- Make your best read of intent; do not ask clarifying questions first.
