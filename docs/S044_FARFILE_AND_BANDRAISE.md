# S044 — authentic far-file and band-raise premise correspondence

3 November 2026. **Playground-only audit, no runtime or upstream modifications.**
The immutable Lean reference is KQK EC-T0050
`c72365a8ba46f59114a2a77d9d38993f6a52df80`; KRK proof
`2311abe71bc1a4eed47026feccd5ba5a0760d5bb`,
KRK executable `e7de0930fc61caeb11795cf3c10fde11e4774a40`.

## Audited source constructions

`scripts/s044-source-premises.mjs` independently verifies the exact
source-selected, legal board move and **every immediate legal weak king
reply** for:

- `FarFilePreparation.far_file_preparation`:
  `gap`, `right`, `offKing`, `offWeak`, `notFar`; the
  **frozen escape witness** target `f = (escapeX == |qy-wy| ? 1 : 0)`
  (with `escapeX = wx == 7 ? 6 : wx+1`); legal queen transfer,
  reply existence, and the complete `3 ≤ weak.file`,
  `king.rank+1 ≤ weak.rank`, `2 ≤ dInf king weak`,
  `queen.rank != weak.rank` all-reply postcondition.
- The `BandRaise.king_cross` constructor: original framed
  `Prepared`, close/gap/far/low hypotheses, exact king
  move to `(weak.file,queen.rank)`, defender escape existence,
  and every-reply right/above/noncheck postconditions.
- The **non-corner** `BandRaise.prepared_raise_bound.queen_rise`
  continuation: only when the authentic `band-raise` token matches
  exact king/queen, frame and full ply identity. Checks exact
  `Q(queen.file,queen.rank+1)`, complete `Prepared` preservation
  after every weak reply, and the strict `bandPotential` margin
  against the uniquely reconstructed source king-cross root.
  Exceptional corner `knight_box_bound` is intentionally **not**
  authenticated by this checker.

All are read-only diagnostic correspondence checks; the runtime
`src/kqk-source-policy.js` chooses the actions, not the verifier.
An unknown source theorem is **unchecked**; a false implemented
premise is **failed-premise**; a different original/token frame is an
**unverified bridge**. They are never conflated. A genuine source
token is checked for board, side, reply-step and exact history.
No fabricated token, Stockfish, minimax, tablebase or fallback.

`scripts/s042-fresh-families.mjs` now reports named
`uncheckedBySource` counts by first, second or third source move,
with exact theorem and reason. The S043 original audit of eight legal
roots per family is still reproducible. The CI adds a separate,
wider **24 fresh legal roots per family** replay at 160 nodes / 32
attacking pairs, with `--full --strict` and uploaded exact root,
token, full move-history and weak-reply witnesses. Neither a
source-verified local step nor a capped full tree is called mate-closed.

## Starting verified S043 baseline

S043 [PR-head CI 41596372892](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/41596372892)
passed at `29973f16589b3b02aeed2629e3cfdd06f26c3384`.
Its merged-main [CI 41597337184](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/41597337184)
passed at `1e3a0908a1584302e711f13d394175d0174b60e3`.
The 8+8 original fresh roots saw 82 first and 440 second
legal weak replies. 288/288 separating-rank local source actions
were independently authenticated, 86 tight-above actions remained
unchecked, zero failed original implemented premises and 16/16
full trees were resource-capped. These are **bounded**, not universal
gameplay/certification facts.

## KRK upstream theorem boundary rechecked

At frozen KRK executable SHA, `KRKCentral/Prep.lean`
`prep_bound` proves a `MateWithin` upper bound using
`readyCost (7-rank)+prepCost (prepDistance rank king)`.
`KRKCentral/Restoration.lean` `restoration_bound`
takes a **supplied** `CentralBound σ y E` and gives `MateWithin σ (E+6)`
under its stated geometric premises. The symmetry theorem
`KRKForcing/StrategyTransport.lean` `krk_force_transport`
transports **ForceMate existence**, not the exact JavaScript
source-selected continuation. The S039 genuine
`PREP(rank=2) → central` witness and central/restoration re-entry
therefore remain a missing frozen all-reply *global* composition
proof over `(board, turn, full continuation token)`. These local
bounds must not be advertised as a decreasing controller rank.
A resource-capped game tree is not a constructive win proof.

## Exact session validation / release

Reproduce finite checks:

```sh
npm test
npm run verify:krk-sources
npm run audit:s042-fresh-families -- --per-family=8 --candidates=128 --nodes=100 --pairs=20 --strict --full
npm run audit:s042-fresh-families -- --per-family=24 --candidates=256 --nodes=160 --pairs=32 --strict --full
npm run check
npm run build
```

The workflow also runs all prior S035-S043, KRK/KQK adversarial
and rank audits, and both Chromium Maths/Engine browser suites.
## Measured widened S044 CI evidence

[S044 full-audit PR-head run 41625590512](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/41625590512)
**passed** at implementation SHA
`99e1f01cb4819259b093f744b4c4a4b228b21666`,
including the strict 8+8 baseline and strict **24+24** widened
source-replay steps, upload of full per-root JSON artifact, all
preexisting Node/source/rank/adversarial checks, npm check/build,
and both Maths and Engine Chromium suites.
The successful full predecessor implementation run was
[41625294326](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/41625294326)
at `1cbd4f88c813780030b7410b5e5a146a9ebc5e10`.

The actual counters below are ordered as
**first/second/third attacker source applications** after 0/1/2
legal defender replies. All cases used *genuine source moves and
tokens*; full trace JSON is uploaded as `s044-full-source-audit`.

| Fixed finite audit | Separating-rank | Tight-above |
| --- | ---: | ---: |
| Original roots (100 nodes, 20 pairs) | 8 | 8 |
| Original first / second defender replies | 40 / 240 | 42 / 200 |
| Original independently authenticated source applications | 8 / 40 / 240 | 8 / 12 / 200 |
| Original unchecked source applications | 0 / 0 / 0 | 0 / 30 / 0 |
| Widened roots (160 nodes, 32 pairs) | 24 | 24 |
| Widened first / second defender replies | 120 / 736 | 122 / 552 |
| Widened independently authenticated source applications | 24 / 120 / 736 | 20 / 12 / 552 |
| Widened unchecked source applications | 0 / 0 / 0 | 4 / 110 / 0 |
| Widened failed premises / missing actions / captures / nonmates | 0 | 0 |
| Widened full trees resource-capped | 24 | 24 |
| Widened full trees completely mate-closed | 0 | 0 |

**Exact remaining named unchecked instances in the widened audit:**

- **90 second actions:** `KQK.TightEntry.protected_file_entry.forward_wall`
- **4 first actions:** `KQK.SameRankEntry.backrank_entry.king_to_weak_file`
- **20 second actions:** `KQK.SameRankEntry.protected_backrank_entry.queen_up`

These are **missing independent full-premise checkers**, not falsified
Lean theorems or observed missing runtime moves. The remaining
widened 1,464 / 1,578 attacker source applications were independently
authenticated locally (880 separating-rank + 584 tight-above);
114 / 1,578 were unchecked. Across both widened families:
**242 first legal weak replies and 1,288 second legal weak replies**,
zero failed implemented premises, zero hard source gaps/captures/
nonmate outcomes/potential structural cycles, and **48/48 capped
all-reply trees**. The result does **not** certify global checkmate
or universal legal-root coverage.

The S045 handoff must first audit the three real named constructors,
their complete frozen Lean hypotheses and any authentic source-token
frame crossings, and separately investigate the upstream missing
KRK global controller composition theorem.
Final docs/handoff-only PR-head and merged-main CI are separate
runs and must be checked after those commits. Cloudflare Worker
deployment was not independently verified.

Release status: Stage A **open** for KRK and KQK; both remain
explicitly experimental. Stage B comprehensive mathematical
explanations and FIDE history/clock parity waits for complete Stage A
all-defender termination. Existing full, board-specific K/K, K+B/K,
K+N/K proof equations, derivation and history remain untouched; KPK
and Engine development deferred. Green GitHub CI does not establish
live Cloudflare Worker deployment.
