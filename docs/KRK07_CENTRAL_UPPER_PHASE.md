# KRK07 — All-defender upper-wall rank increment (UNRELEASED)

**29 October 2026.** This session composes two existing, exact-source
Lean constructions into one bounded multi-pair phase. It does **not**
complete, certify, or enable KRK gameplay.

## Formal source and composition

Source branch: [engame-chess KRK06 PR #8](https://github.com/jfairfaxball-348/engame-chess/pull/8),
exact tested head `3991ab34a9e4fc747529ef6edc5f58f53372b72e`.

- `KRKExecutable.readyUpperDestination_sound` gives a concrete rook move
  from READY with the weak king at least two ranks above the rook, and
  proves the resulting rook rank increases by one and the weak king
  remains above it after **each** legal defender reply.
- `KRKCentral.restoration_bound` restores the FULL central-wall condition
  after rank advancement. The previous KRK05 extraction supplies the
  exact rescue, catch-up and centre-alignment moves for at most three
  strong/weak pairs.
- `KRKCentral.exit_step_bound` composes these in Lean's existential
  `MateWithin` proof. This theorem does **not** yet supply a complete
  computationally executable, history-aware central-to-mate controller.

Playground implementation:
`src/krk-central-upper-phase.js` exposes the restricted
`krkCentralUpperPhaseChoice` and `krkCentralUpperRestorationNext`,
plus an independent `auditKRKCentralUpperPhase`. The audit expands
all legal weak responses at each of the restoration pairs. It verifies
the phase reaches the next central wall (one rank higher) in **at most
eight plies**; that is a *phase bound*, not a mate bound. Selection is
by named proof-coordinate constructors, not by searching replies.

The code checks the actual current board and retained history. It fails
closed for invalid histories, claimable threefold positions, 50-move
windows and any unavailable proof-source step. It does not silently
choose the first legal move. The Engine tab is unchanged.

## Audit scope and blocker

`test/krk-central-upper-phase.test.js` covers three upper-band
starting geometries, both colours and four exact proof frames
(24 phase roots), plus negative clock, history and geometry cases.
The phase's complete defender-reply tree is checked to the next
central-wall handoff. The final required repository CI must include
Node, frozen-source verification, phase domain, build, Maths browser
and Engine browser checks on the exact PR head.

**Global KRK is still absent.** The missing mathematical and translation
steps are:

1. A central lower-band all-defender executable recursion:
   `positive_bound`, `back_bound`, `wait_even_bound`, guarded
   and column pivots, `ExitBound`, edge-to-mate closure.
2. A globally complete root-selection and rank argument for legal
   strong/weak turns and proof frames, including genuinely drawn/
   captured-rook roots.
3. A history-aware global FIDE safe budget, actual checkmate endings
   and correct draw adjudication for claims/automatic termination.

No completed-game-to-mate universal test exists. Do not merge this
stacked PR as a gameplay release. Preserve
`KRK_GAMEPLAY_RELEASED=false` and `MATERIAL.krk.playable=false`.
`;