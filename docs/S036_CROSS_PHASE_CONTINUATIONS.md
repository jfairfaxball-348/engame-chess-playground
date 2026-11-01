# S036 — bounded genuine-token cross-phase continuation audit

1 November 2026. Downstream Maths audit only; frozen `engame-chess`
mathematics source is read-only. No production selector, proof lock,
material release flag, legacy KK/KNK/KBK proof panel, KPK or Engine
arena was changed.

## What changed

`scripts/s036-cross-phase-audit.mjs` traces genuine legal
strong/weak move pairs beyond the S035 two-reply horizon. Every
strong action comes **only** from the existing
`kqkSourceChoice` or `krkTaggedStrongChoice`, with its authentic
prior continuation token passed through the actual intervening lone-king
reply. All legal defender replies at a visited state are enumerated;
node/pair caps are explicit and not confused with terminal mates.

For KQK, the entry comes from real `FarFilePreparation` actions
and their real weak replies. The selected first action is independently
authenticated against the **original-frame** frozen
`EntryGeometry.clear_low_wall_entry` or the separately proved
**switched-frame** `SameRankEntry.backrank_entry`; these are never
identified with one another. The same diagnostic separately starts
on legal already-far tight-above roots, without inventing a
preparation token.

For KRK, the 24 real source-family/colour/symmetry fixtures provide
replayable source-phase edges. The first observed central/restoration
handoff records the exact incoming board, original continuation token,
selected frozen-source rule and legal move. It is an **unproved
global-rank obligation** unless a matching frozen composition theorem
is subsequently located and checked. S035's prep-only strict
descent remains a local theorem; the new diagnostic does not
extrapolate it to restoration or central play.

The controller-aware repeat key omits monotonic provenance counters
but preserves nested source identity. Reported repeated structural
states are potential cycles, not FIDE-identical history states.
A `mate-closed` result is for the **single bounded root only**
and never the universal KQK/KRK selector. Any resource-capped,
unsupported, nonmate or repeated branch prevents a closure verdict.

## Reproduce

```sh
npm test
npm run verify:krk-sources
npm run audit:s035-source-bridges -- --strict
npm run audit:s036-cross-phase -- --nodes=200 --pairs=36 --prepared=4 --tight=2 --krk-roots=3 --strict
npm run check
npm run build
```

Continue running all S032–S035 source/rank audits, capped KRK/KQK
complete-game suites, exact and monotone KQK caching comparison, and
both Chromium browser suites in PR-head CI. The S036 strict flag
verifies successful probe instantiation; it DOES NOT fail expected
source gaps in an explicitly partial policy. Inspect individual
`verdict`, `firstProblem`, `firstCrossPhaseWitness`,
`crossPhaseEdges`, exact `token`, cap counters and mate leaves.

## What remains open

- KQK authentic ORIGINAL-frame separating-rank construction versus
  genuine reachability; general tight-above and horizontal source
  correspondence; all legal roots and all-defender full mating closure.
- KRK the first missing frozen source-backed well-founded rank for
  **central/restoration transitions** with nested continuation tokens.
- Both universal Stage A strategies still uncertified; thereafter
  restore full worked board equations, move provenance, and 50/75-move,
  repetition and history-aware Stage B parity to both, without
  touching existing KK/KNK/KBK derivations.

A green Actions run is **not** independent proof that the
Cloudflare Worker production deployment has updated. See
`NEXT_SESSION.md` for S037.
