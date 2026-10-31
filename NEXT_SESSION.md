# S035 — source-exact KQK complete lines and first KRK rank bridge

**Execution session: implement, test, commit, merge, verify and install S036.**
Working repository ONLY: https://github.com/jfairfaxball-348/engame-chess-playground .
Parent https://github.com/jfairfaxball-348/engame-chess is READ-ONLY.
Read AGENTS.md, docs/S033_SOURCE_CORRESPONDENCE.md,
docs/S034_REACHABILITY_RANK.md, scripts/kqk34-reachability.mjs,
scripts/krk34-rank-obligations.mjs and PR #43 before editing.

## Owner priorities and source locks

1. Make both KRK and KQK play from EVERY legal user-arranged root against
   EVERY lawful weak reply, mating through real source-derived strong
   actions. No engine/tablebase/minimax/heuristic/first-legal fallback,
   invented token/rank or uncited symmetry. Fail closed where unsupported.
2. Immediately after BOTH Stage A strategies are genuinely complete,
   complete BOTH Stage B engines to KK/KNK/KBK maths parity: board-specific
   equations, derivations, move proof provenance, 50/75-move clock and
   repetition history and verified terminal outcomes. Keep existing
   KK/KNK/KBK worked panels; do not start KPK or unrelated Engine work.
3. KQK EC-T0050 SHA c72365a8ba46f59114a2a77d9d38993f6a52df80;
   KRK EC-T0048 2311abe71bc1a4eed47026feccd5ba5a0760d5bb;
   KRK sourceCommit e7de0930fc61caeb11795cf3c10fde11e4774a40.
   MATERIAL.krk.playable and MATERIAL.kqk.playable remain false until certified.

## Current evidence and exact open obligations

- S033: four authentic FarFilePreparation roots, 24 lawful
  post-preparation replies; all 24 chose independently authenticated
  SameRankEntry backrank actions in another proven frame. All were
  horizontal-far-wall in the original frame: NOT a four-case proof.
- S034: deterministic bounded canonical legal-root probe plus authentic
  S025 fixtures, preserving actual FarFilePreparation tokens; replay
  first and second legal weak replies. Reports original cases, real
  witnesses, missing sources and independent-frame verification.
  **Tight-above cannot arise immediately after preparation**:
  source weak rank >= strong king rank+2, queen rank != weak rank,
  and weak king can change rank by only one. Cover tight-above via
  genuinely legal already-far-file roots, NOT forged tokens.
- KRK S033: 24 roots -> 168 first weak replies -> 980 second weak
  replies -> 980 source-tagged third moves. Global descending rank
  still missing. S034 groups all second-source tags and successor
  branches: the graph itself is NOT a proof of termination.
- Frozen KRKWinning.Policy.winning_policy uses Classical.choose;
  StrategyTransport carries ForceMate existence. Neither implies
  the concrete JS tagged action decreases a verified board/token
  measure across setup/nonwall/prep, central and restoration.

## Do in S035

A. **KQK literal source action closure.** Inspect real report from
   npm run audit:kqk-original-cases -- --legal=6000 --prepared=64.
   For genuinely reached separating-rank, direct-small-file and
   horizontal-far-wall cases, authenticate the EXACT first ORIGINAL-frame
   constructive action and continue all lawful defender replies.
   For absent cases, expand admissible source-root strata; don't
   call bounded absence a proof of impossibility. Authenticate
   every non-backrank cross-frame chosen theorem against its own
   pinned prerequisites, exact target and queen safety. Build an
   independent legal already-far-file tight-above continuation.
   Only add source moves when a replayable gap and exact frozen
   construction justify them; forbid repeat preparation cycles.

B. **KRK compositional rank bridge.** Inspect
   npm run audit:krk-rank-obligations and the exact incoming source
   tokens in two-layer phase registry. Pick a concrete named source
   phase transfer, check the frozen premises and all lawful weak replies,
   and seek a source-backed board+token strict rank. If unavailable,
   isolate the FIRST missing upstream frozen-source lemma with board,
   move, token and theorem name; do not invent a rank. No raw budget
   escalation as a replacement.

C. Run npm test; npm run verify:krk-sources; npm run check;
   npm run build; all old KRK and KQK root, phase, spine,
   adversarial, first/second edge, source-case and complete-line
   audits, both Chromium suites. Compare identical seed/cap settings
   for monotone and exact KQK. Preserve user-placed starting position,
   legal turns, both colours, capture-to-KK, undo/new position,
   maths panels and isolated Engine tab. Clearly separate mating
   leaves, capped trees and genuine failures. No finite sample
   establishes universal proof.

D. Commit branch, PR-head CI, merge/fast forward after validation,
   merged-main CI, precise docs, install full S036. Never claim
   GitHub CI proves a Cloudflare production deployment.

Sequence is BOTH Stage A -> BOTH Stage B, before KPK/other research.
