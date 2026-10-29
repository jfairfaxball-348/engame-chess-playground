# KRK13 — two-step source-derived setup closure (draft)

29 October 2026 · PR #20 · stacked on KRK11 staging, including KRK12.

## Implemented (not released)

`src/krk-nonwall-entry.js` now includes the exact, already frozen
`krk_offrank_setup_force` and `krk_backrank_setup_force` **first
coordinate actions**, carried through the existing `krkConstructiveStep`
source translation. These sources are in
`formal/EndgameChess/Rules/KRKForcing/OffRankSetup.lean` and
`SameRankSetup.lean`; their source commit/blob hashes remain checked by
`proof-sources/krk.lock.json`. The original upstream global
`krk_strong_force_of_not_check` is an existence/strategy theorem, NOT
an executable, globally selected JavaScript controller.

- **Off-rank near-file:** the rook moves to the far file prescribed by
  `wallFarFile`. After each *actual legal* weak reply, a separately proven
  oriented strict-wall controller or clear rook-entry theorem must apply.
  The latter may use a transposed/reflected source frame, corresponding
  to the existing `krk_horizontal_entry_force` proof's symmetry cases.
- **Back-rank near-file:** the strong king moves onto the weak king's
  file. After each *actual legal* weak reply, the exact
  `krk_backrank_protected_force` step must apply in the same frame.
- **Continuation guards:** the recorded first move's position key, turn,
  colour, halfmove, full history length, legal state, frame and specific
  source-geometric postcondition must match. The second step retains its
  own existing proof-bound continuation, with no board reset.
- **Selector:** `krkPartialRootChoice` first tries existing strict-wall
  and direct-entry proofs and only then the two setup proofs.
  Deterministic source premise selection is **not** a search, policy
  synthesis, tablebase or fallback to an arbitrary legal move.
- **Falsification:** `auditKRKSetupEntry` enumerates *all* legal
  defender replies after the first action, and all replies after any
  direct second action, checking exact continuation into KRK11.
  This checks the port but is not a Lean global termination theorem.

`test/krk-setup-entry.test.js` exercises both colours, all four proof
symmetries, both setup cases, all legal defending replies to the first
and second actions, invariants and tampered continuation contexts.
A full-game checkmate example is already included in KRK12/11 tests.

## Unfinished mathematical/software obligations

1. Exhaustively partition every legal strong-turn root under source
   symmetries. For each missed root record an exact FEN and which Lean
   constructive phase has not yet been translated. The finite strategy
   existence result alone is **not** a total deterministic move selector.
2. Compose arbitrary supported setup chains into the tagged, finite
   KRK11 prepared-wall + KRK10 central mating controller. Establish a
   *global* well-founded phase rank and certify all legal defender replies
   in Lean, not only sampled JS tests.
3. Partition weak-to-move roots: mate/stalemate, immediate safe rook
   capture to KK draw, and safe-rook positions. The strong side must
   never play on the weak side's turn.
4. Verify complete legal-root play to checkmate under arbitrary defence,
   continuity of exact arranged boards, and Maths/Engine browser isolation.
5. Only then consider releasing an explicitly labelled **mathematical**
   KRK mode. Ordinary FIDE 50/75-move and repetition claim certification
   is intentionally deferred and must not be claimed.

**Release flags remain false:** `MATERIAL.krk.playable=false`,
`KRK_GAMEPLAY_RELEASED=false`. No production deployment claim.
