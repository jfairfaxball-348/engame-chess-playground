# S048 — triage completed exhaustive KQK root census and source termination gaps

## Baseline and source locks

Read AGENTS.md and docs/S047_EXHAUSTIVE_ROOT_SHARDS.md, then inspect
the **actual** S047 pull request, its head CI, all 16 shard results,
the verified S047 merge artifact if produced, and merged-main CI.
Do not claim a full census on the strength of a workflow definition;
each of the 16 jobs and the shard-merger must complete successfully.
Verify live Cloudflare Worker HTTP/assets INDEPENDENTLY; CI green does
not mean Worker production has deployed.

Pinned READ-ONLY upstream proof sources:
- KQK EC-T0050: c72365a8ba46f59114a2a77d9d38993f6a52df80
- KRK EC-T0048: 2311abe71bc1a4eed47026feccd5ba5a0760d5bb
- KRK executable: e7de0930fc61caeb11795cf3c10fde11e4774a40

Owner Stage A remains highest priority: a genuinely source-derived,
complete winning KRK and KQK controller, for each legitimately
winning legal root against ALL lawful weak replies, and correct
drawing/capture-to-KK roots. Never insert arbitrary legal, heuristic,
tablebase, Stockfish, minimax or engine moves into Maths. Never
promote material certification booleans based on a finite audit.
Preserve K/K, K+B/K, K+N/K's fully working positional maths
explanations and the isolated Engine arena.

## S047 scope (verify results before reporting them)

S047 introduces scripts/s047-merge-root-shards.mjs, its dedicated
unit tests, and a separate workflow:
.github/workflows/s047-exhaustive-roots.yml.

It requests exactly 16 full, disjoint S046 census shards, each
16,384 raw labelled (strong king, queen, weak king) square triples
PER colour/turn combination, with all eight D4 root frames and
all real immediate legal weak replies. Total target when **every**
shard succeeds: 262,144 raw triples PER group and 1,048,576 raw
triples across four colour/turn groups. The merger rejects missing,
duplicate, incomplete, mis-scoped or internally inconsistent shards.
Per-shard distinct D4 orbit numbers cannot be added to get a
global unique D4 count, and full root enumeration cannot prove
all-plies token-bearing source-controller mate termination.

S046 already contains a true legal direct queen capture to KK draw
(White Ka1, Qd4, black Ke5, Black to move, ...Kxd4), including both
strong colours and all eight symmetries. A claim that EVERY legal
KQK root is winning is false. Identify genuinely won and drawn
root classes separately, without conflating root legality or move
source authenticity with an ultimate win certificate.

## Measured S047 baseline for S048

All 16 exhaustive shards and the finite root merger passed on PR
[run 41823395559](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/41823395559):
**1,048,576** square assignments; **736,904** legal KQK starting
boards; **289,016** strong-to-move and **447,888** weak-to-move;
**728** terminal mates and **1,744** stalemates at roots;
**44,352** immediate legal weak queen-capture moves to KK.
Every one of the **289,016** ongoing strong-turn roots had a
source-selected initial move; zero initially missing/illegal, but
**116,688** first source actions still lack complete independent
premise authentication (others 172,328 authenticated).

The initial complete scan exposed **80 false-negative checker
failures** in KQK TightEntry file-six edge wall. The frozen Lean
`TightEntry.lean` proof explicitly uses
`edge_wall_weak_open_bound` for king file five/weak file seven.
S047 fixed the independent checker, preserved runtime, and added
a genuine source-token/two-ply regression for both colours.
[Post-fix full scan 41824441006](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/41824441006)
passed **all sixteen shards and merger with zero failed premises**.
Measured immediate continuation checks per strong-turn group:
518,002 authenticated / 101,718 unchecked; per weak-turn group:
534,918 authenticated / 342,122 unchecked. No missing follow-source
moves found. These are all IMMEDIATE move layers only, not a
global mate tree. Read full records in docs/S047_EXHAUSTIVE_ROOT_SHARDS.md.
If new PR-head checks supersede these runs, verify the latest
HEAD results and corresponding artifact before closing.

## Required S048 execution

1. Check S047 PR-head AND merged-main Node, frozen source-lock,
   S035-S047 audits, browser Maths and Engine Chromium, npm
   check/build. Retrieve the S047 merged full-census artifact.
   If any shard failed or timed out, rerun/partition that exact
   shard and explicitly mark overall coverage INCOMPLETE until
   the verified final aggregation has every residue index.
2. Publish **measured** complete finite root counts only from the
   artifact: legal roots per colour/turn, root mate/stalemate/
   ongoing, initial genuine source-selected/missing/illegal,
   selected original vs theorem frames, independently verified/
   unchecked/failed named premises, all immediate weak replies,
   actual immediate queen-to-KK captures, post-strong first
   defender captures, and source continuation outcomes. Different
   root classes and resource caps must never be silently combined.
3. For the first confirmed **actual** missing source root or
   false premise, reproduce the exact full board, original
   frame, selected frame, strong colour, turn, source constructor,
   legal defender reply, and genuine continuation token. Seek a
   named frozen source theorem that truly applies; translate only
   its independently audited constructor/premises. Add targeted
   D4/colour/turn/token adversarial regression. If no source
   hole, prioritize global termination rather than more shallow
   samples.
4. Try to formulate a genuinely well-founded KQK **all-reply**
   measure for (board, turn, FULL source continuation token)
   including preparation, band, far-file, rank, protected
   backrank, corner/shadow, and transitions between original
   and theorem-selected frames. Distinguish a complete
   theorem from merely having finite source-selected moves.
   If pinned Lean proves only MateWithin existence, identify
   exact smallest missing upstream constructive composition/
   extraction theorem. Do NOT manufacture an unproved rank.
5. Revisit actual S039 KRK PREP(rankBefore=2)->central (16-24)
   and central->restoration (11-19) with real nested
   krk14-strong-continuation tokens, exact board/frame/history
   and ALL legal immediate defender replies. Source PREP local
   MateWithin, restoration conditional CentralBound and
   force_transport existence do NOT certify a cross-phase
   lexicographically decreasing policy.
6. Keep material Stage A gates experimental/open unless **all**
   legally winning roots are source-faithfully covered through
   mate against all legal defender replies and have an
   authoritative global termination certificate. After both
   Stage A controllers truly close, immediately prioritize
   full KRK/KQK maths derivations, provenance and FIDE
   history/clock parity (Stage B). KPK and Engine research are
   deferred. Commit/PR/merge after green PR-head checks,
   verify merged-main CI, install S049 from measured results.

## Close-out requirement

Separate: (A) complete finite starting-board census,
(B) checked immediate source actions and legal weak replies,
(C) complete source-derived all-depth controller,
(D) proof of global termination and rule/clock parity,
(E) verified Worker deployment. None implies the others.
