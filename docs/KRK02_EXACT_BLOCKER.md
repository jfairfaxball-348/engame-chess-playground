# KRK02 — executable-policy release gate: verified obstruction (29 October 2026)

**Verdict: Do not activate KRK gameplay.** This is a reproducible incompleteness of the **extracted selector**, not a counterexample to the parent KRK *winning theorem*. The mathematical parent proves forced outcomes; the downstream executable continuation is not total.

## Pinned entry and CI evidence

- Playground merged `main`: `5041bcb8b44bad8c2db54e06a982199cb32432ec`, with [passing Node/build/Maths/Engine browser CI](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/40879238516). The pass validates the **gated** program; it is not a KRK full-game certification.
- Parent mathematical `main` inspected at `8ba4e9798a8f5f196580ddcf3325444017d19454`. Frozen KRK EC-T0019/0048/0049 source hashes are pinned in [the Playground source lock](../proof-sources/krk.lock.json) at parent `e7de0930fc61caeb11795cf3c10fde11e4774a40`.
- Parent [executable extraction PR #3](https://github.com/jfairfaxball-348/engame-chess/pull/3), initial inspected head `1dbbcd679f4f96ccc1f7b2759e73bbeb94b4714d`, was **draft**, not merged into mathematical `main`. It contains `KRKExecutable.PrepController.prepNext_sound` and `KRKExecutable.WallClimb.wallNext_sound`, but expressly hands off at the lower band. The [Lean build run #40877450420](https://github.com/jfairfaxball-348/engame-chess/actions/runs/40877450420) compiled **482 jobs** and failed the axiom-report **parser** at the final step: 465 long standard axiom-set lines were wrapped across physical lines and rejected by a one-line `grep` predicate. It did not report a Lean typechecking error.
- On the **isolated parent extraction branch only**, commits `b4faaf64a86be0e25dd96b403ae623ff40d4a2ea` and `4ff050e596255556e9e8fac78ceb06b0a9f1e44e` replace the brittle parser with a bracket-aware multiline parser that validates every set against `propext`, `Classical.choice`, `Quot.sound`, and fails closed on unbalanced output. [Verification run #40880281357](https://github.com/jfairfaxball-348/engame-chess/actions/runs/40880281357) was triggered; its final result must be checked separately. A green workflow would *not* prove a total move selector.

## Minimal reproducible handoff

Strong to move: **White Kd2, Ra3; Black Kf4**. Full FEN: `8/8/8/8/5k2/R7/3K4/8 w - - 0 1`. This is a legal, fresh, three-piece root.

The current [JavaScript wall dispatcher](../src/krk-wall-climb.js) returns:
```
krkWallClimbState(root,'id').rank === 0
krkWallClimbChoice(root,'id').kind === 'handoff'
krkWallClimbChoice(root,'id').move === undefined
```
The corresponding [Lean `KRKExecutable.wallNext`](https://github.com/jfairfaxball-348/engame-chess/blob/1dbbcd679f4f96ccc1f7b2759e73bbeb94b4714d/formal/EndgameChess/Rules/KRKExecutable/WallClimb.lean) takes its explicit `none` branch when the wall preparation rank is zero and the lone king is exactly one rank above the rook. The already-shipped [regression fixture](../test/krk-wall-climb.test.js) independently checks this handoff.

The mathematical existence theorem [`KRKCentral.ready_cut_bound`](https://github.com/jfairfaxball-348/engame-chess/blob/e7de0930fc61caeb11795cf3c10fde11e4774a40/formal/EndgameChess/Rules/KRKCentral/ReadyCut.lean) proves a bounded continuation by branching among exit, alignment, protected pivot, and rook-tempo cases; its `MateWithin` conclusion **does not itself expose a total deterministic square-to-square executor with a recursive progress certificate**. `KRKWinning.winning_policy` still uses `Classical.choose`.

## Narrow-band constructive extraction added in this session

After the initial blocker was recorded, the parent **draft extraction branch** acquired `KRKExecutable.ReadyCutTempo.lowerBandTempo_sound` in a new importing module (branch head at the time: `3619907b77424dea033a66859ed477f17a35ac20`; [targeted Lean CI](https://github.com/jfairfaxball-348/engame-chess/actions/runs/40881240292)). It exposes a computable `wallWaitFile` rook move for a **narrow**, unaligned READY lower band, and classifies **every** legal weak reply into *upper exit*, *aligned exit*, or *wide pivot*. Its proof still requires the upstream branch CI to pass and it does not follow those continuations to mate.

The downstream [isolated, unreleased translation](../src/krk-ready-cut-tempo.js) applies the actual frozen wall witness on the original board/clock, checks exact READY narrow premises, and exposes a strict all-reply classification diagnostic, with [both-colour/four-frame tests](../test/krk-ready-cut-tempo.test.js). There is **no** game-loop import and **no** `maxMatePlies` claim. For instance, White Kd2, Ra3 vs Black Ke4 (`8/8/8/8/4k3/R7/3K4/8 w - - 0 1`) qualifies; the move `Ra3-b3` is a one-step witness, **not a completed winning game**. The originally reported Kd2/Ra3 vs Kf4 root is the still-unextracted **wide-pivot** handoff.

This narrows the missing scope; it does **not** satisfy the total-dispatch, certified root-bound, history and production release gates.

## Exact missing verified declarations

To discharge the gate, add new **importing** Lean modules (no frozen-source mutations):

1. `KRKExecutable.ReadyCutNext` or equivalent: a *computable*, legal, complete lower-band/exit/pivot/guarded dispatcher with every legal defender response mapped into the next phase.
2. `KRKExecutable.SetupNext`: computable, oriented/canonical first-step dispatch for **all** legal strong-to-move KRK arrivals, including cases not already in a strict rook wall, with no unproved fallback.
3. `KRKExecutable.KRKChooseMove_sound`: total full-game phase machine and strictly decreasing global rank or carried bound on every defender branch; finish at explicit mate, not READY or an abstract `MateWithin`.
4. A full-clock and rule-history bridge: carry the initial 0 halfmove clock forward honestly; prove the strategy does not allow valid 50-move claims or draw-causing repetition before its asserted 97/98 deadline. Capture-to-KK, weak-turn unsafe/stalemate and terminal cases must remain exact.
5. A reviewed, source-locked JS translation, full adversarial testing and production browser verification before enabling `MATERIAL.krk.playable`, `setupVerdict.canStart` and `KRK_GAMEPLAY_RELEASED`.

**Why the existing wins cannot be used as code:** `KRKCentral.arrival97` and `fresh_outcome` are proof of `MateWithin`/WDL50, but do not provide a coordinate-level selected move. The partial wall potential `12(7-rank(R)) + prepRank` strictly decreases only on its oriented wall domain. Continuing with arbitrary legal moves after a handoff would be a non-certified heuristic.

## Release decision and retained work

The editor may show proof-backed KRK outcome/working and local witness moves. It must **not** offer a KRK opponent until the missing functions are proved and translated. The currently playable K/K, K+B/K, K+N/K and the independent Stockfish/Lozza arena remain unchanged. Do not merge a KRK gameplay release PR on the strength of local tests or a repaired CI parser. The next bounded obligation is to extract the first **lower-band handoff** branch, then derive all-phase composition and the root budget, preserving this FEN as a regression test.

This record is deliberately a blocker/trace report, **not** an assertion that executable KRK or formalised JavaScript was completed.
