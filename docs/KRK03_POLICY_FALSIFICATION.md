# KRK03 — executable winning-policy blocker, independently falsified

**29 October 2026. Status: KRK gameplay is NOT released.**

This is a failure of an *attempted practical move selector*, **not** a
counterexample to EC-T0048, EC-T0049 or the existence of a KRK winning policy.

## Baseline and checked evidence

- Playground `main` at entry: `c41ef5a185020453eb409e100d68ca8b40a1d0c2`.
  The separate Playground Node/Chromium status on this commit is
  [green](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/40892705432),
  while Vercel reported a **build-rate-limit failure**, not verified production deployment.
- Parent math integration [PR #4](https://github.com/jfairfaxball-348/engame-chess/pull/4)
  remains **open**. Its [combined-main Lean workflow](https://github.com/jfairfaxball-348/engame-chess/actions/runs/40892358268)
  was **in progress at initial audit**. Neither that PR nor its local source proofs
  establishes a total global move-selector.
- Playground's experimental [draft PR #5](https://github.com/jfairfaxball-348/engame-chess-playground/pull/5)
  is **not** a release candidate under the installed `NEXT_SESSION.md` criteria:
  it explicitly implements a non-certified geometric fallback, with no global
  all-defence progress/bound or history proof. It also fails its own Node tests.
- [PR #5 CI run #40891590400](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/40891590400):
  **106/107 tests passed, one failed**, before provenance/check/build/browser
  jobs could run. `krk-winning-playouts.test.js` returned:
  `strong=w`, `turn=w`, `mode=distance`, `ply=21`,
  `outcome.kind=fivefold` rather than `mate`.
  The move-log tail loops Black Kb8/Kc8 and White Kb1/Kc1; the practical
  opponent fails to force progress and the automatic fivefold rule applies.

## Formal totality gap and minimal proof handoff

Fresh legal root: **White Kd2 Ra3, Black Kf4, White to move**,
FEN `8/8/8/8/5k2/R7/3K4/8 w - - 0 1`.
The extracted `krkWallClimbChoice(root,'id')` returns a
`kind:'handoff'` with no `move` and no mate bound, because its
wall-preparation rank is zero and the weak king occupies the READY lower band.

The local `KRKExecutable/{PrepController,WallClimb,ReadyCutTempo,WidePivot,GuardedEntry,ColumnKing,OppositionActions}`
Lean declarations handle **specific** admitted geometries. Still missing
are (a) total `KRKExecutable.SetupNext` from every fresh legal root;
(b) `KRKExecutable.ReadyCutNext` including all legal defender replies
and phase exits; (c) a global terminating `KRKChooseMove_sound` with
monotone progress and an actual mate; and (d) a genuine history/halfmove
bridge to the source 93/97/98-ply WDL50 bounds.

`KRKWinning.winning_policy` still uses `Classical.choose`. It cannot be
ported as a deterministic coordinate-valued JavaScript function by treating
existence as a chosen move.

## Executed safe regression and release boundary

The new `test/krk03-release-contract.test.js` mechanically checks:
1. the exact READY handoff, and a complete actual move there if any future
   implementation is marked released;
2. agreement among the release flag, material gate, Maths Start and engine
   dispatch for **both** strong colours and initial turns;
3. if KRK is ever enabled, actual full chess games against four deterministic
   legal defending behaviours, both strong colours and either initial side,
   requiring **checkmate**, not fivefold, stalemate, rook loss, 75-move draw,
   or a missing opponent move.

This is a **regression and falsifier**, not a proof of total correctness:
even green full playouts cannot replace a Lean-certified all-reply global
policy. The frozen mathematical source and the separate Engine Playground
remain unmodified. Do not merge the practical gameplay PR as a substitution,
or flip any KRK playable flag on the strength of local tests.
