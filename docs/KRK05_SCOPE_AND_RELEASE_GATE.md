# KRK05 — local post-check restoration extraction (29 October 2026)

**Scope:** partial, reviewed mathematical translation. **KRK gameplay remains intentionally disabled**. This is not a complete proof-derived opponent; no external chess engine, tablebase, game-tree search or heuristic selector is used.

## Source and exact case

The owner-arranged root FEN is `8/8/8/8/3k4/R7/3K4/8 w - - 0 1`: White Kd2 Ra3, Black Kd4, White to move. The existing extracted `oppositionCheck_sound` chooses `Ra4+`. It proves a legal checking rook slide and restricts every legal weak king response to one-rank ascent, but does *not* certify the next move at the original 3-file gap because `oppositionFollow_sound` demands at least 4 files.

Upstream [KRK05 mathematical draft PR #7](https://github.com/jfairfaxball-348/engame-chess/pull/7) imports the frozen `KRKCentral.restoration_bound` construction into three local coordinate-level proof obligations:

1. **Margin < 3, restoration first pair:** move the rook to `wallFarFile`, then every legal weak reply keeps at least three files of rook separation.
2. **Margin >= 3, restoration first pair:** move the king one rank up and toward files 3/4, then every legal weak reply preserves a strict rook wall, separation >=2 and strong-king file 2..5.
3. **Subsequent file 2/5:** move the king horizontally to file 3/4, then every legal defender reply remains above the rook wall.

The downstream independent implementations are `src/krk-restoration-first.js` and `src/krk-restoration-centre.js`. These are **not** imported into the released opponent `src/engine.js`. They do not read the parent repo or query a chess engine at runtime, and each returned action retains `isCompleteWinningPolicy=false`, `maxMatePlies=null`, original board, history and halfmove clock. The all-reply tests are `test/krk-restoration-first.test.js` and `test/krk-restoration-centre.test.js`, run for both stronger colours and all four approved symmetry frames, on the actual legal weak replies.

## Verification and release boundary

The Playground CI verifies the individual local source-to-board contracts, regression fixtures, untouched Maths/Engine browser behaviour and the static Pages output. It **does not** prove that concatenating those local actions creates a total winning strategy.

The local mathematical extraction **passed the full Lean build, forbidden-proof-escape and standard-axiom CI** on upstream PR #7 head `b4690afeb85f315c94164cfd1d43b9435948eb2b` ([verified run #40908371875](https://github.com/jfairfaxball-348/engame-chess/actions/runs/40908371875)). This certifies the new **local** Lean lemmas, not a global policy. PR #7 is still draft, stacked on unmerged upstream work; the executable source/blob hashes must be frozen and reviewed before any future material release.

Remaining prerequisites for **full playable KRK**:

- An executable, total **all-root** selector for any legal fresh KRK position, including non-wall setup, both colours and side-to-move cases.
- A single all-defender, well-founded progression through guarded entry, column/box/restoration and the last mating move, not just local transitions.
- An auditable history-aware strategy and 50-move/repetition guarantee consistent with the upstream 97/98-ply fresh-clock theorems, capture-to-KK, claims and terminal states.
- Immutable proof-source lock, full adversarial games from representative and boundary roots to checkmate, original-board continuity, browser QA and final explicit owner-approved material release.

Accordingly, leave `KRK_GAMEPLAY_RELEASED=false`, `MATERIAL.krk.playable=false`, and Maths KRK `canStart=false`; do **not** merge this draft as a KRK release or claim it is deployed. The deployed site remains limited to the existing frozen dead-position Maths classes; Engine Playground is separate.

**Review:** [parent Lean PR #7](https://github.com/jfairfaxball-348/engame-chess/pull/7) and [downstream draft PR #12](https://github.com/jfairfaxball-348/engame-chess-playground/pull/12).
