# KRK08 — Lower-band pursuit proof and measured composition (DRAFT)

29 October 2026. Both repositories have isolated, unmerged KRK08 drafts.

## Proven progress

The upstream proof draft [endgame-chess PR #9](https://github.com/jfairfaxball-348/engame-chess/pull/9) adds `KRKExecutable.lowerPursuitPair_sound` in `formal/EndgameChess/Rules/KRKExecutable/LowerPursuitPair.lean`.

It extracts a **concrete coordinate** for the strong king's one-file pursuit step from the frozen `krk_pursuit_king_move` theorem. Each defender reply is quantified and enters one of three mutually useful regions: an upper-rank exit, aligned files, or a strictly smaller oriented file-distance rank with rook margin still at least two.

The exact-head Lean workflow #40921511554 succeeded on `e920a7752665d025d30f81db7c0e7ec73ff77591`, and `#print axioms` reports `propext`, `Classical.choice` and `Quot.sound`, **no `sorryAx`**. Ledger structural checks also passed. This is a **local mathematical theorem**, not a global mating policy.

## Independent Playground translation

[Playground PR #15](https://github.com/jfairfaxball-348/engame-chess-playground/pull/15) is stacked on unreleased KRK07 PR #14:

- `src/krk-lower-band.js` uses exactly two existing source-derived coordinate rules: `KRKForcing.krk_pursuit_king_move` for one-file king pursuit and `KRKForcing.krk_wall_rook_move` for back-rook waiting.
- It applies the `positive_bound` / `back_bound` / `wait_even_bound` geometric split without searching for a move. It classifies the terminal **ExitBound premise**, not checkmate.
- A diagnostic expands every legal defending reply across 32 colour/frame/root cases. These produce 816 exit leaves within five strong/weak pairs, consistent with the ten-ply central bound.
- `src/krk-central-sequence.js` additionally joins these moves with rook-lift, opposition and restoration constructors to **investigate** end-to-end mating. In the isolated edge checkmate cases, all 8 colour/frame roots reach real mate.
- The penultimate-rank all-reply audit exposes a real cycle at ten plies: the translation restores the king to the centre even after a legitimate off-centre lower pursuit, undoing strict rank progress. The dedicated regression test requires this state to **fail closed**, rather than claiming it won.

**This is an exact newly identified blocker**, not something to hide with a fallback. The next mathematical obligation is a phase-indexed, orientation-preserving lower pursuit / upper exit / restoration dispatcher. When the king pursues off-centre, its successor must stay in that proof branch; centralisation is only appropriate in the specific restoration premise. Prove and test all replies and descending phase rank before composing again.

The source proof remains a draft and neither repo is a gameplay release. No full legal-root selector, safe global FIDE 50-move/repetition policy or all-defender game-to-mate proof exists. `KRK_GAMEPLAY_RELEASED=false` and `MATERIAL.krk.playable=false` must not change. Nothing here warrants production deployment.
