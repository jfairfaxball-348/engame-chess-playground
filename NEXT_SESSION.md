# KRK12 — Complete global root-to-mate constructive KRK strategy

**NEXT EXECUTION SESSION — INSTALLED, NOT EXECUTED.**

## Owner priority (29 October 2026)

**Finish the proof-derived winning strategy. Defer the 50-move/repetition
claim project for now.** Chess Playground may eventually expose a clearly
labelled mathematical gameplay mode that continues to mate even where
ordinary FIDE claims would apply; it must not claim to be a standard
rules-certified game or quietly alter the Engine tab. The conditional
mathematical release gate remains: exact proved moves, total selection,
all-defender coverage, no third-party engine/tablebase/minimax/heuristic.

## Incoming stacked drafts

- Parent `engame-chess`: [KRK10 PR #11](https://github.com/jfairfaxball-348/engame-chess/pull/11),
  source `2433df9ea1ccbba000740cb89f2f0f276ce65d37`;
  selected tagged central policy proves actual checkmate from every full
  central wall in <=101 static plies (depending on rook rank).
- Parent [KRK11 PR #12](https://github.com/jfairfaxball-348/engame-chess/pull/12),
  `krk11-prepared-wall-policy`: adds proof source
  `PreparedWallPolicy.lean` and embeds the concrete rank-decreasing
  prep controller into selected `CentralRun`, extending winning
  certificates to **all oriented strict rank-wall roots**. VERIFY exact
  final-head Lean build and axiom output; do not assume green before checking.
- Playground [KRK10 PR #17](https://github.com/jfairfaxball-348/engame-chess-playground/pull/17)
  and [KRK11 PR #18](https://github.com/jfairfaxball-348/engame-chess-playground/pull/18),
  branch `krk11-history-claims-audit`. The KRK11 JS adapter and tests
  implement prep-to-central handoff and preserve original positions/history.
  Confirm final-head CI; see `docs/KRK11_PREPARED_WALL.md`.
- `MATERIAL.krk.playable=false`, `KRK_GAMEPLAY_RELEASED=false`.
  Draft proof branches are stacked, not merged into main. KQK/KPK,
  frozen parent and Engine tab are untouched.

## Core mission

1. Audit strong-to-move legal-root geography **outside every oriented
   strict rank wall**, and select finite, source-derived entry actions.
   Use actual frozen upstream `KRKForcing` constructors and
   `KRKExecutable` extensions, not an existence theorem,
   `Classical.choose`, generic first legal move, minimax or engine.
2. Prove a deterministic typed phase/rank controller: non-wall setup
   -> strict oriented wall -> KRK11 prep -> KRK10 central -> actual mate.
   Each action chooses a concrete coordinate; every legal lone-king
   reply must preserve a named next phase with decreasing well-founded
   budget. Handle all rotations/reflections and both strong colours.
3. Integrate weak-to-move roots explicitly: already mated, stalemate,
   capturable/unprotected rook -> dead KK draw; otherwise every legal
   defending move transfers to a proven strong-turn winning root.
   Do not invent a strong-side move while the weak side is to move.
4. Translate ONLY final-head kernel-verified choices to local JS,
   with exact immutable source SHA + Git blob lock, positive/negative
   branch tests, and a global fail-closed dispatch. Keep the user's
   arranged board and exact side-to-move (never switch to a canned FEN).
5. Add end-to-end games reaching actual checkmate under every legal
   defender response for representative complete phase domains;
   independently audit each phase's entire input domain, not just a
   hand-picked best defender line. Retain source phase and proof working
   in the Maths UI. No lookup of precomputed winning tables.
6. Defer mathematical proof of 50-move/repetition/75-move semantics:
   label the intended Maths mode appropriately and ensure it cannot
   masquerade as conventional FIDE chess. No release if the selected
   constructive *winning* strategy remains partial.
7. Run final-head Lean compilation, explicit axiom audits, Node tests,
   immutable source verification, domain audits, syntax, build, Maths
   and Engine browser QA, compare heads, then merge only verified
   coherent stacks. Cloudflare Workers Builds is preferred; verify
   actual deployment and browser smoke tests before claiming live KRK.

If this mission is incomplete, leave specific proof counterexamples/
missing preconditions and an executable tested partial branch; **do not
replace strategy work with another prompt-only session**.
