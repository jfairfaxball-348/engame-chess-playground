# KRK05 — Constructive post-check restoration and total KRK source-derived mate policy

**NEXT SESSION — INSTALLED, NOT EXECUTED.**

Owner goal remains a fully playable, theorem-derived KRK adversary. This
follow-up is **execution**, not a documentation or release-flag exercise.
Vercel hit its daily deployment quota on 29 October; develop and run CI
independently, never claim production is updated without verifying a deploy.

## Verified boundary coming out of KRK04

- Parent research `main` was `e163515e875d6fe25157246b345f0566a3ffba8c`;
  active KQK/KPK must remain intact. Upstream extraction [PR #4]
  (https://github.com/jfairfaxball-348/engame-chess/pull/4) remains
  a separate prerequisite.
- Proof branch [KRK04 parent PR #5]
  (https://github.com/jfairfaxball-348/engame-chess/pull/5)
  specialises `oppositionCheck_sound` into a concrete aligned READY
  check plus its all-reply postcondition. Verify Lean / axioms and
  reconcile the stacked branch before treating it as a new frozen source.
- Playground `src/krk-ready-dispatch.js` translates that **already
  source-proven local** check, keeping `isCompleteWinningPolicy=false`
  and `maxMatePlies=null`. Both colours, all four frames, and initial
  rook gaps 2/3/4 are covered by `test/krk-ready-dispatch.test.js`.
- `docs/KRK04_ALIGNED_CHECK.md` explains the exact remaining obstacle
  and release status; neither repo's current changes have enabled
  any KRK Maths gameplay.

## Required next work

1. Start with White Kd2 Ra3 vs Black Kd4, white to move,
   FEN `8/8/8/8/3k4/R7/3K4/8 w - - 0 1`. The checked
   rook move is Ra4+, and all weak king replies retreat upward.
   Gap is 3 files: existing `oppositionFollow_sound` explicitly
   **cannot** justify a generic next `Kd3` move.
2. In a fresh upstream importing Lean module, extract the
   `KRKCentral.Restoration` rescue/catch-up cases into coordinate
   functions and prove each reply total and decreasing over its *exact*
   input type. Preserve KQK/KPK and immutable source theorems; build
   `lake` and print axioms for the exact new head. Reconcile PRs #4/#5,
   do not force-merge conflicting main.
3. Compose `ReadyCut` narrow/wide/aligned and guarded/column/box phases
   into all-defender, well-founded and clock/history-aware *global* source
   policy. Finish non-wall setup and both colours/turns/frames. No heuristic,
   engine, tablebase, minimax, arbitrary first-legal or known-FEN lookup.
4. Translate ONLY verified new Lean steps into the independent local
   Playground JS, maintain immutable source/blob locks, add legal complete
   adversarial games to checkmate and verify all replay/claim/75-move
   semantics. Preserve exact arranged board and Engine tab behaviour.
5. Run `npm test`, `npm run verify:krk-sources`,
   `npm run audit:krk-phase-domains`, `npm run check`, `npm run build`,
   browser suites and Lean+axiom CI. Merge only exact tested heads.
   **Only after** fully certified global selection and owner-approved
   release, enable `KRK_GAMEPLAY_RELEASED` and KRK Maths Start.
   Otherwise preserve a separate proof-progress branch and clear blocker
   record, with KRK still **not fully playable**.

Install KRK06 only when a genuinely distinct, precisely verified
next proof obligation remains; do not turn successor prompts into a
substitute for actually constructing the policy.
