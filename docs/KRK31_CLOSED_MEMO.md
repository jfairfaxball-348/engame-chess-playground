# S031 — KRK history-sensitive closed-subtree memo: measured no gain

31 October 2026. Downstream audit only, PR #40. Frozen Lean sources and
live Maths/Engine move selectors untouched.

## Why this session investigated memoization

S030 showed **96/96 deterministic KRK deep spines reached real checkmate**
within 80 attacking turns, but the 24 source-family/colour/frame
all-defender trees all capped at 2,500 nodes. The all-reply explosion
is not evidence of a missing source move. It is also not an all-reply
mating certificate.

S031 added an optional, **closed-only** memo to
`scripts/krk14-mate-tree.mjs`, propagated its counters into the KRK15
stratified audit, and compared its output against the original uncached
audit on the exact same roots and resource limits.

## Key and safety contract

A cached state includes:
- full board and side to move;
- **complete** nested KRK continuation token, including authentication
  counters; no source control fields are projected away;
- halfmove clock, history and move-log lengths, first and penultimate
  history keys (the source rules authenticate the preceding action);
- the **entire multiset of position-key repetition counts**, so fivefold
  automatic termination and the local threefold claim guards are
  reproducible.

The JS chess rules and source phase continuations only consult the
position repetition multiplicities, the current and immediate prior
position, the clock, counters and the source token; the memo intentionally
does not equate states with different decision-relevant histories.
An active source-state cycle check runs **before** a memo lookup. Only
after all legal weak replies have actually terminated in mate is the
current subtree inserted. A capped, unsupported, captured-rook, non-mate
or cyclic branch cannot be stored or reused.

This is a **diagnostic finite-state equivalence for the current JS
implementation**. It does not establish complete FIDE parity (claim
availability and other full semantics remain Stage B) and cannot
formally verify the underlying source selector.

## Exact measured comparison

[First S031 PR-head Actions #41193610334](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/41193610334)
passed Node tests, syntax/build, source locks, the existing KRK/KQK audits
and both Chromium browser suites.

At 24 deterministic KRK roots × 2,500-node budget, 160-ply cap:

| Metric | Original memo off | History-sensitive closed memo |
| --- | ---: | ---: |
| All-defender trees closed | 0 | 0 |
| Resource capped | 24 | 24 |
| Genuine failures | 0 | 0 |
| Nodes counted | 60,024 | 60,024 |
| Actual checkmate leaves reached | 24,544 | 24,544 |
| Closed-subtree memo entries | 0 | 35,094 |
| **Closed-subtree memo reuses** | **0** | **0** |
| Distinct-history structural revisits | 54,948 | 54,948 |

Every structural revisit in the capped audit had different incoming
clock/history data. Despite tens of thousands of finite closed branches,
this conservative, rule-aware key yielded **zero reuse** and no progress
toward full-tree closure. The uncached implementation therefore remains
the **default**, preserving performance. `--memo=history-counts` is
retained only as an explicitly selected diagnostic; CI tests both modes
at identical budgets.

Do **not** weaken history equivalence merely to report more cache hits,
or claim resource caps are successes. Work on a *source-justified*
termination/rank composition or identify a concrete frozen Lean
branch that is absent from the controller.

## KQK control

The same exact seeded KQK audit remained unchanged:
- Monotone memo: 98/120 mate-closed, 22 capped, 0 falsified.
- Exact-depth memo: 87/120 mate-closed, 33 capped, 0 falsified.

The frozen `FarFileEntry.far_file_stage_bound` source at SHA
`c72365a8ba46f59114a2a77d9d38993f6a52df80` proceeds in four
ordered cases: (1) separating rank wall; (2) direct small-file wall;
(3) horizontal far wall; (4) tight-above entry. The current JS
`farFileReply` verifies the original frame's broad hypotheses but then
iterates several existing source actions across eight frames. That is a
**case-correspondence obligation**, not yet a demonstrated counterexample.
No new KQK action was introduced in S031.

## Next obligation

S032 should reject speculative caching as the primary KRK approach.
Find an exact source-derived phase/rank certificate that can close all
weak replies or isolate a genuine missing source branch, and explicitly
audit all four KQK FarFileEntry branches in the **original preparation
frame**. Preserve S030 deep spines and KQK 32/32 fixed lines.
Neither KRK nor KQK Stage A is universally closed, so Stage B
mathematical explanations / full 50/75-move, repetition parity
immediately follows Stage A rather than being falsely advertised now.

Check `NEXT_SESSION.md` for the executable handoff.
