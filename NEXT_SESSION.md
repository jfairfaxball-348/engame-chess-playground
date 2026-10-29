# KRK07 — Complete central continuation and global theorem-derived KRK

**NEXT SESSION — INSTALLED, NOT EXECUTED.** Do not substitute more isolated
diagnostics or docs for the missing actual playing policy.

## Verified incoming boundary

- Parent proof draft [KRK06 PR #8](https://github.com/jfairfaxball-348/engame-chess/pull/8),
  stacked on proof PR #7, has two exact local first-pair central actions:
  `centralAlignedRescue_sound` and `centralBackRook_sound`. Full Lean
  [workflow #40916980662](https://github.com/jfairfaxball-348/engame-chess/actions/runs/40916980662)
  succeeded on `3991ab34a9e4fc747529ef6edc5f58f53372b72e`.
- Playground draft [PR #13](https://github.com/jfairfaxball-348/engame-chess-playground/pull/13),
  stacked on KRK05 PR #12, has `src/krk-central-boundary.js` and
  `test/krk-central-boundary.test.js` for both colours, four frames,
  all legal weak replies, history/clock checks, and an exhaustive
  close-margin coordinate lattice. Verify the exact most recent PR head
  workflow, not an older success.
- Neither branch is merged. `KRK_GAMEPLAY_RELEASED=false`,
  `MATERIAL.krk.playable=false`; KRK Maths Start is locked.
- Vercel has quota limitations. Cloudflare Workers deployment is available
  in the repository configuration, but no live KRK deployment is claimed.

## Execution objective

**Finish the globally executable winning opponent**, not another single
independent initial move.

1. In proof repo, first reconcile the stacked proof PRs #7/#8 with current
   main (preserving KQK/KPK), without force-push or unverified merges.
   Inspect `Central.lean`, `Positive.lean`, `BackEven.lean`,
   `WaitEven.lean`, `ExitStep.lean`, `ReadyCut.lean`, guarded/
   column/box and the Setup lemmas.
2. Prove an explicit **all-successor recursive central-to-mate selector**
   for every central-wall case, including aligned rescue, nonaligned
   oriented back-rook, positive pursuit, offset-one wait, guarded pivot,
   upper-wall rank advance and final edge mate. Name every concrete
   destination, quantify all defending moves and show one strictly
   decreasing well-founded measure across the composition.
3. Extend to **every legal KRK arranged root**, both colours, strong/weak
   to move and four frames. Use only source-proven moves. The Playground
   must NOT consult an external engine, tablebase, minimax, brute-force
   solving procedure or heuristic for Maths moves.
4. Preserve the actual arranged board and full move history. Handle real
   checkmate/stalemate, defending rook capture, 50-move/threefold claims,
   automatic 75-move/fivefold termination, and legal-turn consistency.
   Show global mate budget safe under FIDE conditions.
5. Run exact-head Lean builds, axiom checks, immutable proof source
   verification, Node and browser suites, and adversarial all-reply
   games **through checkmate**, not only to another handoff.
6. Merge only coherent tested heads. Keep KRK unreleased without the
   **complete proof and explicit owner approval**. A failure must identify
   the *single exact missing mathematical constructor or induction*
   rather than advertise a playable opponent.

The owner has asked for a fully playable KRK. Prioritise completing the
strategy over further narrow standalone test helpers.
