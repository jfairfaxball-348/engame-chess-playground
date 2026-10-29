# KRK03 — READY dispatcher source-to-program bridge (local, unreleased)

**29 October 2026 · Implementation branch:** `krk03-ready-lower-band-dispatch`.

This change **connects** already-existing named Lean-extracted moves without producing
or claiming a global KRK opponent. It deliberately leaves
`KRK_GAMEPLAY_RELEASED=false`, `MATERIAL.krk.playable=false`,
and `setupVerdict(...).canStart=false` for KRK.

## Constructive step graph

| Admitted oriented state | Existing source-corresponding JS/Lean witness | Continuation |
|---|---|---|
| READY upper gap `wk.rank >= rook.rank + 2` | `krkWallClimbChoice` / `KRKExecutable.wallNext_sound`, `readyUpperDestination_sound` | Strict local wall-potential descent; later READY handoff |
| READY lower gap, strong/weak files differ by one | `krkReadyCutTempoChoice` / `KRKExecutable.lowerBandTempo_sound` | Every weak reply upper, aligned, or wide pivot |
| READY lower gap, strong/weak files differ by at least two | `krkWidePivotChoice` / `KRKExecutable.pivotRightCut_sound` or `pivotLeftCut_sound` | Every weak reply protected guarded region |
| Protected rook cut, guard hypotheses true | `krkGuardedEntryChoice` / `KRKExecutable.guardedEntry_sound` or `guardedEntryLeft_sound` | Every weak reply remains beyond protected file |
| READY lower gap, strong/weak files **aligned** | No executable `ExitBound` witness | **Explicit blocked handoff**: never guess a move |

The classifier is deterministic on *framed* exact legal strong-turn three-piece
states with actual incoming history/halfmove. An emitted `step` must come from
one of the existing source-linked witnesses, never a searched position or a
scored move. When no such witness applies, the result is either an explicit
`handoff` or `null`. Neither is a playable move.

For the original repro FEN
`8/8/8/8/5k2/R7/3K4/8 w - - 0 1`, the previous wall-climb
controller hands off at READY. The new local dispatcher selects the already
verified **wide protected pivot** action from the same board. This is
a completed *local* bridge to the guarded-entry phase; it is NOT a completed
mate strategy or total all-position selector.

## Actual CI obligations

`test/krk-ready-dispatch.test.js` checks both strong colours, all four
geometric proof frames and fresh legal positions in each branch. It checks
all legal weak replies after the original wide pivot, and verifies the
subsequent guarded move's all-reply local invariant. It asserts that an
aligned READY root returns a non-playable handoff rather than a fabricated
selector.

`auditKRKReadyDispatch` uses the underlying source-specific all-legal-reply
diagnostics to verify each emitted action. These finite executions are
valuable falsifiers, but cannot substitute for formal Lean proof of the
**entire** winning strategy or a certified JS translation.

## Still blocking release

1. Extract **aligned** `KRKCentral.ExitBound` into a computable coordinate
   selector, and prove its all-defender successor phase.
2. Complete guarded-entry to column/exit/final mating phase transitions.
3. Supply a **total** first-move selector across every fresh legal KRK root,
   including non-wall setup and all symmetries.
4. Prove a single well-founded global all-defence progress argument plus
   FIDE history/clock correspondence through checkmate.
5. Only then enable KRK and prove full played games in Maths Chromium QA.

**No Vercel deployment or production verification during the owner's daily
Vercel usage-limit window.** CI may run independently.
