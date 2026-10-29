# KRK13 — Finish setup phase closure and full non-wall-to-mate selection

**NEXT EXECUTION SESSION — INSTALLED, NOT EXECUTED.**

## Priority

Finish the **complete proof-derived KRK winning strategy**, not the
50-move/claim project. The Maths tab must preserve users' arranged
board, side to move and derived proof working, and must never borrow
the Engine tab's Stockfish/Lozza, a tablebase, first-legal fallback,
minimax, or an unproved heuristic. Keep KRK gated until global all-reply
mate selection is proved and implemented.

## Incoming status

- Playground KRK11 [PR #18](https://github.com/jfairfaxball-348/engame-chess-playground/pull/18)
  contains the prepared strict rank-wall controller, stacked on KRK10.
  Its final SHA is `340ad280384d630f200525a9bc78eee77771769d`;
  its Playground CI was successful.
- KRK12 branch `krk12-nonwall-entry` adds source-derived first actions
  for clear vertical entry, same-rank retreat, and protected back-rank
  entry; each action's ALL legal replies enters the previously implemented
  strict-wall policy. Read `docs/KRK12_NONWALL_ENTRY.md`.
- Upstream parent [KRK11 PR #12](https://github.com/jfairfaxball-348/engame-chess/pull/12)
  at `7cfd8462a9fd36c8e37250221ee809b5b8287836`:
  check final-head Lean build and explicit axiom reports before
  upgrading its certainty.
- `MATERIAL.krk.playable=false`, `KRK_GAMEPLAY_RELEASED=false`.
  KRK12 is NOT an arbitrary legal-root/global policy.

## Required next work

1. In **upstream endgame-chess**, extract and prove the two-step
   `KRKForcing.OffRankSetup` far-file repair and
   `KRKForcing.SameRankSetup` back-rank king setup into exact
   executable coordinates with ALL legal defender replies and a
   decreasing/finite phase rank. Preserve frozen proofs, KQK/KPK and
   upstream main. Review applicable setup-axis involutions.
2. Compose every strong-to-move fresh legal root into strict rank wall,
   then KRK11 PreparedRun, then KRK10 CentralRun to actual mate.
   Independently and exhaustively audit *domain* coverage across both
   colours and board symmetries. Record exact counterexample positions
   for any missing phase. Prove global totality and static termination
   in Lean; do not substitute search or empirical samples.
3. Partition weak-to-move legal roots explicitly, including checkmate,
   stalemate, safe rook, immediately capturable rook -> KK draw and all
   defender replies. Do not issue a strong move on weak's turn.
4. Translate ONLY kernel-verified coordinate actions, pin upstream
   commit and per-file Git blob hashes, make a single fail-closed local
   global selector, and run full games to actual checkmate on *every*
   defender reply from representative complete domains. No canned FEN.
5. Run Lean/axiom CI, Node tests, source locks, exhaustive domain audit,
   browser Maths/Engine QA, build and deploy verification before
   merging coherent stacked branches. Merge with exact-head checks;
   do not force-merge an unverified stack. If incomplete, leave an
   executable tested improvement and an exact blocker, not a prompt-only
   session.

**Defer 50-move/repetition/75-move certification.** A future full
mathematical mate mode must disclose that ordinary FIDE clock/history
claims are not certified; never call it a standard rated game.
