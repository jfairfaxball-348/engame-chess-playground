# S022 — bounded subtree closure and exact KQK corner mate

30 October 2026; Chess Playground only. The Maths source is frozen
EC-T0050 `c72365a8ba46f59114a2a77d9d38993f6a52df80`.
This session remains in **Stage A: playable source-derived strategy
closure** for both KRK and KQK. No Stage B rule/clock/proof-panel
parity is yet claimed.

## Auditing improvement, measured on S022 initial exact PR head

Pull request #31, initial exact-head CI run **41052834416**, green
Node/source/build/Chromium checks, used unchanged KQK sampling
seed `0x21c72365`, 4000 attempts, per-family 2, 1200 visited-node
and 48-round caps. Comparing to main S021 **55**-root sample:

| Audit | Closed all-defender mate roots | Confirmed failure | Cap-inconclusive |
|---|---:|---:|---:|
| S021 no closure cache | 26 | 0 | 29 |
| S022 complete depth-matched closure cache | **37** | **0** | **18** |

The improvement is **diagnostic**, NOT a proof that the JS controller
is stronger: the live KQK move selection is unchanged by caching.
The S022 harness reuses only a subproblem for which *every* defender
branch has actually terminated in mate, and only at an **identical
remaining round budget**. Active recursion cycles are checked first;
failed, capped and incomplete results are never cached as wins. This
visited 27,176 completely closed state/budget pairs and reused 13,146
complete subtrees. Unresolved roots now report their actual first
cap trajectory for targeted replay. Caps are still unknown, not wins.

The same CI run included a source-stratified **KRK** all-defender
diagnostic across 24 placements (3 root families, both colours, 4
frames), 1000 nodes per root. Result: 0 root/source mismatches,
0 confirmed strategy failures, **24 node-capped roots**, 24,024
nodes and 9,724 mating leaves observed. KRK's current full-tree
cost remains too high for these small budgets. Do not call this a
completed global check.

## New live source-move translation

`src/kqk-source-policy.js` translates the literal,
`OrientedEntry.lean` private
`high_file_corner_entry` case:
strong K(5,6), Q(x,5), weak K(7,7), legal strong turn, x != 7.
The specified move **Q(7,5)#** comes directly from the
frozen Lean construction. The exact predicate and move are transformed
under the same eight certified symmetries, without importing any
engine, score, arbitrary move or tablebase. The live controller
still fails closed elsewhere.

`test/kqk22-high-file-corner.test.js` covers both strong
colours, all eight symmetries and six legal initial queen files,
checking the exact tagged move and resulting mate (96 setups).
Queen file 5 is excluded because Q(5,5) already checks K(7,7)
on the strong side's turn and is not a legal fresh root.

## Remaining release obligations

- Re-run **final-head** adversarial and source-fixture tests; do not
  present initial-head results as final-head evidence if they differ.
- Identify 18 remaining sampled capped KQK root paths with the new
  `firstCap.path` trace; expand samples and investigate concrete
  failures from still-incomplete frozen source branches, notably
  FarFileEntry/OrientedEntry/edge exceptions.
- KRK still has 24/24 capped *stratified* game trees at 1000 nodes.
  Separate combinatorial explosion from missing transitions; avoid
  conflating this diagnostic with full rule-history certification.
- All legal defender continuations from every legal user-arranged
  root must play to actual mate before either strategy can be called
  globally complete in simplified mode. Neither class is yet verified.
- Once **BOTH** are complete in simplified mode, switch immediately
  to full position-specific mathematical derivations, live proof
  explanation and rule/clock/history parity for KRK and KQK, preserving
  KK/KBK/KNK's existing detailed working throughout.

This file reports **only evidence actually observed**. No
`MATERIAL.krk.playable`, `MATERIAL.kqk.playable` or certification
flag has been promoted.
