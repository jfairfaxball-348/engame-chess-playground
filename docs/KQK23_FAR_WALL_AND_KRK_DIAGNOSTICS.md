# S023 — KQK narrow far-wall action and all-defender diagnostic precision

30 October 2026. Downstream Chess Playground only. Source: frozen
EC-T0050 (KQK) at `c72365a8ba46f59114a2a77d9d38993f6a52df80`.
**Stage A remains open**: this change does not certify a total strategy,
nor start Stage B FIDE history / full mathematical proof-panel parity.

## Frozen KQK action translated

`src/kqk-source-policy.js` now covers the explicit queen-to-file-six move
from `Rules/KQK/OrientedEntry.lean`,
`horizontal_far_wall_entry` (the high-file narrow outside-band case).
Its source premises include, in the selected frame, strong K file 5,
weak K file 7, a one-rank weak-king margin, queen/weak rank gap exactly
two, the queen outside the interior separating band, and queen not already
on file 6. The actual source step is `Q(6, q.rank)`, subject to the
existing rejection-only legality and K×Q safety checks. The earlier
`high_file_corner_entry` immediate-mate case retains precedence.

`test/kqk23-horizontal-far-wall.test.js` pins a legal concrete example
K(5,4), Q(0,7), k(7,5) and the literal Q(6,7) step in both colours.
No engine, tablebase, minimax or arbitrary legal fallback has been added.

## Replayable capped KQK position

`test/kqk23-cap-replay.test.js` reconstructs the *exact* first
node-cap trajectory from main CI 41053929263, beginning from a
legal Black-to-move root White K=a7 (index 48), White Q=a5 (32),
Black K=d5 (35). It checks every named source action and legal
defender reply along the recorded 14-half-move trace, maintaining
the actual continuation token and chess history. It deliberately
does NOT assert mate or invent an after-cap continuation.

## KRK: measured repeated work, not a proof gap

`scripts/krk14-mate-tree.mjs` now counts structural revisits
using the complete source-controller geometry key already used for
cycle falsification, but **never merges** branches merely because they
look the same structurally. It compares the actual incoming halfmove
and full position history when counting distinct-history revisits.
The stratified harness carries those metrics into individual per-frame
reports and an aggregate. Existing fail-closed source policy is untouched.

Exact initial S023 PR-head CI 41057127613 (green Node, source lock,
build and Chromium) measured:

| Diagnostic | Outcome |
|---|---:|
| KQK fixed-seed roots / closed all-defender mates / hard failures / capped | 55 / 37 / 0 / 18 |
| KRK stratified all-defender roots / capped / confirmed failures | 24 / 24 / 0 |
| KRK stratified tree nodes visited | 24,024 |
| KRK structural revisits | 20,010 |
| Of those, distinct-history revisits | 20,010 |
| KRK mating leaves actually observed | 9,724 |
| KRK legal weak replies examined | 24,758 |
| KRK maximum observed defender branching | 8 |

The much larger first KRK root traversal (40,000 cap) saw 39,625
structural revisits, each with a distinct history. This strongly
indicates substantial combinatorial repeated work, but never licenses
a clock/history-blind subtree memo. Reusing an apparently winning
position with a different incoming history would risk hiding FIDE
repetition or the selector's history-sensitive continuation validation.

The unchanged KQK seed still yields 37/55 closed with 18 caps.
The most persistently capped families in that baseline were:
`FarFilePreparation` (0/4 closed), `SameRankEntry` (0/4),
`WeakToMove` (1/4). These are **inconclusive**, not demonstrated
errors. The new narrow horizontal phase is an additional covered
witness, not a claimed fix for the baseline 18 caps.

An additional expanded CI tier now runs KRK 24 roots at 2,500
nodes each, and KQK seed 12,000 attempts / 4 per source-colour
family / 2,500 nodes / 64 rounds. Treat its real exact-head
numbers (not estimated results) as the successor session's input.

## Remaining

- Distinguish unsupported continuations from resource caps using
  late-state replay, especially the frozen `FarFileEntry`,
  `SameRankEntry`, and `TightEntry` cases.
- Any KRK memoisation must preserve correct history-sensitive
  selector behaviour and avoid treating different histories as
  equivalent; investigate safe diagnostic abstractions separately.
- Universal, adversarial legal-root strategy completion for **both**
  KRK and KQK is still an open release condition.
- Once both simplified controllers truly complete, immediately
  restore full board-specific Maths proofs/working and official
  history/clock/terminal parity **for those two**. Do not regress
  the already detailed KK/KBK/KNK panels.
