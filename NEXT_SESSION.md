# S028 — close verified KRK/KQK strategy gaps, not merely audit more

**Execute** in `jfairfaxball-348/engame-chess-playground`.
Read AGENTS.md and `docs/KQK27_PREPARED_SOURCE.md`.
Do not edit read-only `engame-chess`; KQK frozen source
`c72365a8ba46f59114a2a77d9d38993f6a52df80`.

## Non-negotiable owner order

1. Make **both** KRK and KQK complete simplified/play-first
   source-derived mating strategies from **every legal arrangement**
   against **every legal weak reply**, preserving legal play,
   capture-to-KK, start-from-exact-arranged-board and both colours.
   Do not use Stockfish, Lozza, tablebases, minimax, chess AI,
   arbitrary first-legal moves or manufactured mathematical proof
   in Maths. A missing source phase fails closed and is visible.
2. **Immediately once both are actually closed**, return to
   full board-specific mathematical equations, source derivations,
   clock/history/terminal parity for KRK **and** KQK as already
   present for KK, KNK, KBK. Preserve those prior Maths panels
   at all times. Do not divert to KPK or Engines. The 50/75-move
   parity is secondary until constructive strategy closure,
   but it is not silently called complete.

## Exact latest handoff

- S026 merged-main was `f3bac9ab2ae76649d59a4ae9d924c9e05d854736`;
  post-merge Actions **41099570173 passed**. It confirmed
  deterministic monotone-clock-free KQK 105/120 mate-closed,
  15 capped, **0 hard failures** at 12,000 attempts, four per
  family, 2,500 nodes, 64 rounds. KRK 24/24 capped,
  0 hard failures at 2,500 nodes. Both are finite/inconclusive.
- S027 PR #36 adds one-reply **band-prepared** tokens for
  frozen `BandProgress.prepared_king_step` and
  `prepared_queen_step`, preserving the *original source frame*
  through every legal defender reply. Test coverage for both
  colours/eight frames, token forgery and exact capped position.
  See `docs/KQK27_PREPARED_SOURCE.md`.
- **Before quoting S027 improvements**, verify its final
  merged-main commit, successful CI, and exact **both-mode**
  KQK outputs (`--cache=exact` vs `--cache=monotone`), on the
  same fixed seed and family count. Compare per-family caps and
  failures, not just the overall closed tally.
- A **real KQK source cycle**, far-file oscillation, was fixed in
  S025; do not regress it. Backrank protected reply was fixed
  in S026; do not regress it.
- The initial S025 capped WeakToMove path:
  strong White K48 Q32, weak Black K35, Black to move;
  first cap K44 Q32 weak K12, White to move, token null.
  This state **does** have an explicit source action Q32–35
  (BandProgress.prepared_queen_step) and now a guarded one-reply
  continuation. It is **not** evidence of a missing first move.
  Trace full siblings or a genuine cycle/unsupported action
  before claiming a root-level fix.
- Latest largest KQK capped cohorts before S027:
  WeakToMove 4/8, FarFilePreparation 4/8,
  SameRankEntry 3/8. Use new S027 exact CI results to
  narrow this further.

## Execute next, prioritising controller closure

1. Inspect exact S027 merged-main CI and source-choice changes.
   Keep the fresh Prepared proof-frame token; replay at least one
   remaining KQK deep cap to identify an actual unsupported
   source branch or wrong branch/frame commitment. Distinguish
   wide all-reply resource explosion from a true error.
2. Where Lean actually specifies a missing all-reply action,
   port its precise geometric coordinate premise and its
   continuation token. Prioritise FarFileEntry continuation and
   SameRankEntry, then BandRaise/RankFive; include both colours,
   eight frames and all immediate legal replies. No guessed
   controller policy.
3. Investigate KRK's 24/24 capped *constructive phase trees*,
   using exact `krk14` nested tokens, immutable Lean source,
   and structural revisits vs distinct history contexts.
   Focus on a source-defined all-reply continuation/rank that
   closes an actual phase, not merely increasing maxNodes.
4. Re-run Node tests, frozen source-lock checks, syntax/build,
   adversarial KQK exact and monotone modes, bounded KRK trees,
   and Chromium Maths/Engines QA. Preserve start position, turn,
   legal replies, capture-to-KK, checkmate/stalemate,
   Undo/Restart and KK/KBK/KNK detailed proof workings.
5. If BOTH Stage A controllers truly close, begin Stage B
   **in the same execution session**. Otherwise be candid:
   sampled caps do NOT prove or refute global mating.
   Commit, PR, test final exact head, merge, confirm main CI,
   independently inspect Cloudflare and install S029.

Owner wants a **working mathematical strategy showcase**, not
endless new audit frameworks or an uncertified claim of perfection.
