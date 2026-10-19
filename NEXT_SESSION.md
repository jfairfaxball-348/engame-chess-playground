# NEXT SESSION — S003: Chessboard visual overhaul and interaction usability

**Owner activation:** On "run next session", execute this full S003 immediately in **`jfairfaxball-348/engame-chess-playground`**. Lightweight practical UI/webapp session, NOT a mathematical research session. Read `AGENTS.md`, README, current app/engine/chess files, tests and `docs/ROADMAP.md` first. Do not modify `jfairfaxball-348/engame-chess` or its UWS/frozen sources/session protocol.

## Hard boundaries — must remain intact

This repo does **no new chess mathematics**. It is a playing interface for *completed, formally verified, frozen and owner-authorised* results already developed upstream. All new mathematical work belongs in the main repo only. A strategy's frozen existence theorem is not by itself an executable policy. No Stockfish/Syzygy/UCI/tablebases, external chess engines, model calls, remote searches or heuristic guessing disguised as mathematics.

**KRK is NOT RELEASED.** The owner explicitly wants to WAIT for the KRK work to be *properly finished in the main repo* and to approve its import. `MATERIAL.krk.playable=false`, the engine returns no KRK decision, and `newGame(...,'krk')` refuses to start. Keep this true. Do not reopen S002's partial proof-pattern work or re-add `src/proof-policy.js`. No KRK policy implementation, mathematics, testing for stronger results, or KRK enablement in this session. Only K/K+B/K+N are playable demonstration classes.

## Principal task: make the chessboard feel like a polished chess website

The owner dislikes the present UI and specifically wants a **chess.com-inspired look and feel**, not a clone of its branding, source code or unlicensed chess sprites. Their critical bug: **the squares/grid appear to resize or jump when moving pieces**, possibly because Unicode/sprite font metrics affect layout. Fix that root cause, don't simply cover it with animation.

1. **Board and layout**
   - Make the board visually dominant, simple, attractive, with classic muted green/cream alternating squares, clear coordinates, strong piece contrast, unobtrusive move dots/capture rings, selected square and last-move highlights.
   - Preserve exact 8×8 geometry (all 64 equal squares) at every instant: responsive 1:1 board width, explicit 8 equal grid tracks in both directions with `minmax(0,1fr)`; grid children `min-width:0; min-height:0;` and visual assets not permitted to affect tracks. Reserve a stable board/status area across editor/play, selection, move animation, opponent turn, resizing and history growth. Keep controls from pushing or stretching the board.
   - Render pieces at consistent predictable scale, centered in square and **out of layout flow** (absolute, proportional width/height, `object-fit:contain` or SVG viewbox); avoid Unicode font-based sizing and intrinsic raster differences. Prefer small, sharp, locally bundled vector chess pieces under an explicitly suitable license, or make original vectors; no hotlinked / copied chess.com assets. Keep SVG bounds consistent for K/B/N/R, both colours. Handle loading before showing board, zero CLS.
   - Responsive mobile touch board (especially Android) and desktop. Avoid horizontal scrolling or elements covering the squares; maintain 44px-ish tap targets when space permits. Ensure board orientation flips to player's colour without mirrored letters/pieces, and square labels remain correct.

2. **Both interaction modes, neither removed**
   - **Click-to-move:** tap/click a friendly piece to select, show its legally available destinations, tap/click a destination to move. Clicking another friendly piece changes selection. Selecting same piece again cancels. Invalid clicks give clear feedback.
   - **Drag-and-drop:** on mouse/touch/pen, drag a piece to a legal destination and commit one move. Use robust pointer events/pointer capture and an optional smooth drag ghost; illegal drop snaps back. Drag must not become an accidental click; keep tap-click reliable. Prevent touch-scroll only while interacting with the chessboard, not globally. Correctly handle pointercancel, release outside board, capture, black orientation, rapid opponent response and disabled interactions when waiting.
   - **Editor:** keep palette click-to-place, support dragging already placed pieces to new squares if sensible; support erase/reset, selecting white/black, and local geometry validator. Never accept illegal setup on Start.
   - Both methods use the SAME underlying legality/move application code, ensuring no duplicate game moves, wrong side moving, false captures, race with the adversary, or ghost selections.

3. **Usability and accessibility**
   - Minimal visible chrome: the board first, compact class/colour/turn setup nearby, clear Start/Reset/Edit buttons, discreet move history, status and explanation; simplify noisy staging/developer labels.
   - Clear feedback for legal moves, last move, check, game over; reliable focus styles, keyboard-accessible square controls and meaningful aria labels; mouse/touch parity.
   - Keep KRK labelled **Coming later** and disabled, with concise explanation. Never suggest the chess engine learned or proved anything itself.

4. **Verification and safeguards**
   - Investigate and *reproduce* the square-jumping bug. Test selecting and executing moves, repeated alternations, captures where applicable, piece rendering and move-history changes at mobile and desktop widths. Assert all 64 square rects share equal dimensions and the board rect stays 1:1 before/after actions (allow intentional viewport resize only). No layout shift due to image intrinsic size or re-render.
   - Test both interaction modes with white and black orientation, both sides moving first, legal/illegal drops, touch pointer cancellation, editor, start/edit/reset, post-game lock and responsive UI. Browser-level checks if available; otherwise accurately describe what was inspected vs not verified in a real browser.
   - Verify the KRK runtime release gate and absence of any external chess engine remain intact; run `npm test`, `npm run check`, `npm run build` plus hosted checks if accessible. If unavailable do NOT pretend they passed.
   - Do not sacrifice board interaction quality to build more features. Keep the code self-contained and Vercel compatible; avoid dependencies unless demonstrably warranted and explicitly disclosed.

## Closeout

Make and commit actual UI changes into playground `main`, verify the remote head and Vercel if accessible, summarize improvements with before/after behavioural evidence, report actual tests and any unverified environments. Update README/roadmap to reflect actual implementation. Install an entire, practical **S004 UI QA/polish prompt** (or a specific usability repair follow-up) in `NEXT_SESSION.md`. Do NOT schedule KRK porting until upstream is finished and the owner explicitly releases it.
