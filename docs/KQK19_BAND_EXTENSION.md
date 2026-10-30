# S019 — Constructive KQK separating-band extension

30 October 2026. This is a **source-derived experimental subset**, not a
formal extraction or total certified JavaScript opponent.

## Frozen mathematical provenance

Source repository: `jfairfaxball-348/engame-chess`, immutable Lean commit
`c72365a8ba46f59114a2a77d9d38993f6a52df80`, theorem `EC-T0050 v1`.

`src/kqk-source-policy.js` now directly translates additional geometric
moves from `BandEntry.wall_prepare_bound`,
`BandProgress.prepared_king_step` / `prepared_queen_step`,
`BandRaise.prepared_raise_bound`, `RankFive` and
`KnightPrison`. They are selected through the same eight board symmetries.

The band controller first walks a king up to a separating queen rank,
aligns it on the queen's file (or an already prepared valid file), advances
the king and queen files with the source's explicit potential descent, then
crosses the queen rank and raises the queen. A bound continuation token
restricts the post-cross rank rise to exactly the next legal weak reply.
Crucially, the frozen `BandRaise` **rank-four/top-right corner exception**
uses `Q(5,5)` to enter the knight box, **not** the regular vertical queen
rise: the latter can stalemate.

The source-defined knight cases connect some rank-five and shadow exits
to the pre-existing source-tagged edge-wall mating controller. Existing
S018 `ShadowForce` selection takes precedence on overlapping geometry,
preserving previously released demonstration behaviour.

## Verification contract

New Node tests in `test/kqk19-band-source.test.js` cover:
- exact user-selected source entry and first king step for both colours
- every legal weak reply after sampled source steps
- prepared king progress (no reset to the original file)
- prepared queen file advancement
- explicit crossing and rank-rise continuation, including forged-token refusal
- source knight-box/edge-wall transition
- complete first-reply demonstration runs to mate from newly covered roots

These are empirical implementation checks, not an exhaustive all-roots Lean
proof or a claim of complete KQK coverage. A missing phase returns `null`
and displays the existing explicit unsupported-position message. The Maths
tab retains the full equations, positional working and Lean links for KK,
KBK and KNK. The compact KRK beta and the independent Engines tab are
untouched. No Stockfish/Lozza/tablebases/minimax/fallbacks are introduced.

Certified `MATERIAL.kqk.playable` stays `false`, and 50/75-move and
repetition-history parity remain intentionally deferred.

## Further work

Coverage remains incomplete at `SameRankEntry`,
`FarFilePreparation`, `OrientedEntry`, and universal weak-turn transitions;
KQK is still an experimental playable subset. S020 should quantify actual
fresh-root and adversarial-defender complete-game coverage, then complete
the missing source families rather than widen the UI or start KPK.
