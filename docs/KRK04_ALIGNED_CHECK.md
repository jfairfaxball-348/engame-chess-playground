# KRK04 — aligned READY check: implemented local bridge, **not** KRK release

29 October 2026. Incoming main: `9957ce519a966eb9328e0d7f23cd922fb71b1d6f`.

## Exact change

At a READY lower-band position with the strong king and weak king aligned,
and with a rook/weak-file gap of at least two, the previously missing
first move is **a rook check on the weak king's rank**. This is not a guessed
move: `KRKExecutable.oppositionCheck_sound` (existing pinned upstream source)
proves its legality, and either checkmate or the exact postcondition after
**every** legal defender reply. The Playground dispatch now calls the existing
`krkOppositionCheckChoice` and its all-defender audit rather than returning
an unconditional `aligned-exit` handoff.

An additional isolated Lean extraction has been proposed in the upstream
[KRK04 PR #5](https://github.com/jfairfaxball-348/engame-chess/pull/5)
as `KRKExecutable.AlignedExit.alignedReadyCheck_sound`. The JS uses the
**already pinned** `oppositionCheck_sound`, not an unverified future wrapper.
The wrapper PR must pass Lean/axiom CI and be reconciled with its parent
integration PR #4 before changing any source locks.

## Remaining precise obstruction

Example original FEN:
`8/8/8/8/3k4/R7/3K4/8 w - - 0 1`
(White Kd2 Ra3; Black Kd4; White to move).
The check `Ra4+` is the legal source-derived local action.
After every legal response the weak king advances one rank; this is
not yet a constructive *next-move* certificate.

The source `oppositionFollow_sound` requires an **initial gap of >=4
files**. Here rook a-file to black king d-file gives gap **3**. Thus
merely choosing `Kd3` next would be an unproved substitution. The
known `KRKCentral.exit_step_bound` uses the existential
`restoration_bound` after this first pair; extracting its rescue
and finite king catch-up transitions remains necessary. KQK/KPK
programmes in the parent stay intact.

## Proof boundary

- First rook check and all immediate weak replies: locally
  source-backed; tested in both colours and all four involutive frames,
  including 2-, 3-, and 4-file gaps.
- Full `ExitBound`, restoration, rook rescue and column-to-mate:
  **not yet an executable total selector**.
- Starting from arbitrary legal fresh KRK positions, 93/97/98-ply
  bounds and real repetition/clock trace: **not certified by this patch**.
- `KRK_GAMEPLAY_RELEASED=false`; `MATERIAL.krk.playable=false`;
  Engine tab unaffected. No Vercel deploy attempt during the quota block.

The exact absent programme is recorded in `NEXT_SESSION.md`. Do not
turn this check into gameplay before the entire policy is verified.
