# S029 — KQK wall-preparation recursion follows frozen Lean potential

31 October 2026. Downstream Chess Playground only; immutable upstream
KQK proof EC-T0050 at `c72365a8ba46f59114a2a77d9d38993f6a52df80`.

## Concrete translation gap

In frozen `formal/EndgameChess/Rules/KQK/BandEntry.lean`,
`wall_prepare_bound` inducts on
`preparationPotential sk qs = qs.rank - 1 - sk.rank + |sk.file - qs.file|`.
When the king is not yet Prepared, `preparation_step` takes an exact
vertical king step, or a horizontal step toward the queen's file, and proves
that the potential decreases **by exactly one**. The subsequent weak-king
reply leaves the king/queen coordinates untouched; the proof continues
`wall_prepare_bound` in that **same source orientation**.

The former JS `bandChoice` emitted a bare king move and discarded its
orientation after the legal weak reply, so the global source dispatcher
could select a different source frame or branch instead of the inductive
continuation.

S029 emits a `band-wall-prepare` one-reply continuation token from both
named king actions; `bandWallPrepareReply` checks the actual weak reply,
the original wall and OpenBand hypotheses, and the exact identity

`potential(after weak reply) + 1 = potential(before strong step)`.

A mismatch fails closed. Once Prepared is reached, the existing
BandProgress/RankFive/BandRaise actions take over; these continue to be
source-derived. No new chess move, minimax, tablebase, engine, answer
lookup, or arbitrary legal fallback has been introduced. Source-selection
verification remains experimental and does not claim global termination.

## Regression and audit

`test/kqk29-wall-potential.test.js` transforms a known separating-wall
root under all eight queen-board isometries and both colours, checks
first and second source moves over **all immediate lawful weak replies**,
ensures potential strictly decreases, and rejects a forged token with
an inconsistent potential.

Release gates:
- Run complete Node tests, immutable-source checks, KRK root/continuation/
  stratified all-defender audits, both fixed-seed KQK cache modes, build,
  and BOTH Chromium QA suites.
- Compare the same **120 KQK roots**, 2,500 nodes and 64 rounds against
  S028 (monotone **98 closed / 22 capped / 0 falsified**; exact
  **87 closed / 33 capped / 0 falsified**).
- KRK S028 control: **24/24 capped**, no hard failures. A cap is not a
  strategy failure or a checkmate proof.
- Green CI is not evidence of live Cloudflare Worker deployment.

This is a direct proof correspondence correction. **Do not call it a
closure improvement until the fixed-seed audit actually shows one.**

## Remaining blockers

Both KRK and KQK Stage A remain open until all legal user-arranged roots
are covered by a source-authenticated, all-defender mating continuation
rather than merely an available first move or finite sampled successes.
Full KRK/KQK mathematical working and official history/clock parity are
Stage B, to begin immediately when *both* Stage A strategies close.
Preserve completed KK/KNK/KBK mathematical panels; do not start KPK or
Engine training as the next milestone.
