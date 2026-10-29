# KRK01 — Proof-to-policy extraction audit and gated local-witness implementation

**Release status: BLOCKED. KRK gameplay is NOT enabled.** This report is an execution result, not an implementation plan or a claim of full KRK play.

## Exact sources pinned (read-only)

| Source | Main or immutable freeze |
| --- | --- |
| Maths parent `jfairfaxball-348/engame-chess` main at original inspection | `e7de0930fc61caeb11795cf3c10fde11e4774a40` |
| Parent main at continuation inspection (KRK proof files unchanged; KQK-only addition) | `6f64110b7db1fd57493a5478f0ae303798537fbc` |
| Playground main at branch creation | `6bad2d9c5e653f6d2aa301b250789a6c8209812d` |
| EC-T0019 v1 frozen proof-source commit | `4acc3e8638a916f329788d4c2b5f0db6f2c9bf67` |
| EC-T0048 v1 frozen proof-source commit | `2311abe71bc1a4eed47026feccd5ba5a0760d5bb` |
| EC-T0049 v1 supporting proof-source commit | `4275e227ce88f966c1d663117a3081b55179fc35` |

All relative source paths below refer to the read-only parent repository at the pinned main revision. The frozen representative theorem, not a prose gloss or a numerical minimax distance, remains authoritative.

## Proven mathematical result versus executable selector

- EC-T0019: `EndgameChess.Rules.krk_strong_arrival_force` establishes clock-free forced mate for strong-to-move legal KRK arrivals. `krk_weak_force_safe_iff` classifies weak-turn mates and safe-rook legal-reply cases; unsafe captures/stalemates are not winning.
- EC-T0048: `KRKCentral.fresh_outcome`, `fresh_arrival97` and `fresh_weak98` prove the exact clock-zero outcome criterion and **upper bounds** 97/98 plies. They do not imply an optimal mate distance.
- EC-T0049 supports bounded exact high-clock/history slices and does not expose a generic global executable selector.
- `formal/EndgameChess/Rules/KRKWinning/Policy.lean`: `winning_policy` defines its global move function using **`Classical.choose (existsChoice s)`**. `Actions.lean` extracts an *existential* successor from `F`; `Safety.lean` proves preservation for the chosen policy; `FromForce.lean` supplies an abstract horizon from `fuel s`. This is logically correct but is **not directly computable JavaScript**.
- `formal/EndgameChess/Rules/KRKCentral/Arrival.lean`: `arrival97` calls `setup_arrival_budget` and proves `MateWithin`, not a coordinate-to-action procedure.
- `formal/EndgameChess/Rules/KRKCentral/Prep.lean`, `ReadyCut.lean`, `Full.lean` and `KRKBox/Phase.lean` provide strong constructive geometric cases, but a complete, total, deterministic **dispatcher** that executes the recursively selected witness at every legal board/history state, with a decreasing bound, has not been ported or verified.

An existence theorem cannot safely be implemented by choosing the first legal move: many legal rook moves permit capture, stalemate or wasted repetitions. A successful local wall step does not establish that repeatedly selecting walls leads to mate. Reading the frozen `F` relation or a `Classical.choose` witness at runtime is also not a permitted move oracle.

## What was actually implemented

`src/krk-local-witness.js` introduces *one-step* coordinate translations behind the independent `KRK_GAMEPLAY_RELEASED = false` flag. Every use requires an explicit named rule; there is **no automatic move selector** and no call from the Maths game loop.

| JavaScript rule | Frozen Lean construction | Input scope / output |
| --- | --- | --- |
| `rescue` | `KRKForcing/RookRescue.lean`: `krk_barrier_rook_rescue`; `WallActions.lean`: `wallFarFile` | Strong-turn, strictly ascending rank wall, threatened rook `d∞(R,k)<2`. Move rook to file 0 when weak file >=4, otherwise file 7. After all legal weak replies, the distant wall is retained. |
| `wall` | `KRKForcing/WallActions.lean`: `wallWaitFile` / `krk_wall_rook_move` | Strong-turn strict rank wall. Distinct target on same rook rank, file separation >=3. All weak replies remain above the barrier, with rook-file separation >=2. |
| `pursuit` | `KRKForcing/WallActions.lean`: `pursuitFile`, `pursuit_king_step`, `krk_pursuit_king_move` | Narrow lower band, strong king one rank below rook, defending king one rank above, file gap >=2, rook/defender file gap >=3. Advance strong king one file toward defender. Every legal weak reply satisfies the lemma's limited continuation geometry. |

The implementation checks exact three-piece KRK, player turn, setup legality, ongoing state and the chosen lemma's geometric hypotheses. It returns the actual legal chess move, declaration name, input history/clock metadata, and **`maxMatePlies: null`**. It will never advertise a progress rank or a mating deadline it has not derived. All-reply runtime checks are supplementary diagnostics, not new proofs.

`test/krk-local-witness.test.js` includes both strong colours, fixed rescue/wall/pursuit examples, invalid geometry, tampering, clock-near-limit metadata, capture-to-KK, explicit non-release assertions, and deterministic broad fixture sweeps of all legal weak replies for each applicable single-step witness. **It does not claim full legal KRK enumeration, complete adversarial games, or theorem verification.**

## KRK01 continuation — proved geometry in all four certified frames and mate in one

This continuation adds *explicit* geometry but still no recursive winning move selector:

1. `src/krk-local-witness.js` now takes an explicit isometry `id`, `flip-rank`, `swap-axis` or `anti-axis`. These are exactly the coordinate actions of the parent `symId`, `symY`, `symSwap` and `symAnti` from `KRKForcing/AxisWalls.lean`. The parent `KRKForcing/StrategyTransport.lean` and `KRKBound/Transport.lean` prove the corresponding move/forcing transport. In JavaScript each square map is an involution; the candidate is pulled back and legality is checked on the **original board and original clock/history**, not a reset or transformed history. There is **no auto-choice** of symmetry/phase, and no original 97/98 guarantee asserted for a local move.
2. `src/krk-immediate-witness.js` ports `KRKImmediate.rankTarget`, `fileTarget`, `MateNow`, `immediate_iff`, `KRKMateGeometry.Horizontal` and `kernel_mate_iff`. Rank target = `(rook.file, weakKing.rank)`; file target = `(weakKing.file, rook.rank)`. `Horizontal` requires a checked king on the bottom/top edge, a strong king on the corresponding rank 2/5, the >=2-file rook clearance, and corner/interior coverage exactly as in Lean. The transposed case gives vertical mate. A legal rook-ray candidate satisfying the exact predicate is checked to produce actual mate, then returned with a **1-ply** terminal certificate only. A non-mating or malformed position gets no witness.
3. In the Maths proof panel, if an owner-arranged **strong-to-move fresh position** satisfies `MateNow`, the panel explains the rook move, the exact 1-ply deduction and EC-T0049 source. The Start button **remains disabled for all KRK**. No Maths adversarial policy imports either one-step library; the separate Engine Playground is unchanged.

### Actually observed verification at continuation stage

[Successful full build and browser QA #40864665178](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/40864665178) completed **59/59** Node tests, `npm run check`, `npm run build`, Maths Chromium QA at 320/390/768/1280 and independent Engine Chromium QA. The finite immediate-mate diagnostic independently compared **6,792** legal edge-family KRK strong-turn boards with actual legal mate results, including **420** immediate mates. The four-frame one-step cases were checked for both colours and every legal weak reply in sampled and broad geometric families. These are **finite diagnostics**, not an executable global theorem/certificate.

### Authentic cross-repository source link (this continuation)

The Playground now has `proof-sources/krk.lock.json` containing the immutable upstream parent SHA `e7de0930fc61caeb11795cf3c10fde11e4774a40`, per-file Git blob identifiers for **11** relevant frozen Lean files and theorem records, and the independent freeze-source SHAs for EC-T0019/0048/0049. The new `npm run verify:krk-sources` reads those exact bytes from the pinned upstream GitHub raw URL, recomputes Git blob hashes, and fails closed on unavailable, mismatched, or missing sources; theorem record text is additionally checked against its frozen proof-source commit. `.github/workflows/check.yml` now requires this verification in PR and main builds, alongside Node tests and two browser QA suites. Unit tests additionally exercise lock validation, tampered bytes and unavailable-source failure.

The Maths proof panel's KRK links now target the **immutable pinned source commit**, not a mutable `main` URL. Source-code headers have been reconciled with the same SHA. This is a **real read-only code/proof provenance link at build time**; it is emphatically *not* loading Lean as a chess engine or extracting a total computational winning policy. Hash verification proves exact source identity, not JS-to-Lean functional correctness of new code. Normal application play has no GitHub network dependency.

[Source-lock CI #40867233138](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/40867233138) passed; the final amended head's own workflow must also pass before treating the PR as green.

**Trust boundary remains:** mate-in-one is a complete executable terminal *case* only, not a complete KRK winning strategy; local wall witnesses do not supply a globally decreasing rank or an adversarial full-game route to this terminal case.

## Outstanding mathematical/engineering release obligation (smallest sound next step)

Provide an executable, proof-corresponding **total move-selection interface** for strong-to-move KRK with:

1. A finite set of named geometric phases covering every strong-turn legal KRK arrival, including canonical coordinate frames/reflections, capture prevention, rook rescue, centralization, wall/box contraction and terminal finishing;
2. A deterministic choice of legal next move and successor phase for each phase whose cases cover **all** legal weak replies (not only agreeable ones);
3. A proved numeric decreasing certificate or carry-forward horizon along the *chosen* move and every defender response, yielding the original **97/98 root-bound**, without resetting the clock budget midgame;
4. An explicit semantic bridge for the original rule-history model (50-move progress, repetition/claims, terminal and KK capture) and a way to compare JavaScript outputs with the corresponding frozen Lean action conditions.

One possible upstream-style artifact would be a computable `KRKChooseMove : State -> Option (Move × Certificate)` plus Lean proofs of legality, universal reply preservation and bounded mate under its concrete choices. **No modification to the parent repo was attempted or requested here.** An exhaustive finite diagnostic alone, a heuristic, a retrograde policy or an engine is not a legitimate substitute.

## Release verdict

KRK remains correctly outcome-classified and **not playable**. The existing Maths editor, original piece locations/orientation, KK/KBK/KNK gameplay, proof panel and independent Engine Playground are unchanged. No Vercel release is warranted. The correct next engineering operation is to finish the complete constructive interface, prove/trace its correspondence, then run complete adversarial and browser gates before opening a non-draft release PR and merging.
