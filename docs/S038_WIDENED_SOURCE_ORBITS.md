# S038 — widened genuine KQK legal-root orbits and KRK phase-witness triage

2 November 2026. **Stage A remains open.** Only the downstream
`engame-chess-playground` is modified; the frozen `engame-chess`
mathematical source is read-only.

## Specific S037 witness carried forward

The latest green S037 PR-head CI log (job 124965237581) had 24
KQK resource-capped genuine continuations, with **zero** missing
first source moves, **zero** unauthenticated first source moves and
zero mate-closed source trees. The first cap originated from a real
white KQK preparation at root
`----------------------------------------bK----------------------wK------------------------------------------wQ------------------:w`:
Q 54-48, weak K 20-29, then source
`KQK.SameRankEntry.backrank_entry.clear_low_wall` Q 48-49
in switched frame `swap`, with original `reflectY` far-file
token. The first resource exhaustion was a **node cap with skipped
defender siblings**, not an unsupported move or a counterexample.

The KRK first real source transition at that cap was
`prep -> central`: source
`EndgameChess.Rules.KRKExecutable.offCentreUpper_sound`,
strong move 16-24, with `krk14-strong-continuation` prepared
token carrying inner PREP rank 2. Its global phase-composition
rank remains **unproved**. S035 local PREP descent cannot be
promoted to a cross-phase theorem.

## Changes

`scripts/s038-orbit-closure.mjs` systematically permutes a 73,728-tuple
canonical source-preparation coordinate box with coprime stride 31,337,
rather than taking the lexicographic S034 prefix or repeating one
far-wall fixture. It rotates two actual board symmetries per tuple,
tests both colours and **only** retains legal roots from which the
existing source controller actually issues a
`FarFilePreparation.far_file_preparation` action and genuine token.

Every legal first defender reply is replayed with exactly that token.
For each child the auditor preserves source/frame theorem identities,
exact piece squares, complete original move log, legal reply, selected
source rule and selected move. An original-frame
`EntryGeometry.clear_low_wall_entry` is authenticated with
`authenticateKQK35LowWall`; a switched-frame
`SameRankEntry.backrank_entry` is independently authenticated with
`authenticateKQK33Backrank`. No other case is counted as proved.

For each genuine child, two all-defender branch budgets use the same
root and token. An observed missing action, unverified theorem,
structural repeat, capture/nonmate and exhausted resource budget are
different obligations. A structural state repeat is **potential**
cyclic behaviour, not certified repetition and not an automatic
source-theorem counterexample. A resource cap is never a mate proof.

The KRK half uses the S037 nested-token real phase witness.
No mathematical rank, move fallback, source lemma, minimax, engine,
runtime move-controller amendment or global mating claim has been
introduced. KK/KBK/KNK proof panels, KPK/Engine, both colours and
capture-to-KK remain unchanged.

## Reproduce

```sh
npm test
npm run verify:krk-sources
npm run audit:s035-source-bridges -- --strict
npm run audit:s036-cross-phase -- --nodes=200 --pairs=36 --prepared=4 --tight=2 --krk-roots=3 --strict
npm run audit:s037-source-gap -- --nodes=100 --pairs=24 --legal=1200 --prepared=4 --krk-roots=4 --attempts=500 --per-family=1 --cache-nodes=250 --rounds=30 --strict
npm run audit:s038-orbits -- --tuples=1600 --prepared=10 --nodes=160 --pairs=28 --krk-roots=4 --strict
npm run check
npm run build
```

The PR-head workflow also runs broader KRK/KQK root, rank, cycle,
all-defender full-game and exact-vs-monotone cache diagnostics and both
Chromium suites. All such finite results are **falsification/audit data**,
not a total winning policy or FIDE certification.

## Unresolved

1. A complete KQK theorem-authenticated all-reply mating continuation
   from any legal initial position; expand orbit/cap sweep and inspect
   the first genuine missing/unauthenticated frozen-source obligation.
2. A source-frozen KRK composition lemma that assigns a well-founded
   measure to exact board **plus nested token** across central/restoration
   after **every** lawful defender reply. The current source has not
   supplied this certificate.
3. Independent Cloudflare Workers deployment verification. A merged
   GitHub commit and a green Actions job alone do not establish a
   production Worker release.

Frozen: KQK EC-T0050
`c72365a8ba46f59114a2a77d9d38993f6a52df80`;
KRK EC-T0048 `2311abe71bc1a4eed47026feccd5ba5a0760d5bb`;
KRK source `e7de0930fc61caeb11795cf3c10fde11e4774a40`.
