# S046 — legal KQK root audit and mandatory draw exception

4 November 2026. **Audit only; not a global mate theorem.** Read with
[S045](S045_SOURCE_CONSTRUCTOR_CLOSURE.md) and
[NEXT_SESSION.md](../NEXT_SESSION.md).

Frozen KQK source EC-T0050: c72365a8ba46f59114a2a77d9d38993f6a52df80.
Frozen KRK executable: e7de0930fc61caeb11795cf3c10fde11e4774a40.

## New KQK root-classification tool

The new scripts/s046-root-census.mjs inspects legal KQK starting boards,
not merely the previously sampled separating-rank and tight-above
families. It separately counts both strong colours, both sides to move,
and memberships across **all eight** D4 frame transformations.
It records the ACTUAL source-selected frame and phase, a freshly null
input source token, and only genuine emitted continuation tokens
after legal moves. It reuses the unchanged independently implemented
S035–S045 selected-action checker, now publicly exported from S042.

All immediate legal weak replies are evaluated separately: queen
captures to already proved KK draw, genuine source responses, missing
responses, checked/unchecked/failed theorem premises, source movement
legality, stalemate and mate. Missing checker does **not** mean
disproved Lean theorem. Unknown frame/token bridges are not certified.

There are 64^3 = **262,144** raw labelled square triples per colour
and turn before rejecting overlap and illegality, or **1,048,576**
across four colour/turn groups. Orbits are tracked using all eight
symmetries but source-selected frames are NOT replaced or normalized.
The default 64 legal roots per group are only **256 sampled roots**,
not exhaustive. For a complete finite legal-root enumeration run
the tool with --full, or run --full --shard=N/M for every shard index
N from zero through M-1. Save every shard. Neither samples nor partial
shards establish universal root coverage.

A complete finite enumeration of starting boards **still cannot
certify the entire infinite-depth token-bearing all-defender game**.
That requires a genuine all-plies terminating source-derived
controller or equivalent authoritative termination certificate.

## Concrete legal draw witness: universal *winning* claim impossible

**White King a1, White Queen d4, Black King e5, Black to move**
is a legal KQK root. Although the queen checks Black, Black can
legally play **Kxd4**: the white king on a1 cannot protect d4.
The resulting K-versus-K position is a known draw.

The exact draw occurs for either strong-side colour and under each
of eight board symmetries. The added regression checks **all 16**
instances by actual legal moves and capture-to-KK transition.

Therefore the literal goal "mate from every legal KQK root,
regardless of side to move" is false. This is a valid drawn-root
exception, *not* a counterexample to the upstream KQK result.
Playable Maths should classify legitimate root draws, including
rook/queen captures, while requiring a complete source-derived
winning controller on roots where forced mate genuinely applies.
It must not claim every legal weak-to-move root to be won.

## KRK all-phase termination still unproved

S039's authentic nested tokens demonstrate
PREP(rankBefore=2) -> central via KRKExecutable.offCentreUpper_sound
(move 16-24), followed by central -> restoration via
KRKExecutable.restorationKing_sound (move 11-19). The frozen Lean
lemmas Prep.prep_bound, Restoration.restoration_bound and
StrategyTransport.krk_force_transport are respectively local
MateWithin, MateWithin conditional on supplied CentralBound,
and ForceMate existence transport. They do NOT, as currently
pinned, supply a well-founded rank for the particular JS
(board, turn, full nested token) controller through re-entry.
No frozen universally descending rank was established by S046.

Minimum needed upstream result: an authoritative constructive
all-defender composition/bound theorem for the exact selected
PREP, central, restoration, and re-entry phases, with source
frame and nested token continuity, or a certified equivalent
selector extraction. Do not fabricate this in the Playground.

## How to reproduce

    npm test
    npm run verify:krk-sources
    npm run audit:s045-fresh-source
    npm run audit:s046-roots
    node scripts/s046-root-census.mjs --per-group=64 --strict
    # Optional resource-intensive 1-of-8 exhaustive root shard:
    node scripts/s046-root-census.mjs --full --shard=0/8 > s046-shard-0.json
    npm run check
    npm run build

GitHub CI also runs prior S035–S045 audits and both Maths/Engine
Chromium suites, uploading the S046 full diagnostic JSON. Full
root *census* is not part of routine CI, because it is resource
intensive. A green CI is not proof of worldwide Chess Playground
Worker asset deployment. Live Cloudflare Worker HTTP and asset
versions must be checked separately.

**Stage A remains OPEN for both KRK and KQK.** Do not change either
material release flag. The previous KK/KBK/KNK mathematical
derivations are untouched. Stage B full KRK/KQK maths and strict
FIDE history/clock parity follows only after actual Stage A closure.
KPK and unrelated Engine research are deferred.
