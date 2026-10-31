# S030 — KRK deep proof-phase spines and KQK controller-aware audit

31 October 2026. Downstream Chess Playground only; frozen source locks
remain unchanged. PR #39. No live Maths controller, Engine tab, existing
KK/KNK/KBK proof UI or upstream Lean files were changed.

## KRK: genuine depth vs capped all-defender breadth

The prior KRK15 all-defender falsification, even at 2,500 nodes/root,
stopped at the resource limit on all 24 source/colour/frame roots:
**0 complete / 24 capped / 0 genuine failures**. This is exponential
branching, not a counterexample. Root moves and many mate leaves are valid.

S030 adds a separate, deterministic deep-spine test:
scripts/krk30-spine-audit.mjs. It replays **only**
krkTaggedStrongChoice moves; four stable legal defender schedules
(first/middle/last/alternating) are **diagnostic**, never Maths policy.
Each spine retains exact real histories, the full nested controller token,
phase/provenance and board key. A return to a repeated board+controller
reports whether the FIDE history is identical, without treating geometric
transpositions as interchangeable clock histories. No fallback exists.

On the first PR-head [Actions run #41187774682](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/41187774682)
all **96/96** sampled deep spines terminated in **actual mate** within
80 attacking turns, 0 missing phases or non-mate endings. Node tests,
source locks, exact audits, syntax/build and both Chromium suites passed.
This is strong evidence that previously inconclusive KRK trees suffer
a *branch-width/resource* barrier for those fixtures, NOT a proof of
all-defender closure, all legal roots or FIDE certification.

The live attacking controller is unchanged.

## KQK: distinguish source-controller cycles from bare board recurrence

S029 merged-main [Actions #41183631312](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/41183631312)
passed. Its fixed 120-root KQK results remained **98 mate-closed /
22 capped / 0 falsified** (monotone) and **87 / 33 / 0** (exact).
S029's new BandEntry wall-preparation token was a source-fidelity
repair, not a measured global closure advance.

The older KQK20 fixed-first-defender line audit reported a board-only
"cycle" for strong white K=7, Q=58, weak K=9 (31/32 lines mate).
That diagnostic used only the **board position**, ignoring the active
proof continuation. A board revisited under a different source token is
not a repeated deterministic controller state. S030 therefore uses a
projection of the **complete** token, including rankBefore for the
frozen BandEntry induction, omitting only monotonically changing
moveCount provenance. It now records board-only geometric revisits
separately. The bounded KQK21 diagnostic uses the SAME stronger key
for active-cycle detection and all-closed cache reuse; no capped/failed
branch is cached. This is a test-only reliability correction, not a
new or proven KQK strategy or FIDE history equivalence.

For subsequent implementation, frozen EC-T0050
FarFileEntry.far_file_stage_bound is an explicit four-case proof:
(1) separating rank wall, (2) small-file direct wall,
(3) horizontal far-wall, (4) tight-above entry. JS farFileReply
must be compared branch-by-branch in its ORIGINAL frame, not assumed
faithful merely because it finds some legal source-tagged move under a
different symmetry. This is a verification obligation, not yet a
demonstrated move-selection mismatch.

## Release gate and next action

Stage A (complete all-defender, every-legal-root source-derived KRK and
KQK mating controllers) remains **OPEN**; deep-spine successes and
bounded cache closures do not establish global strategy termination.
Stage B follows IMMEDIATELY after both Stage A strategies finish:
restore full worked positional maths, equations, source provenance,
repetition and 50/75-move rule-aware parity to KRK/KQK as already
available for KK/KNK/KBK. KPK and engine research remain deferred.
See NEXT_SESSION.md (S031). A green Actions run does not independently
verify the Cloudflare Workers production URL.
