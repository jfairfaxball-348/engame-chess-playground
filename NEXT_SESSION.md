# S026 — source-driven KRK/KQK continuation closure, not endless audits

**Execution after S025.** Binding order from AGENTS.md: finish BOTH
KRK/KQK genuinely winning simplified/play-first source-derived move
policies from every legal setup against every legal weak reply.
Only then **immediately** restore dynamic, position-specific maths
equations and full theorem working, clock/repetition/terminal parity
for BOTH classes. Preserve KK/KBK/KNK rich panels. No KPK or
engine distraction. Do not conflate audit cost caps with controller
failures or mark experimental controllers certified.

## Frozen handoff

- S024 PR #33 merged as main commit
  `1035b2c065139c43616fb9c9a689de97f927a93e`,
  exact main CI `41092116183` green.
- S025 PR #34, `docs/KQK25_ADVERSARIAL_GATE.md`:
  fixed-seed exact S024 baseline KQK **88/120** finite mate-closed,
  **32 capped**, **0 falsified**. Most capped root families:
  FarFilePreparation 7/8, WeakToMove 6/8, SameRankEntry 5/8,
  EntryGeometry 4/8, BandEntry 4/8. KRK **24/24 capped**,
  0 failures, 54,948 structural revisits with different histories.
  Inspect **S025 exact final-head CI** before quoting results
  under the new monotone diagnostic. These two samples are NOT
  mathematical all-root certificates.
- KQK frozen EC-T0050 upstream source SHA
  `c72365a8ba46f59114a2a77d9d38993f6a52df80` read-only.
- S025's deeper monotone diagnostic exposed a **real 6-ply
  FarFilePreparation oscillation** in a Black-queen, White-weak
  root K=32, Q=54, weak K=12: weak 12-20, source
  54-48, weak 20-19, source 48-55, weak 19-20, source 55-48.
  S025 repairs it with a strict one-weak-reply `far-file` token
  invoking source-defined `FarFileEntry.far_file_stage_bound`
  continuations, instead of opposite-file re-preparation.
  Regression `test/kqk25-far-file-cycle.test.js`. The **pre-fix**
  monotone audit found 103/120 closed, 1 real cycle, 16 capped;
  check the final PR-head **post-fix** audit before reuse.
- `scripts/kqk21-adversarial.mjs` now reports each first cap's
  exact board/turn/source token and `crossDepthClosedReuses`.
  `--cache=exact` provides comparison against old depth-specific
  closure; `--cache=monotone` is clock-free diagnostic acceleration,
  NOT a proof of selector correctness or FIDE parity.
- `test/kqk25-audit-replay.test.js` replays actual first-cap
  paths and verifies the last position/token. Prefer that
  reproducible starting point over untargeted trial-and-error.

## Execute

1. Verify S025 merged/main and all final-head checks. Run the same
   expanded KQK audit in both `--cache=exact` and
   `--cache=monotone`, compare same-cohort root verdicts and family
   metrics. Run KRK stratified 24-root 2500-node audit. Record
   counters and `firstCap.at` state for target family.
2. **Prioritise real continuation code**, not more audit infrastructure.
   For KQK pick the first *repeatably* inconclusive far-file /
   weak-to-move / same-rank root. Replay the real late state/token,
   identify a missing or over-generalised premise if and only if
   observed, then translate the literal frozen source continuation
   from `Rules/KQK/{FarFileEntry,SameRankEntry,OrientedEntry,
   EntryFrames,TightEntry,BandEntry,BandProgress}.lean`. Examine
   each actual legal weak reply, negative premises, both colours
   and all eight frames. Do not invent arbitrary move ranking,
   tablebase/minimax/engine fallback or a theorem not in the source.
   If the branch is only resource-capped with all source moves
   present, say so: cost alone does not justify altering the policy.
3. For KRK inspect the exact nested source continuation on the
   first capped 2500-node path, and seek a **sound** all-defender
   closure argument or measurable phase ranking without treating
   clock/history-distinct states as FIDE equivalent. Source-derived
   actions only. Use all four frames and both colours as supported.
4. Run Node tests, source locks, syntax, build, Chromium browser QA
   for legal setup, turn selection, arranged-position fidelity,
   legal defender replies, captures-to-KK, checkmate/stalemate,
   Undo/Restart, and the three existing deep Maths proof panels.
   Keep Engines independent.
5. If both controllers genuinely finish *all legal branches*,
   begin Stage B **in this same session** with board-specific proof
   working/Lean provenance and actual clock/history rules (only
   claim certification if independently demonstrated). Otherwise
   keep `experimental/uncertified`, record concrete unresolved
   cases and install S027 for targeted closure.
6. Commit playground-only changes, PR, exact-head CI, merge,
   verify main fast-forward and production Cloudflare deployment
   independently. Do not edit `engame-chess`.

Owner's priority is a working Maths playground, with strict FIDE
50/75-move bookkeeping deliberately deferred until BOTH simplified
KRK and KQK policies are complete.
