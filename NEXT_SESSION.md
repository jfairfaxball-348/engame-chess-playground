# S029 — genuine KRK/KQK continuation closure, then mathematical parity

**Execution session.** Work in
`jfairfaxball-348/engame-chess-playground`; inspect
`AGENTS.md`, `docs/KQK27_PREPARED_SOURCE.md`,
`docs/KQK28_HORIZONTAL_SOURCE.md` and current `main`.
Immutable parent `engame-chess` is READ-ONLY; KQK Lean lock
`c72365a8ba46f59114a2a77d9d38993f6a52df80`.

## Owner priority — binding

1. Complete **both KRK and KQK** simplified, actual all-defender,
source-derived mating strategies for every legal arranged root.
No external engines, tablebases, minimax, arbitrary first-legal
selection or invented proof translation in Maths; missing Lean
constructive action fails closed. Keep both colours, exact arranged
board, legal replies, captures to KK, checkmates and all old
KK/KNK/KBK detailed mathematical panels.
2. **Immediately when both strategies really close**, add full
board-specific derivations/equations/source links, legal outcome
semantics and FIDE clock/history parity to KRK **and** KQK as in
KK/KNK/KBK. Do not spend this session on KPK/Engine experiments.
Continue to mark uncertified controllers as experimental.

## Exact S028 handoff

- S027 main at `12164ae6d2f7a8d2fa8bcc4c98e99159bafcf425`,
  passed Actions `41127487084`.
- S028 PR [#37](https://github.com/jfairfaxball-348/engame-chess-playground/pull/37)
  squash merged `fd9f0e899ede84e2629cefb0fee46dd8193c1497`;
  Actions [41130916414](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/41130916414)
  passed **all Node, source locks, KRK/KQK adversarial, build and two
  Chromium suites**. Verify latest merged-main CI as well.
- New named source branch `OrientedEntry.horizontal_far_wall_entry`
  now uses **`wk.rank>=sk.rank+1`** rather than equality in the
  high-file narrow Q-to-six construction. Broader source-valid
  continuation exercised across colours, frames, legal weak replies.
  It did **not** improve bounded mate closure.
- **Identical S027/S028 bounded result:** KQK monotone 98/120
  mate-closed, 22 capped, 0 hard failures; exact 87/120
  mate-closed, 33 capped, 0 hard failures. KRK 24/24
  capped, 0 observed hard failures. These are finite inconclusive
  audits, neither universal proofs nor real counterexamples.

## Execute, not just instrument

1. **KRK first**: inspect `src/krk-tagged-strategy.js`,
   `src/krk-prepared-wall.js`, the immutable `krk14` nested
   continuation tokens and `scripts/krk14-mate-tree.mjs`.
   From an existing 24-root capped source tree identify the first
   *actual* repeated structural controller state, inconsistent
   history token or absent named proof continuation. Distinguish
   a large distinct-tree node cap from a true cycle. Only implement
   a concrete Lean-authorised step or ranking-decreasing phase.
2. **KQK next**: pick a remaining same-seed deep capped
   WeakToMove, FarFilePreparation or SameRankEntry path, not
   its already-solved first action. Follow actual sibling replies
   and frame/token commitment until an unsupported step or
   cycle is reproducible. Compare the frozen
   `FarFileEntry.far_file_stage_bound` case split with
   `farFileReply`, then implement a *named* source-specific
   continuation only if the missing branch is demonstrated.
3. For each change write a two-colour, eight-frame, all-immediate-
   reply regression with the exact first failing source position.
   Measure against the fixed S028 roots and both KQK cache modes.
   Reject mere extra token state or cap increases as progress
   without a demonstrated closure improvement.
4. Run full Node, source locks, KRK root/mate trees,
   KQK exact/monotone, syntax/build and both Chromium suites.
   Check all existing Maths panels and Engine isolation.
   Keep live Cloudflare verification separate from green CI.
5. Commit on an isolated branch, PR, verify exact-head CI,
   merge, confirm merged-main CI and install **S030**.
   If Stage A remains open, say so precisely, including
   which roots remain capped and whether genuine failures exist.

**Do not claim KRK/KQK universal strategy completion merely because
all sampled first moves are source-tagged or 0 hard failures were
observed.**
