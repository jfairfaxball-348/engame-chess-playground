# S037 — authentic source gap triage and reproducible cache comparison

1 November 2026. Downstream-only audit; neither the read-only upstream
`endgame-chess` nor the production Maths controllers have been changed.
Stage A is **not** closed by these finite probes.

## Executable changes

- `scripts/s037-source-gap.mjs` replays only actual
  `KQK.FarFilePreparation` actions and the exact emitted continuation
  token, followed by **every** legal initial defender reply. It records the
  original theorem frame, newly selected frame, selected source rule,
  exact board coordinates, move pair and genuine token. A switched-frame
  `SameRankEntry.backrank_entry` move is authenticated against its **own**
  frozen theorem; it is never presented as original-frame
  `FarFileEntry` correspondence. Unsupported and unverified choices stay
  explicit. A candidate root already on the tight wall is not given a
  fictional preparation token.
- The S036 source-aware all-reply traversal is reused from each unique
  sampled genuine continuation with explicit node and pair caps.
  Missing source actions, rook/queen captures, nonmate terminals,
  structural repeats and resource caps remain **different** verdicts.
  Finding no missing action under a cap is not a proof of global mate.
- KRK first central/restoration phase handoffs are reported with their
  incoming nested controller token, chosen source rule and legal action.
  `KRKCentral.prep_pair` descent remains a **local PREP-only lemma**:
  a global rank for source-tagged central/restoration transitions is
  NOT manufactured. The exact rank composition obligation stays open.
- `kqk21-adversarial.mjs` now emits the entire ordered set of material,
  side-to-move, family and piece-square root identities. S037 executes
  its existing `exact` and `monotone` closed-only memoisation modes on
  identical seeds, actual roots, search depths and budgets, and compares
  recorded verdict counts. No bounded/cycled/unsupported subtree is
  cached as a win. Differences caused by node caps remain inconclusive.

## Reproduction

```sh
npm test
npm run verify:krk-sources
npm run audit:s035-source-bridges -- --strict
npm run audit:s036-cross-phase -- --nodes=800 --pairs=64 --prepared=8 --tight=4 --krk-roots=8
npm run audit:s037-source-gap -- --nodes=100 --pairs=24 --legal=1200 --prepared=4 --krk-roots=4 --attempts=500 --per-family=1 --cache-nodes=250 --rounds=30 --strict
npm run check
npm run build
```

The PR-head GitHub Actions workflow also runs the existing KRK/KQK
root/phase/rank/closure audits and both Chromium suites. These runs
verify the *auditors and sampled execution*, not a universal strategy
or complete FIDE clock/repetition semantics. Results and first
witnesses are in the JSON audit output; do not replace them with
unmeasured global claims.

## Outstanding mathematical obligations

**KQK:** verify any newly exposed missing/unauthenticated source move
against the pinned frozen `EC-T0050` frame and exact hypotheses.
If no actual source gap occurs in the sampled branches, widen the
source-issued preparation and separating-rank roots before claiming
closure. All defender branches of all legal user roots remain open.

**KRK:** identify an immutable frozen source lemma giving a
well-founded rank on *board + nested continuation token* across
central and restoration handoffs, for **every** legal weak reply.
Neither bounded cycle-freedom nor S035 PREP descent supplies this.

Until both Stage A winning strategies are genuinely complete,
keep `MATERIAL.krk.playable=false` and
`MATERIAL.kqk.playable=false` as universal certification flags;
experimental partial play remains. Preserve all KK/KNK/KBK board
working; do not begin Stage B parity prematurely. Do not conflate
a merged GitHub commit with an independently verified Cloudflare
Workers deployment.

Frozen KQK source `c72365a8ba46f59114a2a77d9d38993f6a52df80`,
KRK theorem `2311abe71bc1a4eed47026feccd5ba5a0760d5bb`,
KRK source `e7de0930fc61caeb11795cf3c10fde11e4774a40`.
