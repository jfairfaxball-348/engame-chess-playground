# S041 — exact-root 1x/2x/4x cap-pressure audit (2 November 2026)

Downstream engineering only. Parent Lean sources stay **read-only**.
KQK EC-T0050: `c72365a8ba46f59114a2a77d9d38993f6a52df80`.
KRK EC-T0048: `2311abe71bc1a4eed47026feccd5ba5a0760d5bb`.
KRK executable: `e7de0930fc61caeb11795cf3c10fde11e4774a40`.

## Starting point (S040 verified)

S040 main Actions [41442721317](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/41442721317) passed. The S039 42 first-reply trees closed 4/42 at 160 nodes/28 pairs and 6/42 at 320 nodes/56 pairs. Another 36 were resource-limited at 2x, NOT demonstrated to be unsupported. S040 independently authenticated all 214 sampled KQK third actions in four genuine source families with zero false premises or unchecked rules. None of these establish global mating.

## What this session adds

- `scripts/s041-cap-sweep.mjs` reuses S039's deterministic, original, legal, source-issued `FarFilePreparation` roots, **every legal first defender reply**, exact token, two-ply log, source-selected frame and continuation action.
- The 1x and 2x verdicts are the exact S039 paired tree results (no divergent root samples). At 4x, the audit independently replays the identical root, source preparation, genuine weak reply and full move history before running `probeS036Tree` under 4x limits. It never invents a token or calls a different attack policy.
- Matched per-budget counts separate all-defender mate closure, source/controller counterexample, potential structural recurrence and resource cap. There is a guard against an already closed tree becoming unclosed as caps increase.
- `probeS036Tree` now records `firstIssues` **per category**: source missing, queen captured, nonmate terminal, structural recurrence and budget cap. The legacy `firstProblem` is preserved for backward compatibility. This prevents an earlier cap record from suppressing the first later observed hard failure, while still recording that failure only when it was actually visited.
- A 4x source failure is reported with an actual original board, frame, full two-ply previous source history, genuine token and trace. Source-labelled local authentication is not substituted for whole-game termination.
- The *independent four-ply theorem premise checker* remains in S040, and its CI guard still runs. This diagnostic does not change the move selector.

Run:
```sh
npm run audit:s041-cap-sweep -- --tuples=1600 --prepared=10 --nodes=160 --pairs=28 --krk-roots=4 --strict
npm run audit:s041-cap-sweep -- --tuples=1600 --prepared=10 --nodes=160 --pairs=28 --krk-roots=4 --full
```

The required 1x/2x/4x budgets are **160/28, 320/56, 640/112** on the same 42 genuine first-reply trees. The CI job prints measured counts; do not infer an outcome from the code or from an unfinished CI run. To reproduce a different fixed legal-root cohort, change `--tuples` and `--prepared` together with explicit scope labels.

## Measured S041 PR-head audit

The completed S041 PR-head [Actions run 41475477171](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/41475477171) passed the whole workflow, including Node tests, pinned-source check, all legacy adversarial/rank diagnostics, S041 1x/2x/4x audit, build and both Chromium browser suites.

Identical **10 genuine prepared roots / 42 first legal replies / 214 second legal replies**, frozen KQK source `c72365a8ba46f59114a2a77d9d38993f6a52df80`:

| Budget (nodes / attacking pairs) | Entire trees mate-closed | Resource-capped | Structural cycles | Source/capture/nonmate counterexamples |
| --- | ---: | ---: | ---: | ---: |
| 160 / 28 | 4 | 38 | 0 | 0 |
| 320 / 56 | 6 | 36 | 0 | 0 |
| 640 / 112 | **8** | **34** | **0** | **0** |

A total of two capped trees closed by 2x, and two *more* by 4x. The source-selected frame, prior action, two-ply legal board history and original nested token were identical across budgets; S041's exact replay and monotone all-reply closed-tree checks passed. The 34 remaining trees at 4x are resource-limited, **not** declared winning, losing or defective. The first escalated mate-closure was at original `reflectX` root, after `White Qg2+, Black Kb8` and source-selected `KQK.EntryGeometry.clear_low_wall_entry.queen_wall`, with 487 tree nodes and 101 mating terminal leaves.

The S041 legacy `firstUncheckedLaterTheorem` field reprints S039's **pre-S040** premise-checker gap; the dedicated S040 checker independently authenticated all 214 later applications on this cohort. It is NOT a new failed theorem in S041. The first outstanding evidence is global source-controller termination/coverage, not an observed local counterexample.

## Proof/release boundary

KRK remains missing a frozen, executable, global well-founded descent on **board + complete nested continuation token** under every defender reply across PREP, central and restoration transitions, or an equivalent source-backed argument. S041 preserves the S039 PREP→central and central/restoration witness records; it does not manufacture a rank. The original-frame KQK separating-rank and already-far-file tight-above families are not globally discharged by sampling this one preparation cohort.

Stage A is OPEN. **No** `MATERIAL.krk/kqk.playable` certification, runtime move policy, older KK/KBK/KNK mathematical panel, Engine area, KPK entry or proof-source lock is changed. Stage B KRK/KQK full working and FIDE history/clock parity remains next after honest Stage A completion.

CI success is not proof of a deployed Cloudflare Worker; check the live Worker independently before claiming deployment. The next complete session prompt is `NEXT_SESSION.md` (S042).
