# KRK09 — Fix off-centre central pursuit cycle; finish source-derived mate policy

**NEXT EXECUTION SESSION — INSTALLED, NOT EXECUTED.**

## Incoming verified evidence

- Lean constructive lower pursuit [PR #9](https://github.com/jfairfaxball-348/engame-chess/pull/9), source branch `krk08-lower-pursuit-pair`, exact Lean/axiom CI passed at `e920a7752665d025d30f81db7c0e7ec73ff77591`. Prints **no `sorryAx`**.
- Playground [KRK08 PR #15](https://github.com/jfairfaxball-348/engame-chess-playground/pull/15), stacked on KRK07 PR #14, adds `src/krk-lower-band.js` (32 all-reply colour/frame cases to ExitBound, 816 leaves, max 5 pairs) and experimental `src/krk-central-sequence.js` (8 true-mate edge cases). Check latest exact-head CI before further changes.
- The **precise blocker** is reproduced in `test/krk-central-sequence.test.js`: Kd5/Ra6 against Kd7, white to move, exact FEN `8/3k4/R7/3K4/8/8/8/8 w - - 0 1`. The actual fixture is `sk:[3,4],rs:[0,5],wk:[3,6]` in 0-based bottom-origin files/ranks. Current phase composition repeats a position because it recentres the strong king after an off-centre pursuit move, undoing strictly descending progress. Existing audit detects the repetition and **fails closed**.
- The pre-existing individual Lean constructors remain correct. The problem is their **phase-indexed composition**, not the move legality, browser or engine.
- All stacks are DRAFT and unreleased. Keep KQK/KPK main intact, no force merge, and no deployment claim without real verification.

## Primary execution task

1. Inspect and correct the off-centre continuation **in the Lean source first**. Make the phase a tagged recursive state with an explicit distinction between (a) off-centre king chasing in lower band, (b) actual restoration after a rook lift, and (c) ready aligned/upper exit. Produce one decreasing induction over **every** legal weak reply, showing source move selection never undoes earlier progress.
2. Translate that proof into `src/krk-central-sequence.js` without searching, minimax, engine, tablebase, heuristics, arbitrary move fallback or lookup. The existing penultimate-rank test must require a genuine strong-side checkmate again; do not weaken it by omitting branches.
3. Compose with KRK07 rank-two/restoration and edge opposition to audit complete all-defender real games from multiple rank heights, colours, turns and board frames, including move histories and FIDE 50/75-move and 3/5-repetition constraints. The proof must provide the game-length bound, not just test enumeration.
4. Expand from full central wall to **every legal KRK arranged root**, including off-wall setup, weak-to-move and drawn/captured rook cases. Prove/translate the global selector before any UI activation.
5. Run exact-head Lean builds and `#print axioms`, source-lock verification, Node tests, phase domain, syntax, production build and both browser suites. Ensure all CI green at the latest heads.
6. Keep `KRK_GAMEPLAY_RELEASED=false` and `MATERIAL.krk.playable=false` until a **complete** proof-sourced opponent exists, is verified, and receives explicit owner approval. Merge only coherent tested branches; keep research drafts separate otherwise.

Do **not** install another successor prompt without a genuinely distinct demonstrated mathematical obligation. Prioritise fixing the actual central composition cycle over more unrelated first-step helpers.
