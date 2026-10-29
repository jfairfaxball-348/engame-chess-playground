# KRK14 — Tagged continuation and defender falsification

29 October 2026. Playground [draft PR #21](https://github.com/jfairfaxball-348/engame-chess-playground/pull/21), stacked on KRK11 staging PR #18.

## Implementation (unreleased)

- `src/krk-tagged-strategy.js` composes the existing **frozen Lean-derived actions** for strict prepared walls (KRK11), direct entry (KRK12) and two-step setup (KRK13).
- A tagged continuation carries the exact original source phase, frame, last strong move's board key, turn, move history length and halfmove. It does not choose a new first move after a defensive reply. Invalid context fails closed. It does not call Stockfish/Lozza, minimax, a tablebase, a solution atlas, an unproved heuristic or a first-legal fallback.
- `classifyKRKWeakRoot` handles the *other side to move* without attempting to move for it: mate, stalemate, available immediate rook capture to KK draw, and the safe replies that do or do not enter a source-selected strong turn.
- `scripts/krk14-continuation-audit.mjs` enumerates legal defensive replies after both the first and the second selected strong moves, preserving *actual* history and recording exact FENs, source rules and replies for counterexamples. `--all` is possible but expensive; the CI sampling window is an explicit **prefix** and is not the whole-game theorem.
- `scripts/krk14-mate-tree.mjs` explores all legal defending replies through a full game against the tagged strong strategy from one specified root. It has explicit node and ply caps, returns the first counterexample (including continuation and FEN), and NEVER makes decisions for the strong side. A cap is **not** a proof.

## Verified finite checks

The exact PR head `a55ad073982654f0dd9180d5f0043f708a92f6b1` passed Playground Actions [#40972054825](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/40972054825), including **the 350,336/350,336 fresh strong-root first-action selector check**, browser Maths/Engine tests, build, source locks and Node regression tests.

The KRK14 **2,048-triple stratified window** on that tested head reported:

| Measurement | Count |
| --- | ---: |
| Legal ongoing strong roots tested | 2,688 |
| Selected first actions | 2,688 |
| Legal first defender replies / successful tagged handoffs | 14,422 / 14,422 |
| Legal second defender replies / successful tagged handoffs | 84,796 / 84,796 |
| Weak legal roots classified | 3,442 |
| Weak-root mate / stalemate | 2 / 4 |
| Weak positions permitting immediate rook capture to KK draw | 352 |
| Safe weak replies / covered strong-turn source entries | 16,564 / 16,564 |
| Missing handoffs or unsupported safe weak reply within this window | 0 |

These are executable port/falsification results, **not** a proof of total mating strategy from every legal root. The full-tree diagnostic and its CI are additional tests on the subsequent KRK14 head, not included in the earlier exact-head CI claim.


## KRK14 complete-game detector correction

The first all-defender full-tree run at `c5faa74c657fbbab5b3e84e120f1af63fbc79993` falsely labelled a **ply-28 cycle** starting from
`8/8/8/8/5k2/R7/2K5/8 w - - 0 1`. That report is **RETRACTED**:
the diagnostic key compared the outer PreparedWall tag (`stage=central`)
but dropped its nested `CentralRun` stage (`centre` versus `lower`).
The same board with *different source control stages* is not a cycle of
the deterministic tagged state machine.

The stage-sensitive fix at `d4175fe0347f4a50247a474b71805c800401658c`
passed [Playground CI #40972942947](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/40972942947).
With the same starting root and `--nodes=1200`, the diagnostic saw **1,201 nodes,
484 terminal checkmates and a maximum 37 plies**, then stopped on the explicit
**node cap**, NOT on a cycle. This neither proves nor refutes all-reply
termination. A dedicated regression checks the previously false positive.
The diagnostic also gains `sourceTrace` on any failure so that nested
Lean rule, stage and orientation can be inspected without turning the
test traversal into a move selector. The larger **40,000-node cap diagnostic** on exact code head `d21e52bc8de0e09bc81490c498eec15830e3017e` passed CI [#40973257601](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/40973257601): **40,001 nodes, 16,482 checkmate leaves, maximum 45 plies**, no observed cycle or unsupported continuation before the **node cap**. This is not a complete tree proof. The full all-defender mathematical certificate and source-to-JS selection equivalence remain OPEN.

## Remaining mathematical work

The central requirement is a **source-correspondent well-founded rank** for the entire deterministic tagged controller, proving that *all* legal defender choices reach mate, beginning at any legal strong-turn root. The upstream `KRKForcing.SafeSetup.krk_strong_force_of_not_check` is a `ForceMate` existence construction; it does not by itself certify that this particular JS selector faithfully composes all of its choices. Verify any newly required finite rank or phase lemma in a fresh upstream importing module and run Lean/axiom CI.

Weak-to-move roots need a fully formal classification, distinguishing terminal conditions and capturable rook from universally safe replies. These diagnostics classify finite boards but do not prove global history-aware playability.

**RELEASE LOCK:** `KRK_GAMEPLAY_RELEASED=false` and `MATERIAL.krk.playable=false`. No production deployment or FIDE 50/75-move/repetition certification is claimed. Owner has explicitly deferred clock/history work to prioritise the complete mating strategy.
