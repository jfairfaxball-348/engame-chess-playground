# KRK08 — Complete the central lower-band recursion and global proof-derived mate policy

**NEXT SESSION — INSTALLED, NOT EXECUTED.** This is execution: code,
Lean proof, tests and release governance, NOT another diagnostic-only
iteration. Owner's target is a genuinely playable KRK Maths opponent.

## Exact incoming state

- [Playground KRK07 draft PR #14](https://github.com/jfairfaxball-348/engame-chess-playground/pull/14)
  is stacked on [KRK06 PR #13](https://github.com/jfairfaxball-348/engame-chess-playground/pull/13),
  itself stacked on [KRK05 PR #12](https://github.com/jfairfaxball-348/engame-chess-playground/pull/12).
- KRK07 adds `src/krk-central-upper-phase.js` and complete all-defender
  phase audits from upper READY via the rank-two rook lift and at most
  three restorative pairs to a FULL central wall one rank higher.
  Source is existing, proof-tested `KRKExecutable.readyUpperDestination_sound`,
  `KRKCentral.restoration_bound` and `exit_step_bound`.
  See `docs/KRK07_CENTRAL_UPPER_PHASE.md`.
- [Lean KRK06 PR #8](https://github.com/jfairfaxball-348/engame-chess/pull/8)
  is a proof draft stacked on upstream PR #7; KQK/KPK on main must be
  preserved. Do not force-merge or treat an existential theorem as an
  executable move selector.
- Neither global mate policy nor full FIDE-safe action certificate
  exists; **KRK Maths Start remains disabled**. Vercel quota remains a
  deployment limitation, not permission to skip CI or claim release.

## Required execution

1. Inspect **exact newest heads and their CI**, reconcile stacked draft
   branches without overwriting unrelated active proof work.
2. Formalise and extract the **complete lower-band continuation**, not
   one more isolated first pair. Connect `KRKCentral.positive_bound`,
   `back_bound`, `wait_even_bound`, opposition check,
   protected/guarded cuts, column/box pivots, `ExitBound` and
   edge mating. Produce a concrete selector plus ONE well-founded
   descending measure applying after **every** legal weak reply.
3. Compose the full central-wall induction with the already completed
   KRK07 upper rank advance. Finish the non-wall setup and root
   classification for every legal arranged KRK board, both colours and
   either turn; draw or captured-rook cases must never be falsely
   presented as forceable wins.
4. Translate ONLY exact, Lean-verified constructors into the separate
   Playground local JS. Retain immutable source locks and the user's
   arranged position/move history. No engine, tablebase, minimax,
   search, heuristic or arbitrary first-legal fallback in Maths.
5. Run Lean, print axioms, source-lock checks, full Node tests, phase
   audits, browser suites, and **actual complete all-defender games to
   checkmate**, checking 50/75-move and 3/5-repetition behaviour.
6. Merge only coherent, tested and reviewed heads. Enable KRK only
   when the complete policy and explicit owner approval exist.
   Otherwise report the exact missing constructor/induction, preserve
   draft and the KRK release lock. Install KRK09 only if there is a
   genuinely distinct proof obligation; do not replace execution
   with prompt churn.

## Non-negotiable

`KRK_GAMEPLAY_RELEASED=false` and `MATERIAL.krk.playable=false`
remain required unless the **whole** win/draw/terminal/clock policy
has been verified and its release approved.
