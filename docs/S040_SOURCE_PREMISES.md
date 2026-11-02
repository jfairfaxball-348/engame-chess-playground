# S040 — Independent frozen-source KQK third-action authentication

2 November 2026. Downstream diagnostic work only. Frozen upstream
KQK EC-T0050 at `c72365a8ba46f59114a2a77d9d38993f6a52df80`;
KRK EC-T0048 and its executable source stay unchanged.

## Why S040 exists

S039 established **214 actual third attacker moves** after every legal
second defender move across 10 authentic FarFilePreparation roots, but
had **no independent full-premise checker** for those four selected
Lean rules. The absence of a checker was not proof failure. S040
checks those source actions separately from the move controller:

- `BandEntry.wall_prepare_bound.horizontal`: original framed
  Wall and OpenBand, exact non-ready king-to-queen-file step,
  `preparationPotential` decrease by one, and Wall/potential
  preservation after **each** actual legal weak reply.
- `BandProgress.prepared_king_step`: complete Prepared
  structure, file gap, exact king step, band potential decrease at least
  two, and Prepared/noncheck preservation for every legal defender.
- `BandProgress.prepared_queen_step`: Prepared, close, gap
  and notCorner premises, exact Q(weak.file−1,queen.rank), potential
  decrease, reply existence and all-reply preservation.
- `RankFive.rank_five_corner_bound`: its five coordinate
  premises and the proof's exact first move Q(5,5). This is first
  source-constructor authentication, **not** a proof of every later move.

For all four: actual chess legality, source frame, real incoming
nested token/ply identity, no immediately lost queen, and exact
four-ply move-history reconstruction are checked independently.
Unknown or missing complete checkers are **unchecked**, not failed;
a false premise is a separate replayable failure.

Run:

```sh
npm run audit:s040-premises -- --tuples=1600 --prepared=10 --nodes=320 --pairs=56 --krk-roots=4 --strict
npm run audit:s040-premises -- --tuples=1600 --prepared=10 --nodes=320 --pairs=56 --krk-roots=4 --full
# Optional larger-budget cap-pressure experiment on the SAME roots:
npm run audit:s040-premises -- --tuples=1600 --prepared=10 --nodes=640 --pairs=112 --krk-roots=4
npm run audit:s040-premises -- --tuples=1600 --prepared=10 --nodes=1280 --pairs=224 --krk-roots=4
```

The S039 replay retains the **original**, untransformed legal board,
source-selected symmetry frame, two distinct real defender replies,
all four actual plies and exact tokens. The S040 replay independently
rebuilds it and checks correspondence before auditing source premises.

## Scope and release gate

This audit supplies local source-lemma premise/constructor evidence. It
does **not** make the bound-capped mate trees into completed games,
certify an exhaustive selector from every legal setup, or prove a
well-founded cross-phase KRK central/restoration rank. It does not
modify KQK/KRK runtime selections, KK/KBK/KNK worked maths panels,
KPK, or the separate Engine playground.

Stage A stays open until all legal roots and all adversarial histories
have a genuine proved terminating source controller. Stage B afterwards
restores full KRK/KQK derivations and accurate FIDE history/clock parity.
A green GitHub Action is not proof of Cloudflare Worker deployment.
