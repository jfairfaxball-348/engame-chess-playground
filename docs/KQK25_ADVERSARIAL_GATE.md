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

No changes to the KRK controller, KK/KBK/KNK source calculations,
Engines tab or upstream Lean sources.
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

## A real, previously hidden KQK failure and source-derived repair

The first S025 PR-head expanded audit with depth-monotone closure
(GitHub Actions run 41093303852) inspected **120 identical fixed-seed
roots**: **103 bounded mate-closed**, **16 capped**, and **one genuine
source-controller cycle**. Unlike the old 32 caps, the cycle is a
demonstrated failure, NOT a node-budget artefact.

Exact root: strong Black K index 32 / Q index 54, weak White K
index 12, White to move. The first counterexample follows
`W 12-20; Q 54-48; W 20-19; Q 48-55; W 19-20; Q 55-48`.
Repeated `FarFilePreparation.escape_preserving` in *different frames*
oscillated between far files. The frozen
`Rules/KQK/FarFilePreparation.lean` explicitly proves a **single**
preparation step, and after every actual weak reply invokes
`FarFileEntry.far_file_stage_bound` with queen file <=1, weak file >=3
and off-rank, distant-king premises. The controller had discarded that
continuation and rerun its initial root dispatcher, selecting another
preparation. This is the first verified source-policy liveness error
after S024; do not describe S024's zero *observed* failures as universal
correctness.

S025 adds a `far-file` one-reply source token, checks those exact
post-reply source premises in the original frame, and dispatches only
existing named constructive source actions, disallowing a *second*
`far_file_preparation` inside that discharge. Missing translations
continue to fail closed. `test/kqk25-far-file-cycle.test.js` replays
the original weakness, source move, real weak reply, and required
non-bouncing continuation for both colours/eight symmetry frames.
This is an actual live KQK strategy fix, **not** mathematical
certification of complete KQK play. Full final-head PR and merged-head
expanded CI metrics still must be checked.

## Post-repair audited result (exact code head `13da7ce`)

PR-head [Actions 41094156645](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/41094156645)
passed Node tests, source locks, audits, build and Chromium.
Fixed-seed 12,000-attempt/4-family/2,500-node/64-round KQK
diagnostic: **120 roots**, **105 finite all-defender mate-closed**,
**15 resource-capped**, **zero hard failures**. 79,861 nodes,
76,611 actual defender replies, 7,810 successful cross-depth closure
reuses. In contrast, the pre-repair monotone audit found 103 closed,
16 caps and the explicit one-cycle failure above. These are
same-seed same-scope diagnostics; no universal all-position theorem.

After the fix, the largest capped KQK families are
WeakToMove (4/8), FarFilePreparation (4/8),
SameRankEntry (3/8); BandProgress, EntryGeometry, BandRaise
and TightEntry each have one capped root. KRK remained
24/24 resource-capped, no confirmed hard failures at 2,500 nodes.
The **final merged main SHA and its own run** still require
independent confirmation; do not substitute this earlier PR-head
CI as that post-merge verification.
