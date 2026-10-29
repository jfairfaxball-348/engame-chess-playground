# KRK02 — constructive extraction continuation: execution record

**29 October 2026.** This records actual code and Lean proofs added during the owner's instruction to continue within the current conversation. **KRK GAMEPLAY IS NOT RELEASED.** The existing `KRK_GAMEPLAY_RELEASED=false`, `MATERIAL.krk.playable=false` and Start button hold are deliberate.

## Verified source / branch states

- Parent research branch: [KRKExecutable extraction PR #3](https://github.com/jfairfaxball-348/engame-chess/pull/3), still draft and unmerged. The latest completed [full Lean build #40886544904](https://github.com/jfairfaxball-348/engame-chess/actions/runs/40886544904) **passed** on `c8a77755c69adc63ffee6e32eeeebdfa35b7bea4` (full build, forbidden-proof-escape and standard axiom report); it is evidence of the **individual** declarations listed here, not total KRK gameplay. The prior multiline axiom-report failure was fixed in that same branch. The frozen KRK parent theorems EC-T0019/0048/0049 and source lock remain untouched.
- Playground audit branch: `krk02-verified-blocker-kqk03-readiness`, [draft PR #4](https://github.com/jfairfaxball-348/engame-chess-playground/pull/4). [Green 99-test CI #40885683740](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/40885683740) covered the first right/left cut and guarded cycle as well as Engine tab QA. The newer opposition-extraction test suite is separately building; do not infer its result from the earlier 99-test run. No production or main-branch release of these files.

## Actual Lean-to-JS interfaces added

| New importing Lean module | Certified *local* operation | Unreleased JS + diagnostics |
| --- | --- | --- |
| `KRKExecutable/ReadyCutTempo.lean` | Deterministic narrow READY rook wait, every legal reply partitioned as upper exit / aligned / wide pivot | `krk-ready-cut-tempo.js`; all-reply tests |
| `KRKExecutable/WidePivot.lean` | Explicit rook cut to K.file ±1 on rook rank, or already-existing guarded handoff; every legal reply stays outside new protected perpendicular file, both orientations | `krk-wide-pivot.js`; both-colour, four-frame tests |
| `KRKExecutable/GuardedEntry.lean` | King step one rank toward rook; all defender replies remain above and beyond the rook, both left/right guarded versions | `krk-guarded-entry.js`; all-reply tests |
| `KRKExecutable/ColumnKing.lean` | Horizontal one-file king approach from interior files 1/2/5/6 with 3-file rook margin, leaving at least 2-file margin after all weak replies | `krk-column-king.js`; all-response broad fixtures |
| `KRKExecutable/OppositionActions.lean` | Exact rook check for opposed kings; edge mate or weak king one-rank ascent. At 4-file margin, exact strong king-up continuation makes a distant rank wall and lowers height after every reply | `krk-opposition.js`; mate/4-ply/adversarial fixtures (new CI must be verified) |
| Existing `KRKExecutable/{PrepController,ReadyUpper,WallClimb}.lean` | Deterministic oriented-wall preparation, rook height elevation with decreasing *partial* potential, narrow-band handoff | Existing `krk-prep-controller.js`, `krk-wall-climb.js` |

The specifically chained test `test/krk-proof-path.test.js` independently played the **real legal moves and every legal defensive reply** for the wide protected cut then guarded entry. On [green run #40885683740](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/40885683740) it observed **48 first defensive branches**, **288 second defensive branches**, and **288/288** entries into some supported oriented strict wall. This is a **two-phase compositional diagnostic**, not a complete adversarial game, a rank certificate for later phases, or formal JS verification.

## Concrete unresolved execution boundary

A legal example is `8/8/8/8/5k2/R7/3K4/8 w - - 0 1` (White Kd2, Ra3; Black Kf4). The old controller returned `READY` with no move. The new extracted wide-rook cut chooses **Ra3–e3**, and after every defender reply the guarded construction chooses **Kd2–d3**; all subsequent weak replies reach a strict wall. That is genuine progress, **not a mating strategy**.

The remaining incomplete interfaces are exact and material:

1. **All-root setup:** `KRKSetup/PositiveSetup`, `NotCheck`, same-rank/back-rank/off-rank and symmetry-specific cases currently prove `MateWithin` from any legal strong-turn root but still do not export a *total* deterministic coordinate dispatcher covering every legal board.
2. **Full central + restored column:** `KRKCentral/Column`, `Central`, `Positive`, `Back`, `BackEven`, `WaitEven`, `Restoration`, `ExitStep`, `Full` and `SmallCentral` contain conditional mutually connected `MateWithin` arguments. A port of isolated actions is not a certified all-phase recursion. In particular the right/left guarded handoff to the axis-swapped column wall is not yet a verified total move selector through mate.
3. **Termination and FIDE:** compose a decreasing **phase+rank** or carried mate budget for *every* selected strong action and *every* legal weak reply, preserving the theorem's 93/97/98-ply caps, fresh halfmove clock, repetition keys, claims and automatic draws. No reset or arbitrary legal move is allowed.
4. **Game/UI release:** only after 1–3 are independently verified may the `Maths` game loop import a complete `KRKChooseMove`, activate Start for arbitrary arranged roots, show actual per-move source-linked proofs and pass both-colour complete adversarial games, mobile/desktop browser and production deployment.

Neither a passing normal Playground CI nor a green Lean build for these local functions establishes these global obligations. The parent `KRKWinning.winning_policy` still uses non-executable `Classical.choose`; it cannot be called from JavaScript. The KRK tablebase, Stockfish, heuristic selection or minimax is NOT an authorised substitute.

## Release decision

Keep both PRs **draft and unmerged**, keep both playable flags false and all existing KK/KBK/KNK and Engine Playground behaviour unchanged. The next actual coding task is to extract the **total central/column exit and restoration dispatcher** with all-reply rank, then the general setup dispatcher, and finally connect the fresh WDL50/history budget. KQK03 readiness has its own document; it must not leapfrog a missing KRK selector.


## Postscript — 29 October: owner-authorised staged integration

The earlier **“keep both PRs draft and unmerged”** sentence records the conservative decision *before* the owner's new request to commit, merge, push and fast-forward the completed staging work. The latest direction allows **only the dormant Playground code and tests** to be integrated into `main` with all KRK gameplay/start gates still explicitly `false`. This does **not** authorise merging the incomplete upstream mathematical extraction or advertising KRK gameplay. See [KRK02_CLOSEOUT.md](KRK02_CLOSEOUT.md) for the exact verified status, and [KRK03](../NEXT_SESSION.md) for the next executable, proof-driven finalisation session.
