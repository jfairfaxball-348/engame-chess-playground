# S028 — frozen KQK horizontal upper-gap source correction

30 October 2026. Playground downstream only; immutable upstream KQK
EC-T0050 source `c72365a8ba46f59114a2a77d9d38993f6a52df80`.
S028 PR [#37](https://github.com/jfairfaxball-348/engame-chess-playground/pull/37)
was squash-merged as `fd9f0e899ede84e2629cefb0fee46dd8193c1497`.

## Exact theorem/selector mismatch corrected

`formal/EndgameChess/Rules/KQK/OrientedEntry.lean`
`horizontal_far_wall_entry` covers the forward high-file case
`sk.file=5, wk.file=7` with only `sk.rank+1 <= wk.rank`,
`|qs.rank-wk.rank|=2`, off-king queen rank, no separating
rank-wall, and the explicitly handled corner exception. In the narrow
non-corner subcase, the proof plays `Q(6, qs.rank)` and enters
a framed EdgeWall. The JS narrow branch formerly imposed the
**stronger** `wk.rank=sk.rank+1`; that equality is not a theorem
premise. S028 replaces it with `wk.rank>=sk.rank+1` under the
existing guard and dispatches the specific frozen source action before
general low-clear-wall selection. A different source theorem may
also apply to these boards; this corrects the available source route,
not a demonstrated missing legal first move across all KQK boards.

`test/kqk28-horizontal-upper.test.js` covers representative genuine
upper-gap boards K(5,1) Q(0,5) versus K(7,3) and
K(5,2) Q(1,6) versus K(7,4), both colours, all eight
board isometries, legal chosen moves, queen-capture safety and
every legal immediate weak reply. Where another named source theorem
wins frame priority, the test accepts that theorem instead of
falsely assigning the narrow route.

## Measured evidence, not a totality theorem

S028 exact PR head `1a50e26e7816a84148f4873542389218aa7866a5`
passed the full workflow
[Actions 41130916414](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/41130916414):
Node tests, frozen-source audit, KRK selector/continuation/mate tests,
KQK adversarial exact and monotone modes, syntax, build, both Chromium
Maths and Engine suites.

Identical 12,000 attempts, four roots per family, 2,500 nodes,
64 rounds, deterministic fixed-seed cohort:

| Controller | All-replies-mate observed | Capped | Falsified |
|---|---:|---:|---:|
| S027 monotone | 98/120 | 22 | 0 |
| S028 monotone | **98/120** | **22** | **0** |
| S027 exact | 87/120 | 33 | 0 |
| S028 exact | **87/120** | **33** | **0** |

KRK 24/24 source-family trees capped at 2,500 nodes; no observed
genuine failures. **No measurable bounded all-defender closure gain**
from S028. This is an incremental named-source translation correction,
not a claim that either policy is complete. Avoid spending S029 on
repeating it without a real counterexample.

## Open obligations

Stage A remains OPEN for both KRK and KQK: neither source-derived
JavaScript controller is proved to reach mate from every legal
user-arranged position against every defender response. A resource cap
neither proves nor disproves an eventual win. Preserve the working
experimental KRK/KQK gameplay, exact board setup and colour handling,
and detailed KK/KNK/KBK mathematics. Strict FIDE 50/75-move, repetition,
full on-board worked-proof parity and selector certification remain
deferred until BOTH simple strategies close. KPK and Engine experiments
are not the next milestone. GitHub CI does not verify Cloudflare
production deployment; inspect it separately.
