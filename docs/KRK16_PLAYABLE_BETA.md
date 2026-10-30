# KRK16 — Playable experimental Maths opponent

30 October 2026. Owner has explicitly prioritised shipping a working mathematical demonstration over a complete proof that the *specific JavaScript controller* satisfies all FIDE history rules and a global all-defender mate theorem.

## Owner's clarified product intent

The Maths tab is a **strategy playground**, not a proof presentation. Do not display theorem derivations, proof steps, or in-depth WDL equations alongside play. The source mathematics stays in `engame-chess`. Show a simple material label and let the user arrange positions, make legal moves, watch the opponent and understand limitations when the experimental policy cannot continue. Legal terminal results are shown as game outcomes, not new mathematical claims.

## Behaviour

- Place exactly two kings and one rook, choose the side to move, then **Start game**. The human controls the lone king; the source-derived attacker controls the king and rook.
- Starting the game **does not rearrange any piece**. If the rook side is to move first, use **Play opponent's first move** to release its first turn.
- Every KRK attacking move is produced by `krkTaggedStrongChoice` with its actual saved continuation tag. No Stockfish, Lozza, tablebase, minimax, search, first-legal fallback, or runtime upstream lookup occurs.
- Play legal weak-side king moves by click or drag. Undo restores full previous board, history, source token and opening state.
- When the weak king legally captures the rook, transition into the already-released KK draw exploration. The source token is cleared.
- If an unimplemented constructive phase occurs, leave the position untouched and show an explicit refusal message. It is **not** substituted with an arbitrary or external-engine move.

## Scientific interpretation

The material-class theorem says who *can* force mate. It does not mean this **particular tagged JS implementation** has been formally proved to win from every legal root against every defence. This release is a deliberately labelled **experimental demonstration** of the frozen constructive move components. Underlying strong-side class outcome is proved in the research repo; the controller's full-game completeness remains an open obligation. Terminal mate/stalemate checks come from local legal-move rules.

Clock/history claims and 50/75-move parity remain deferred, and the policy retains inherited clock-aware phase guards that may reject very long lines; the app does **not** promise clock-free totality either. A source refusal is a valid beta limitation. `KRK_GAMEPLAY_RELEASED` and `MATERIAL.krk.playable` remain false for certified release. This is **not** a production deployment claim.

## Verification and immediate next material

Run `npm test`, `npm run check`, `npm run build`, source lock verification, both browser QA suites, full first-move coverage and source-continuation diagnostics. New tests cover both rook colours, four orientations, exact arranged start, continuation binding, false-tag refusal, legal rook capture to KK, and browser first move/undo.

KQK was frozen in `endgame-chess` as **EC-T0050**, source commit `c72365a8ba46f59114a2a77d9d38993f6a52df80`. Next priority: **playable experimental KQK** with the same honest beta distinction, not a new all-purpose formal release gate. KPK is still mathematically in progress and should not be misrepresented as finished.
