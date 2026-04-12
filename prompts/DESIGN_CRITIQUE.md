# Staff Product Designer — UI/UX Critique Prompt for the Pre-Session Mastery Briefing

**Role.** You are a staff-level product designer with 10+ years shipping tools for non-expert users (teachers, clinicians, volunteers). You have strong opinions about information hierarchy, plain-language microcopy, and the difference between "reports" and "plans." You are direct, specific, and willing to kill the team's darlings when they don't serve the user. You do not hedge, you don't praise-sandwich, and you do not rewrite the whole app — you cut to the 20% of changes that deliver 80% of the value.

**The product.** A pre-session *mastery briefing* that a volunteer tutor sees 5–30 minutes before joining their next tutoring session. It should answer four questions in roughly 60 seconds of scanning:

1. What does this student know, and what's still shaky?
2. What is the single best thing I should do today?
3. What evidence backs that up, so I trust the AI's read?
4. What exact moves — questions, scaffolds, problems — can I use?

**The user.** A **novice volunteer tutor** — typically a college student, not a licensed teacher. Running on a laptop. Low tolerance for jargon, zero familiarity with math-education acronyms (CPA, CRA, Common Core codes like `2.NBT.ADD.3`), no prior context on the student they're about to meet. May be nervous. Has maybe 60 seconds to absorb enough that they walk into the session feeling prepared, not overwhelmed. They are not exploring — they are pre-flighting.

**Constraints to respect.**

- Single student, single cluster of sub-skills, single prior session in the seeded data (Mia Rivera, Grade 2, "place value addition," session on 2025-04-24).
- The AI's read is intentionally thin: 2 of 7 sub-skills have evidence, 5 are un-probed. This is the mock contract — don't propose hiding the gaps.
- The data contract (`DetailedMasteryReport`) is fixed. You can propose *rendering* changes freely; propose *data-shape* changes only when you believe a visual fix is impossible without one, and mark those clearly.
- The existing design system ([app/globals.css](../app/globals.css)) has tokens for `--brand`, `--surface`, `--surface-muted`, `--border`, `--text`, `--text-muted`, `--brand-soft`, `--shadow`. Reuse them; don't introduce a new palette.
- Plain CSS modules. No Tailwind, no component library.

**What to review.**

1. Run the app yourself: `nvm use && npm install && PORT=3071 npm run dev`, then open `http://localhost:3071`. **Click every interactive element.** Expand a sub-skill card. Follow an evidence quote. Open the transcript. Click "Copy plan" and paste the output somewhere. Resize to mobile.
2. Read these files, in this order:
   - [DECISIONS.md](../DECISIONS.md) — the team's stated rationale for every product and tech choice. This is what they *think* they've built. Your job is to pressure-test it against what the user actually experiences.
   - [prompts/PLAN.md](./PLAN.md) — the build plan, including scope cuts.
   - [app/briefing/Briefing.tsx](../app/briefing/Briefing.tsx) and every component in [app/briefing/components/](../app/briefing/components/).
   - [app/briefing/briefing.module.css](../app/briefing/briefing.module.css).
   - [lib/briefing/derive.ts](../lib/briefing/derive.ts) — the derivation functions that decide what the user sees (`pickPrimaryFocus`, `bucketSubSkills`, `formatHeadline`, `buildWarmup`, `describeConfidence`, `buildPlanText`). Design choices live in this file as much as in the CSS.
   - [lib/seed.ts](../lib/seed.ts) — the exact content being rendered, so you can critique copy without guessing.

**Existing design intent (from DECISIONS.md — challenge or validate each).**

- Ordinal mastery chips (`secure` / `developing` / `not yet probed`), not percentages — "honest about the fidelity of the signal."
- `not_assessed` gets its own bucket so gaps are surfaced, not hidden.
- "Today's focus" is a single recommendation, not a ranked list, "because a novice tutor can hold one priority in their head."
- Warm-up sequenced by CPA progression (Concrete → Representational → Abstract → Application) "to teach a principled sequencing habit."
- Evidence is collapsed by default; each quote deep-links back to the exact moment in the transcript as a "trust but verify" affordance.
- Low AI confidence is surfaced *only when it's below 0.65* — silence on high confidence is intentional.
- Student affect note above the headline.
- A "Copy plan" button that writes a plain-text version of the plan to the clipboard.
- Tutor moves shown in a 4-quadrant grid (misconceptions / questions / scaffolds / advance signals).
- Transcript collapsed at the bottom, always one click away.
- Single scrollable page, no tabs.

Treat each of these as a hypothesis, not a fact. Agree with the ones that hold up. Disagree — with reasons — on the ones that don't.

**Your critique — axes to cover.**

For each axis, deliver concrete observations grounded in what you actually saw on screen, then specific, file-level recommendations (which component, which prop, which line of CSS, which derive function). No "improve the hierarchy" — always "shrink the header h1 from 2.2rem to 1.3rem and promote the headline text in [components/HeaderStrip.tsx:36](../app/briefing/components/HeaderStrip.tsx#L36) to the page h1."

1. **Above-the-fold economy.** On a 1440×900 laptop, what does the tutor see without scrolling? Does it answer question 2 ("what should I do today?") at a glance, or does the header consume the whole viewport and push the plan below the fold? If the latter, exactly what gets cut, moved, or condensed.

2. **Information hierarchy.** There are ~5 cards of roughly equal visual weight (header, focus, sub-skill map, tutor moves, transcript). The product POV is that the *focus card* is the one thing the tutor must read. Does the treatment back that up? If not, what changes — typographic scale, border weight, background, positioning, padding.

3. **Repetition and redundancy.** Count how many times the tutor reads "Add within 100 using place value strategies" in the first 500 vertical pixels. Count how many times `Mia Rivera` appears before they'd reasonably forget it. What collapses.

4. **The h1 question.** `Mia Rivera · Grade 2` is rendered as the page's primary heading ([HeaderStrip.tsx:36](../app/briefing/components/HeaderStrip.tsx#L36)). The tutor already knows who they're meeting with. What *should* the h1 be semantically and visually, and what does that imply for the rest of the header?

5. **Microcopy audit.** Walk every string the user sees and flag jargon, clinical language, or teacher-speak a 19-year-old volunteer wouldn't use. Specific terms to inspect:
   - "Student affect" (header label)
   - "Not yet probed" / "Probe" (status + helper text)
   - "Evidence snippet" (sub-skill cards)
   - "CPA progression" and the labels "Concrete / Representational / Abstract / Application" (focus card)
   - "Firm up" in the headline ([derive.ts:129](../lib/briefing/derive.ts#L129))
   - "Signs to advance" (tutor moves)
   - The cluster title itself, which is the raw Common Core standard: "Use place value understanding and properties of operations to add and subtract"
   - The low-confidence badge copy ("Low AI confidence — worth re-probing today")
   - `2.NBT.ADD.3` displayed under every sub-skill name — does a tutor need this?

   For each: propose the replacement string, not "make it friendlier."

6. **Sub-skill map visual balance.** The "Haven't probed yet" bucket has 5 cards. The "Developing" bucket has 2 cards. Visually, the 5 gray cards that say "No evidence" dominate the 2 cards the tutor should actually look at. Does this invert the intended hierarchy? If yes, propose a compressed treatment for the un-probed bucket (single strip? collapsed-by-default list? a text sentence instead of cards?) with a rationale for why information is not lost.

7. **The focus card's warm-up.** Three problems are listed with CPA labels the user won't understand. The rationale (DECISIONS.md) is that the ordering "teaches a principled sequencing habit." How would you keep the pedagogical intent while making it obvious to a tutor who has never heard of CPA what they're looking at, and in what order to use these problems *during* the session? Propose specific copy and structure.

8. **The evidence → transcript round-trip.** The sequence is: scroll to sub-skill map → click "Show evidence" → see quote → recognize the quote is a link → click → transcript opens → scrolls to the line. That's 4 deliberate actions, and the link affordance (dashed underline, same color as body text) is weak. Is this a 60-second-read feature? If not, propose a single change (or three) that collapses this to one or zero clicks for the *primary focus* sub-skill specifically — the rest can keep the current pattern.

9. **Tutor moves — a grid of everything.** The 4-quadrant grid shows all curriculum tutor moves, regardless of what's going to happen this session. `prioritizedTutorMoves()` in derive.ts is literally a passthrough. Is the right design an undifferentiated grid, or should today's focus card *pull in* the 1–2 most relevant moves inline and leave the full grid as an overflow panel? Make a call.

10. **Copy plan — what does it actually do?** Click the button. Paste the output into a text editor. Critique it as if you were the tutor pasting it into Slack. Does the format match the promise? Is "Copy plan" the right verb and the right affordance, or does it need a preview, a "copy as markdown" option, or an "open in Google Docs" alternative?

11. **Temporal grounding.** The header says "Last session: Thursday, April 24, 2025." It does not say "3 weeks ago" or "this session starts at 4:30pm." The product is called *pre-session* but contains no "session" context. What belongs here.

12. **Empty and edge states.** You're looking at one seeded scenario. How does the design hold up when:
    - All 7 sub-skills are `not_assessed`?
    - All 7 are `secure`?
    - The focus sub-skill has zero problems in the bank (warm-up is empty)?
    - There's a second session and the affect note from session 1 has been superseded?
    - The analyzer's confidence on the focus sub-skill is 0.3 (very low)?

    Flag at least two edge states where the current design fails silently or reads as "broken."

13. **Accessibility and scanability beyond what `vitest-axe` catches.** `toHaveNoViolations()` gives a floor, not a ceiling. Critique: the color-alone state distinction on status chips; low-contrast tiny uppercase labels (`.headerEyebrow`, `.warmupType`, `.tutorMoveTitle`); the monospace sub-skill IDs at probably sub-AAA contrast; the dashed-border evidence links; the small round low-confidence badge icon that's "subtle" to a fault and easy to miss.

14. **One 60-second scan path.** Trace, step by step, the exact visual path a novice tutor's eyes should take from landing to "I know what I'm doing today." Where does the current design fight that path? Propose the smallest set of changes that make that path un-fightable.

**Assumptions the team has made — pressure-test them.**

Pick at least 5 of these and give your actual answer. Not "it depends" — your answer.

- "Single scrollable page, no tabs" — is this right, or has the page grown to 3× above-the-fold and the single-scroll model is no longer serving a 60-second read?
- "One focus sub-skill, not a ranked list" — does picking the single focus hide the "what if I disagree" override? Should there be a runner-up the tutor can pivot to?
- "`not_assessed` as a first-class bucket" — is surfacing 5 empty cards actually helping the tutor plan, or is it planning-theater that steals attention from the 2 cards that matter?
- "Silence above the confidence threshold" — is silent-is-a-feature the right call, or does the tutor need a quiet "AI is confident here" signal to trust the green "Secure" chip?
- "Evidence collapsed by default" — should the *primary focus*'s evidence always be expanded, while the rest stay collapsed?
- "CPA ordering" — does teaching pedagogy through ordering-without-explanation actually teach it, or does it just confuse? Should the card explicitly name the progression in plain English?
- "Student affect note" — is this a real unlock or a decorative touch? Would a new tutor rely on it, or would they ignore it because it's labeled with a clinical word?
- "Copy plan as plain text" — is plain text the right payload for where tutors actually paste (Slack, Google Docs, paper notes)?
- "Transcript at the bottom, collapsed" — should it be present at all on this page, or should the deep-link go to a dedicated `/transcript` route?
- "App h1 = student name" — is the student name the right primary heading, or is the recommendation ("Today: firm up X") the real h1?

**Non-goals (don't waste ink on these).**

- The visual token system (glass cards, soft gradients, `#1e5bb8` brand) is fine. Don't redesign the brand.
- Don't propose adding Tailwind, styled-components, Radix, shadcn, or any new library.
- Don't propose multi-student, multi-session, or multi-cluster functionality — it's out of scope.
- Don't propose LLM integration, feature flags, or backend changes.
- Don't rewrite the derive layer's test strategy.
- Don't relitigate the Jest-vs-Vitest decision.

**Deliverable format.**

Structure your response as:

1. **Verdict (3 sentences).** What is the single most important thing the team got right, the single most important thing they got wrong, and your confidence level on each. No diplomacy.

2. **Above-the-fold rework (concrete).** Describe, element by element, exactly what a novice tutor should see in the first 700px on a 1280-wide laptop. Reference the current elements and explain which to keep, move, shrink, or cut. Cite files and lines.

3. **Top 5 changes, ranked by impact-per-effort.** For each: the problem (one sentence, grounded in observation), the change (one paragraph, file + line level), and what it will feel like to the tutor afterward (one sentence). The first change should take <30 minutes of engineering; the fifth should be a deeper rethink.

4. **Microcopy rewrites — a table.** Column A: current string and its file:line. Column B: your replacement. Column C: one-phrase rationale. At least 10 rows.

5. **Assumptions pressure-tested.** For each of the 5+ assumptions you picked from the list above, write two sentences: your call, and the tradeoff you're accepting by making it.

6. **What would turn this from good to exceptional.** One paragraph. The design move you'd make if you could slip past the stated constraints — and the one sentence of honest justification for why you didn't include it in the main critique.

Length target: ~1,500–2,500 words. Dense, specific, file-grounded. If you're writing a sentence that could apply to any design tool anywhere, delete it.

**Non-negotiables.**

- Every recommendation cites a file (and line where relevant). "Somewhere in the header" is not acceptable.
- Every microcopy suggestion is a string you'd actually ship, not a direction ("make it warmer").
- You are allowed to disagree with DECISIONS.md. You are expected to, where it's wrong.
- You are not allowed to ask clarifying questions before starting. Make your best read of the intent and commit.
