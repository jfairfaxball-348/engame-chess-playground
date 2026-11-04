# S047 — exhaust KQK root classes and resolve the exact source-controller obligation

## Source of truth / inherited release restrictions

Read AGENTS.md, docs/S046_ALL_ROOTS_AND_TERMINATION.md,
docs/S045_SOURCE_CONSTRUCTOR_CLOSURE.md, and the exact latest
merged-main CI run before making changes. Verify latest Cloudflare
Worker HTTP/assets independently: GitHub green ≠ Cloudflare deployed.

Frozen and READ-ONLY source anchors:
- KQK EC-T0050: c72365a8ba46f59114a2a77d9d38993f6a52df80
- KRK EC-T0048: 2311abe71bc1a4eed47026feccd5ba5a0760d5bb
- KRK executable: e7de0930fc61caeb11795cf3c10fde11e4774a40

Owner priority remains Stage A: genuinely source-derived working
KRK and KQK controllers for ALL legitimately winning legal roots,
against ALL lawful weak replies, with correct handling for
already-drawn or capture-to-KK roots. NEVER add arbitrary legal,
Stockfish, tablebase, minimax or heuristic strong moves to Maths.
Do not enable certified material booleans from a bounded audit.
Keep K/K, K+B/K, K+N/K full positional maths working intact.
Stage B complete KRK/KQK explanations, derivation provenance and
history/clock FIDE parity begins immediately once both Stage A
controllers actually close. KPK/Engine development is not priority.

## Baseline exact facts from S046

S045 merged main at efa7f12342c05c80b50229fb7a358ab9a8752edd
and its merged-main Actions run 41679417394 completed successfully.
S045 local finite sample: 1,970/1,970 authenticated actions over
64 strong-turn fresh roots, 64/64 full trees resource-capped,
NONE global mate-closed. S046 adds:
- scripts/s046-root-census.mjs, a fresh-root census across both
  colours, BOTH strong-to-move and weak-to-move, eight D4 frames;
  original and source-selected frame/constructor kept distinct.
- strict separate counts of genuine immediate weak queen captures
  to certified KK draws, selector gaps, source premise checker
  verdicts and actual after-source continuation tokens.
- sampled 64 legal roots per colour/turn as CI diagnostic (256).
  An optional --full --shard=N/M scanning mode exhausts each shard;
  run EVERY shard to support an actual all-legal-root claim.
- test/s046-root-census.test.js: explicit LEGAL weak-to-move
  capture fixture White Ka1, Qd4, black Ke5, black to move,
  Kxd4 -> KK draw, all 8 symmetries and 2 colours = 16.
The literal demand that every possible legal KQK root is won is
FALSE, because some weak-turn roots directly capture an
unprotected queen. Recognize them as drawn, not a strategy
contradiction or a fictitious KQK forced win.

S046 PR #56: https://github.com/jfairfaxball-348/engame-chess-playground/pull/56
Inspect its exact resulting head, merged commit, checks and measured
artifact before quoting any new statistics. Do not reuse counts
from old S045 to claim S046 globally succeeded.

## Required execution next session

1. Verify S046 merged-main commit and all Node, source lock,
   S035–S046 finite audits, KRK/KQK adversarial/rank audits,
   npm check/build, both Maths and Engine Chromium suites.
   Verify live Worker HTTP and JS assets separately.
2. Execute S046 legal-root census across ALL four (strong colour,
   side-to-move) combinations, with all eight D4 orbits, by
   enumerating ALL 64^3 square triples per combination. Use
   independent deterministic shards if runtime is too high;
   save complete machine-readable output and shard accounting.
   Run in CI with manageable resource budgets or offline;
   never label an uncompleted shard full coverage. Distinguish
   legal drawn terminals, direct rook/queen captures, first
   source selector missing, forged/unchecked premises,
   original/theorem-selected frames and genuine weak replies.
3. If a missing selector is discovered, first reproduce its
   ACTUAL root/frame/history and exact source constructor.
   Only translate a named applicable frozen theorem branch
   with independently audited premises. No fake policy moves.
   Add adversarial colour/frame/token tests for any repair.
4. Attempt a real GLOBAL KQK all-reply source-bound/
   lexicographically decreasing rank over (board, turn,
   FULL source continuation token) accounting for all
   geometry families, changes of frame, band and edge entries,
   corner, shadow, preparations, and defensive replies.
   An empirical finite root census, all first replies or
   finite depth cap does NOT prove a global termination rank.
   If pinned Lean proves MateWithin existence only, identify
   the minimal NEW constructive selector/composition theorem
   needed UPSTREAM; do not invent Lean mathematics here.
5. Re-run genuine S039 KRK
   PREP(rankBefore=2)->central (16-24) and
   central->restoration (11-19), across every immediate weak
   reply with original nested krk14-strong-continuation token,
   original frame and actual legal history. Focus on source
   re-entry and the missing globally well-founded rank.
   Pinned prep_bound local MateWithin,
   restoration_bound conditional CentralBound and
   krk_force_transport existence alone are insufficient.
6. Keep honest terminal/partial/resource-cap/unverified
   counters. Maintain experimental KRK/KQK release gates
   and preserve all older maths panels. Commit/PR/merge
   only after passing PR-head CI; inspect merged-main CI.
   Install S048 based on measured new blockers.

## Certification threshold

To close Stage A, a documented *complete source-faithful
controller* must account for **all legal starting positions with
their correct win/draw outcome**, and on every root genuinely
winning for the stronger side must be guaranteed to checkmate
against every lawful weak reply. A sampled source premise success,
a source-rank fragment, a finite exhaustive ROOT scan, a tree cap,
an existence-level ForceMate theorem, or a claimed Worker
deployment are not equivalent to this certificate.
