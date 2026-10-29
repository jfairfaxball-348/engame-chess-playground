# KRK03 — owner-approved practical game scope and verification

Date: 2026-10-29. This is the **Playground-specific** scope change following KRK02. It does not weaken, modify, or claim a new Lean proof in `engame-chess`.

## Mechanics

1. Use the existing empty Maths board editor. Place two kings and a single rook; both colours are supported. Choose White or Black to move. Start from **those exact squares and that exact turn**.
2. Human side = the side without the rook, always. The computer plays the other side with **king and rook**; it does not call the Engine Playground, Stockfish, Lozza, any tablebase, a cloud API or a minimax solver.
3. For KRK choose the strongest directly applicable constructive rule in `src/krk-play-policy.js`: explicit mate-in-one, opposition check/next king move, narrow READY tempo, protected rook cuts, guarded entry, wall-centering and rescue. New extraction actions link back to the source Lean declaration, while practical king-escort and wall setup are labelled as **non-certified**. Every move is checked for legality and whether the defender can capture the rook next move.
4. **Capture exception (owner explicit)**: with the weak king to move, a rook adjacent to the king and unprotected by the strong king may be legally captured. `play` changes `material:'krk'` to `material:'kk'`, sets `krkRookCaptured`, and the Maths display immediately shows **Guaranteed draw · rook captured**. Undo restores the exact previous rook position and turn.
5. A mate/stalemate remains a terminal result. KQK/Q and P remain unavailable. KK/KBK/KNK and the independent Engine Playground are unchanged.

## Proven outcome versus displayed practical algorithm

The frozen `EC-T0048` theorem establishes the outcome of legal, fresh-clock KRK positions, distinguishing strong-to-move and safe-rook weak-to-move cases from unsafe-rook or terminal draw cases. That is a *mathematical classification*. It does **not** imply this particular set of JavaScript coordinate choices is a complete formal strategy, especially when the geometric setup fallback or alternate frame ordering is used.

The owner explicitly does not require 97/98-ply reproduction, history-parity or full tablebase equivalence for the Maths demonstration. Do not claim the practical player meets those stronger requirements. The proof presentation may show the parent theorem, provided the player itself is labelled practical rather than formally bound.

## Release acceptance

- Run `npm test`, `npm run verify:krk-sources`, `npm run audit:krk-phase-domains`, `npm run check`, `npm run build`; full GitHub CI also executes Maths Chromium and the separate Engine browser smoke tests.
- Test opening from either side with either strong colour, legal move selection, king-to-rook capture, no rook hanging by computer on its next move, exact board fidelity, Undo, mobile widths and a real multi-move checkmate against a defending king.
- Confirm no misleading exact ply guarantee is added to UI. Current global formal-completeness marker is `KRK_FORMAL_COMPLETE_POLICY=false`; it is independent of `KRK_GAMEPLAY_RELEASED=true` in practical mode.
- Only merge and deploy after full workflow green. The mathematical extraction PR #3 is kept independent; downstream implements copy of proved local geometry and practical setup, not a runtime link.

## Limits and follow-up

The current tests are samples of explicit legal and defender play, not an exhaustive adversarial proof of the practical player's eventual mate from all legal strong KR roots. A repeated or stalemated practical line, if observed, is a **real bug to repair**, not evidence contradicting the Lean theorem of existence of some winning policy. A future upgrade may implement a total verified dispatcher if desired; this is **not required** for the present playable milestone.

Links: `AGENTS.md` owner instruction, `src/krk-play-policy.js`, `src/chess.js`, `src/maths-app.js`, `test/krk-gameplay.test.js`, `scripts/browser-qa.mjs`.
