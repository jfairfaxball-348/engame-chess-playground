# S024 — KQK corner and rank-five source controller repair

30 October 2026. Chess Playground only. Frozen upstream KQK EC-T0050
commit `c72365a8ba46f59114a2a77d9d38993f6a52df80`.
**Stage A remains open**: a locally faithful source repair is not a total
certified JS selector or a proof that every legal root mates.

## Precise source imports

1. `formal/EndgameChess/Rules/KQK/SetupCorners.lean`,
   `corner_knight_low_five_rescue`: for framed queen (6,5), weak K (7,7),
   strong K with rank <= 5, the unblocked first step is **Q(5,5)**.
   If K=(5,5) occupies that target, the nested
   `king_blocks_target_bound` first step is **Q(7,5)**, then the
   actual legal weak K(6,7) reply is met by **Q(6,6)** checkmate.
   Previously, the JS knight dispatcher omitted the rank-five
   (6,5)/(7,7) source branch entirely.
2. `formal/EndgameChess/Rules/KQK/KnightPrison.lean`,
   `knight_prison_low_five_bound`: a strong king on rank five must
   first play **K(kx,4)**, then **after the real weak reply** enter the
   `knight_prison_bound` branch corresponding to K(6,7) or K(7,6).
   The prior JS dispatch could attempt the lower-rank
   `knight_top_bound` Q(4,6) with a rank-five strong king. New
   one-reply `knight-low-five` token preserves the source frame,
   board and move-count, and only dispatches the two proved knight
   responses. No positional heuristic or arbitrary move was added.
3. `formal/EndgameChess/Rules/KQK/RankFive.lean`,
   `left_corner_bound` and `left_fork_weak_bound`: both depend on
   **strong king rank <= 4**. The previously missing guard could
   mis-route rotated rank-five positions through the wrong theorem.
   This premise is now checked literally. A narrow priority pass
   dispatches the exact rank-five source actions before the generic
   orientation-wide knight pass.

## Verification

`test/kqk24-corner-low-five.test.js` covers two colours and all eight
symmetry frames, the blocked and ordinary corner cases, the top and
side knight configurations, and every immediate legal defender reply.
It asserts the literal queen/king target and the token-based
continuation. The existing KK/KBK/KNK proof panels and KRK selector
are unchanged. These are concrete regression proofs of code paths,
not whole-game all-root mathematical certification.

The **S023 expanded baseline** for comparison was KQK 81/112 bounded
all-defender mate-closed, 31 capped/inconclusive, zero hard failures;
KRK 24/24 capped at 2,500 nodes each, zero identified hard failures.
The full S024 expanded CI is to be recorded from the exact merged
head; do not substitute the earlier baseline or assume caps resolved.

## Remaining

- Re-run unchanged-seed S024 adversarial audits. Report family-level
  closed, falsified and capped separately; a cap is not a failure.
- Source-trace late `FarFilePreparation`, `SameRankEntry` and
  `WeakToMove` trajectories, not just root first actions.
- KRK distinct-history structural revisits are not safely memoizable
  into certified wins without proving their history equivalence.
- Only after **both** KRK and KQK genuinely close in simplified mode,
  immediately deliver board-specific derivations and FIDE clock /
  history parity for these two, preserving the older three classes.

No change to the upstream research repository. No engines or tablebases
in Maths. Certified selector flags remain false.
