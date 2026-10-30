# S025 — KRK/KQK adversarial gate: honest bounded closure and exact replay

30 October 2026. Playground-only execution. Frozen KQK EC-T0050
`c72365a8ba46f59114a2a77d9d38993f6a52df80` (read-only).
Stage A (complete simplified source-derived KRK AND KQK strategy) is **open**.

## Exact S024 main-head baseline

S024 merged as PR #33, commit `1035b2c065139c43616fb9c9a689de97f927a93e`.
The **merged** main-head GitHub Actions run
[41092116183](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/41092116183)
passed Node, KRK source locks, strategy audits, syntax, build and Chromium.

The expanded unchanged-seed, 12,000-attempt/4-per-family KQK audit
(`--nodes=2500 --rounds=64`) observed:

| Metric | Exact S024 result |
|---|---:|
| KQK all-defender sampled roots | 120 |
| Finite trees closed at mate | 88 |
| Resource-capped / inconclusive | 32 |
| Confirmed hard failure | 0 |
| Visited nodes | 97,814 |
| Legal defender replies | 87,886 |
| Closed subtree reuses (exact depth) | 47,291 |

Highest remaining cap families:
FarFilePreparation **7/8**, WeakToMove **6/8**,
SameRankEntry **5/8**, EntryGeometry **4/8**, BandEntry **4/8**.
S024 has eight more sampled roots than S023 (new source families), so
88/120 versus 81/112 is **not** a same-cohort proof of improvement.

The expanded KRK audit saw **24/24 resource-capped**, **0 confirmed hard
failures**, **60,024 nodes**, **24,544 mate leaves**, **54,948
structural revisits** (all distinct incoming histories). These revisits
are a diagnostic work-cost signature, not licence to treat different
history/clock contexts as formally equivalent.

## S025 implementation

- `scripts/kqk21-adversarial.mjs`: retain all-defender DFS,
  active-cycle detection and exact-depth closure bookkeeping.
  Add opt-in `--cache=exact` reference mode and default
  `--cache=monotone` extension. In **this clock-free diagnostic
  only**, if the same board/side/token has already been exhaustively
  proven mate-closed at depth `r`, it may be reused at an earlier
  arrival depth `r' <= r`, which affords at least as many remaining
  rounds. Check the active recursion stack *before* reusing.
  No failed or capped subtree is memoised; neither mode supplies a
  gameplay move, a FIDE certificate or a universal termination proof.
- Add `crossDepthClosedReuses` as an auditable metric. Preserve
  `fullyClosedSubtrees` and other existing evidence fields.
- On first round/node cap, record actual source board positions,
  strong/weak colours, move count, `positionKey` and exact
  pending continuation-token coordinates/frame. This is evidence of
  where traversal stopped, **not** evidence that a source step is missing.
- `test/kqk25-audit-replay.test.js`: compare fixed-seed exact and
  monotone diagnostic modes, check reproducibility and honestly
  replay up to four capped real histories with the actual chosen
  source moves/defender replies and token/board identity.

No changes to `src/kqk-source-policy.js`, KRK controller,
KK/KBK/KNK source calculations, Engines tab or upstream Lean sources.
Stage B (board-specific maths panels and 50/75-move/repetition parity)
begins **immediately after both** simplified strategies are complete,
not before and not replaced by KPK or engine research.

## Verification and release criteria

Read the *exact final-head* PR #34 CI run after all S025 commits,
and rerun the expanded KQK and KRK scripts. Record families
closed/falsified/capped and any counterexamples separately in the
closeout. If resource caps persist, **do not** upgrade the controller
to certified, do not claim total playability, and install S026 with
specific source gaps to close. Independently confirm the production
Cloudflare Workers deployment rather than assuming GitHub CI deploys it.
