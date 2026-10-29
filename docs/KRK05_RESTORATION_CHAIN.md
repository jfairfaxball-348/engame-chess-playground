# KRK05 — Verified local restoration chain, **not a complete KRK opponent**

29 October 2026. Draft Playground PR #12 extends the previous two isolated
source translations with an executable, **strictly bounded** restoration
dispatcher and an exhaustive all-defender *diagnostic*.

## What is now wired

- The post-aligned-check restoration region is classified exactly by the
  hypotheses in upstream [restoration_bound](https://github.com/jfairfaxball-348/engame-chess/blob/b4690afeb85f315c94164cfd1d43b9435948eb2b/formal/EndgameChess/Rules/KRKCentral/Restoration.lean):
  rook rescue at margin below three, then upward king catch-up,
  then one centre-alignment step if the king is on file 2 or 5.
- The new \`src/krk-restoration-chain.js\` uses only the already-translated
  \`restorationFar_sound\`, \`restorationKing_sound\` and
  \`restorationCentre_sound\` square constructors. Each is independently
  checked against **every legal weak reply**, both strong colours and all
  four Lean isometric frames. No guessed continuation is allowed.
- After at most three move pairs, the chain reaches the precise **central-wall
  premise** of \`KRKCentral.central_bound\`. It returns a \`handoff\` with
  **no move**, not an unsupported playable claim.
- The diagnostic carries original board, move history and halfmove clock,
  refuses mismatched histories, claimable threefold repetitions and
  conservative 50-move claim windows. These guards do **not** constitute
  a global FIDE history/clock proof.

## Provenance and limits

The upstream [Lean restoration extraction PR #7](https://github.com/jfairfaxball-348/engame-chess/pull/7)
is still **draft and unmerged**, verified at
\`b4690afeb85f315c94164cfd1d43b9435948eb2b\` with
[successful Lean/axiom CI](https://github.com/jfairfaxball-348/engame-chess/actions/runs/40908371875).
The immutable frozen theorem source lock is **unchanged**.

The central-wall endpoint is NOT mate. \`central_bound\` in the parent
proves a bounded *existence* result, but its \`positive_bound\`,
\`wait_even_bound\` and \`ExitBound\` descendants still need a total
coordinate-level executor and all-defender global ranking.

This diagnostic has no gameplay import. \`KRK_GAMEPLAY_RELEASED=false\`,
\`MATERIAL.krk.playable=false\` and Maths KRK Start remain disabled.
Node/CI passing would validate bounded local behaviour only. The Engine
Playground and existing dead-position classes remain untouched.
