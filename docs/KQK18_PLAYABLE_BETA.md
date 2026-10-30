# S018 — Experimental KQK play (30 October 2026)

## Product contract

The Maths tab keeps the **fully worked, board-specific equations and logical proof steps** for KK, KBK and KNK. This is enforced in `src/maths-app.js`, `test/maths-proof.test.js` and Chromium QA. KRK remains unchanged, compact, and labelled experimental. KQK uses the same compact board-first interface; the separate Stockfish/Lozza arena is untouched.

The user can place either colour queen and both kings at **exact chosen squares**, pick either side to move, and start a beta game against the queen side. First opponent move remains an explicit opt-in; undo restores the exact setup and source continuation. A legal capture of the only queen changes to the existing proved KK draw demonstration.

## Mathematical source, not a JS proof

Outcome classification: upstream **EC-T0050 v1**, verified Lean source commit `c72365a8ba46f59114a2a77d9d38993f6a52df80`. Upstream theorem `KQK.fresh_wdl50` proves that an initially legal fresh queen-side-to-move KQK position is won, and a weak-turn root is won when already mated or when the queen is safe and the weak side has a reply. Fresh bounds: 97/98 plies. None of those results *automatically* constructs the deterministic JavaScript policy.

The KQK beta move selector `src/kqk-source-policy.js` is an **incomplete, source-tagged direct reimplementation** of named constructive phases:

- `EdgeForce.edge_wall_bound`, `Edge.corner_prison_bound`: queen wall on penultimate rank, weak king on last rank, strong king below; two-file confinement, front_setup queen slide or harmless king tempo, corner-prison escort toward (6,5), protected queen mate.
- `ShadowForce.shadow_strong_bound` and `shadow_weak_bound`: distant king/queen knight-offset family, explicit harmless king tempo, then queen copies the lone king's one-square move while the potential decreases. State is tied to a tagged, one-reply continuation token.
- `ShadowExit.shadow_exit_bound`: proved edge exits through a reflected/swapped wall, top prison or the bottom exceptional checking transition.
- `FramedFinish` / `Symmetry`: same constructive geometry under the eight chessboard isometries.

The selector does **not yet** implement all the universal setup and separating-rank cases of `KQK.StrongEntry`. From many legal roots (including some otherwise winning ones) it therefore **refuses to move**. Such a refusal is explicitly displayed; no Stockfish/Lozza, UCI, Syzygy, tablebase, recursive search, minimax, first-legal or invented fallback is used. This is a playable *subset*, not a general production-strength opponent, and is never represented as a formally certified JS winner. `MATERIAL.kqk.playable` stays **false** for certified release.

The full FIDE fifty-/seventy-five-move clocks and repetition-history parity remain deferred at the owner's request, rather than blocking the beta. KPK remains disabled until its own proof is completed upstream.

## Verification and limits

Automated tests cover queen ray attacks and blockers, both queen colours, exact placement, source edge mating and defended replies, source shadow continuation and forged-token refusal, exposed-queen capture to KK, and regression to full drawn-class workings. Chromium checks explicitly set up and mate from a user-positioned KQK board and verify Undo restores the starting squares.

These tests **do not certify the unimplemented general selector**. If a source phase is not supported, leaving the position unchanged is the required safe behaviour.

### Source anchors

- [Frozen classification](https://github.com/jfairfaxball-348/engame-chess/blob/main/theorems/frozen/EC-T0050/v1.md)
- [Proof at immutable source SHA](https://github.com/jfairfaxball-348/engame-chess/blob/c72365a8ba46f59114a2a77d9d38993f6a52df80/formal/EndgameChess/Rules/KQK/StrongEntry.lean)
- [Edge constructive family](https://github.com/jfairfaxball-348/engame-chess/blob/c72365a8ba46f59114a2a77d9d38993f6a52df80/formal/EndgameChess/Rules/KQK/EdgeForce.lean)
- [Shadow family](https://github.com/jfairfaxball-348/engame-chess/blob/c72365a8ba46f59114a2a77d9d38993f6a52df80/formal/EndgameChess/Rules/KQK/ShadowForce.lean)
