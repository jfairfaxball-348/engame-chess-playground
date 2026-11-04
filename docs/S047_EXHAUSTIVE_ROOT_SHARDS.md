# S047 — exhaustive finite KQK root census, without false all-plies certification

4 November 2026. Audit only. Frozen KQK EC-T0050 source SHA:
`c72365a8ba46f59114a2a77d9d38993f6a52df80`.
Read [S046](S046_ALL_ROOTS_AND_TERMINATION.md) and AGENTS.md first.

## New execution

The S046 source-faithful ROOT census already distinguishes:
- two strong-side colours and both possible sides to move;
- actual legal KQK boards vs overlapping/otherwise illegal triples;
- real immediate queen captures to KK draw vs ordinary weak replies;
- first missing/illegal source actions, theorem premises independently
  authenticated/unchecked/failed, actual selected frames and rule names;
- genuine source-emitted tokens vs fabricated continuations;
- terminal mate/stalemate from an ongoing root.

S047 adds a **separate** GitHub Actions workflow that runs the existing
`scripts/s046-root-census.mjs --full` across sixteen nonoverlapping
residue shards. Every shard inspects exactly 16,384 raw labelled
K/Q/k square triples **per** (strong colour, side to move) group.
A complete set therefore inspects **262,144** raw triples per group
and **1,048,576** across all four groups. Every shard runs the
existing default immediate-reply inspection; this is more than the
original 64-legal-roots-per-group finite sample.

`scripts/s047-merge-root-shards.mjs` refuses a missing or duplicated
shard, an unfinished shard, an incorrect residue count, a mismatched
source lock/scope, broken root-outcome or independent-checker count
partitions, or an inflated proof flag. It sums separate colour/turn
strata and preserves each shard's first exact source-gap witness.
Machine-readable individual shards and the full finite aggregation
are uploaded as Actions artifacts.

**D4 orbit caution:** the same canonical root orbit can occur in more
than one shard. The sum of within-shard distinct orbit counts is
explicitly named `sumPerShardD4OrbitCounts`; it is **not** a
global unique-orbit count. Original and selected source frames remain
separate. A full finite root enumeration cannot prove the source
controller has a terminating all-weak-reply game tree.

## Run and interpret

1. PR-head CI: `Playground checks` must still pass Node tests,
   frozen proof locks, old source/adversarial tests, build, Maths and
   Engine Chromium suites.
2. Separate workflow: `S047 exhaustive KQK roots (diagnostic only)`
   must pass **all sixteen root-shard jobs** plus the merge job before
   claiming complete finite root enumeration.
3. Download the `s047-complete-finite-root-census` artifact. Publish
   actual counts of legal roots, root terminal outcomes, immediate
   legal weak queen captures, first source gaps, independently verified
   premises vs unchecked/failed, and source-selected frames.
4. On failure or time cap, report only the **completed** shards;
   do not present intended matrix scope as completed coverage.
5. Verify Cloudflare Worker separately from GitHub/Chromium checks.
   The production Worker is not automatically deployed by this workflow.

Reproduce one shard locally (do not confuse it with total coverage):

```sh
npm test
node scripts/s046-root-census.mjs --full --shard=0/16 > s047-root-0.json
# Repeat for ALL sixteen indices, then:
node scripts/s047-merge-root-shards.mjs s047-root-*.json > s047-full-root-census.json
npm run check
npm run build
```

## Fundamental remaining Stage A obligations

A correctly handled legal weak-turn queen capture is a **draw**, not
an impossible forced win. Finite full-root availability, complete
immediate replies, or locally authenticated source constructors do not
establish a global mating strategy. A valid Stage A KQK completion
needs the exact JS source policy on every legitimately winning legal
root, with all real weak continuations and a global well-founded
termination/bound argument over board + turn + FULL token. If the
pinned frozen theorem is only an existence or local MateWithin
statement, request an upstream constructive composition/extraction
theorem, rather than invent a downstream controller move.

KRK independently still needs a real source-derived all-phase rank or
composition certificate through PREP -> central -> restoration -> re-entry
with original nested token/frame and every lawful weak reply.
No S047 changes touch the KRK or KQK runtime move selectors, material
certification gates, existing full K/K–K+B/K–K+N/K Maths derivations,
separate Engine tab, FIDE history semantics, or upstream Lean sources.

**Stage A remains OPEN**; Stage B full KRK/KQK explanation and rule/clock
parity follows actual Stage A closure. See NEXT_SESSION.md for S048.
