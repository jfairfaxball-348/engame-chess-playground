# KRK10 — Quantified tagged central policy to mate

29 October 2026. Isolated, unreleased draft stacked on KRK09.

## Verified mathematical result

[Parent PR #11](https://github.com/jfairfaxball-348/engame-chess/pull/11)
adds `KRKExecutable/CentralPolicy.lean` at immutable source
`2433df9ea1ccbba000740cb89f2f0f276ce65d37`.
[Full Lean/axiom CI #40933068414](https://github.com/jfairfaxball-348/engame-chess/actions/runs/40933068414)
passed. The focused local build passed 91 targets. The three main
declarations print only `propext`, `Classical.choice`, `Quot.sound`.

`CentralChoice` fixes each guarded action's actual source coordinate and
successor tag. `CentralRoute` accounts for zero-ply control dispatch.
`CentralRun` includes every legal defender reply and counts both players'
actual plies. `centralRun_mateWithin` connects this selected-coordinate
derivation to the kernel's mate predicate.

`policy_uncut_central_bound` composes full central, fixed-orientation lower,
upper/aligned exit, post-lift restoration and final centre alignment. It
includes aligned narrow-rook rescue and upper-band rook repair. The
height induction now proves actual mate under these selected coordinates,
rather than borrowing a separate existential winning strategy.

The domain is a full central wall: strong king file 3 or 4, exactly one
rank below the rook, weak king strictly above the rook, strong side to
move. It is a static kernel game; history claims are not certified.

The proved bound is `18*((7-y)-1)+11`, where `y` is the 0-based rook rank
in the chosen proof frame:

| Rook rank y | Maximum proved plies |
| --- | ---: |
| 1 | 101 |
| 2 | 83 |
| 3 | 65 |
| 4 | 47 |
| 5 | 29 |
| 6 | 11 |

`policy_uncut_rankTwo_run` consequently bounds the actual selected policy
by 83 plies whenever the wall starts at rank 2 or higher.

## Downstream integration

`krkCentralStaticBound` exposes this precisely scoped source bound to
diagnostics. It explicitly returns `coversFIDEClaims=false`,
`isCompleteWinningPolicy=false`, `maxMatePlies=null`. It never changes a
gameplay gate or moves the arranged pieces. The all-reply audit now rejects
a tested trace exceeding its source-derived static bound.

`proof-sources/krk10-central-policy.lock.json` pins this module and its 14
source dependencies separately from KRK09 and the original frozen theorem
lock. `npm run verify:krk-sources` checks all three locks. Tests cover every
bound in both colours/four frames, immutable input state, invalid roots
and corrupted source rejection. All 137 local Node tests pass.

## Exact release boundary

The 101-ply bound at rank 1 does **not** establish a 50-move-safe policy.
The parent's stronger full-central 85-ply proof uses protected cut phases;
the current JS dispatcher does not select those phases. Do not apply the
85/95/97/98-ply outcome bounds to this uncut dispatcher. Conversely, 101
is an upper bound, not an example requiring 101 plies or a counterexample
to a tighter bound.

The next obligation is either a sharper bound on this same selected policy,
or faithful source-derived cut continuations with their quantitative bound,
followed by all legal root setup and fresh-history repetition/clock proofs.
Arbitrary history/clock guarantees are not established. Node-capped reply
trees remain inconclusive.

KRK gameplay stays disabled. Drafts are not merged; production, parent
main, KQK/KPK and frozen sources are unchanged.
