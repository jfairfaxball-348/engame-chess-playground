# KRK15 — Full-controller cycle identity and stratified complete-game falsification

30 October 2026. Unreleased staging work on [draft PR #22](https://github.com/jfairfaxball-348/engame-chess-playground/pull/22). This is **tested strategy-analysis infrastructure, not a global strategy proof**.

## Changes

1. `scripts/krk14-mate-tree.mjs` now compares the **entire recursively nested constructive-policy continuation token** when detecting a repeated board/controller state. The earlier diagnostic only compared the outer mode, prepared stage, inner central stage and orientation. This could conflate legal distinct phases, as already observed in KRK14. The new key retains frame, all nested stages, rank, target file and preceding strong-action position; it omits monotone `historyLength` and `halfmove` so repeating source states remain visible. It is a diagnostic/falsification key, not a proved decreasing rank or a complete FIDE-history state equivalence.

2. `scripts/krk15-stratified-mate-audit.mjs` runs **all legal defender responses** to the existing frozen tagged strong move selector from 24 reproducible test roots: three proof-entry families (prepared wall, direct entry, two-step setup), two colours and four board frames. It neither selects defensive/strong moves using a search algorithm nor changes gameplay policy. Any unsupported branch reports exact FEN, variation and source-phase trace.

3. `test/krk15-stratified-mate-audit.test.js` checks the full source-control key, the complete 24-case sample matrix, release-proof disclaimers, and the distinction between a finite tree closure, a cap and an actual continuation failure. The strict diagnostic command is `npm run audit:krk-mate-strata`; default 200-node cap per root. The test suite uses a smaller 60-node cap per root.

## Result interpretation

- `all-defender-tree-closed`: all weak replies for that one fresh test root reached actual strong-side mate **under the finite diagnostic**, within its limits. It is not a global Lean theorem and does not establish FIDE history certification.
- `resource-cap`: the traversal stopped at an explicit node or ply limit. **Not a successful mate proof and not a strategy counterexample.**
- `counterexample`: exact first failure, unexpected terminal outcome, rook capture, repeated source-control state or unsupported tagged move, with FEN and continuation. Treat as a genuine proof/translation obligation until reproduced.
- `source-root-mismatch`: fixture unexpectedly fails its expected source-derived first-entry phase; should be a test failure.

The mathematical objective is unchanged: a single source-correspondent **well-founded rank for the actual deterministic tagged selector**, with an all-defender decrease lemma across setup, prepared-wall, central descent/restoration and checkmate, from every legal strong-to-move KRK root. The published theorem's existence of a forced mate does not automatically prove that this particular JS composition selects the theorem's winning actions.

KRK gameplay stays locked. No FIDE 50-/75-move or repetition certification is claimed. Never promote a 24-root sample (or the earlier 40,000-node cap run) into a universal proof. This work is isolated from the independent Engine Playground.
