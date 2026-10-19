# NEXT SESSION — S006: Reliable drag/drop, browser QA and final interaction polish

**Owner activation:** "run next session" authorises immediate execution of S006 in **jfairfaxball-348/engame-chess-playground**. First read AGENTS.md, README.md, docs/ROADMAP.md, the complete app/engine/UI sources, tests and the most recent CI logs/status. This is a practical webapp development session, not a chess-mathematics session. Do **not** modify the parent endgame-chess repository.

## Immutable scope and policy

Play only owner-approved, completed, verified and frozen upstream dead-position classes **K/K+B/K+N**. Preserve `MATERIAL.krk.playable=false`, `newGame('krk')` blocked, `chooseDecision('krk')===null`. KRK remains on hold until upstream completion **and** explicit owner approval. No Stockfish, Syzygy, external engines, minimax, unproved heuristics, online move selection, API endpoints or runtime sync with research. The opponent still uses only the released local legal-move demonstration selector.

## Highest-priority gate: make actual browser QA green

1. Inspect the latest GitHub Actions run and the separate **Playground Node + Chromium QA** commit status (do not mistake successful Vercel deployment for successful tests). Confirm `npm test`, `npm run check`, `npm run build` and `node scripts/browser-qa.mjs` individually.
2. The previous S004 run #35 failed during **mouse drag** after unit/build/geometry/keyboard passed. S005 expanded browser QA with `Mouse drag diagnostics` logging pointerdown/move/up/cancel and click traces; inspect the first failing S005/S006 run, including the updated arrow-navigation fix. Diagnose and fix actual pointer dispatch, square targeting, capture loss or synthetic click behaviour. Correct application logic rather than simply weakening tests. Do not mask a broken mouse drag with an equivalent click.
3. Require reproducible single-dispatch mouse drag to a legal square, correct snapback for illegal/outside drops, no residual drag ghost, a working immediate click after pointercancel, and working Chrome CDP touch drag on a 390px viewport. Test both board orientations and game/editor modes. All five width geometries 320/360/390/768/1280 must remain 8×8, squares equal, board stable before and after moves and controls.
4. Verify keyboard roving Tab (only one active square Tab stop), arrows in both white- and black-bottom orientation, Enter/Space play, Escape deselect and focus preservation after rerenders, engine replies, restart, undo and flip. Explicitly investigate `focusin` event order and preserve navigation targets.

## Controls / edge cases

5. Exercise repeated Undo turn: immediately after a human move but before engine reply, after computer reply, after captures, after game end and with human Black (computer opening). Check board, side to move, halfmove clock, repetition history, last-move overlay and explanation are restored exactly from the snapshot, never inferred. Restart from this setup must cancel pending timers, clear clocks/history/undoStack, retain the agreed editor setup and refuse invalid arrangements.
6. Review piece selection/erase/replacement, illegal editor validation, orientation flipping without changing colours, selected-state feedback, mobile history and viewport stability. Verify all code is accessible with a real keyboard and touch (where CI offers it); explicitly report Firefox, Safari/WebKit, Android hardware or pen interaction not tested.

## Release and documentation

7. Fix the first CI failure, commit, then check the new **completed** Actions run and its logs; repeat until the suite is genuinely green, or precisely document an unavailable external test/blocker. Vercel deployment status and code/browser QA status must be reported separately. Do not claim local npm/Playwright runs if they only occurred in GitHub Actions.
8. Keep README, AGENTS.md, docs/ROADMAP.md and a concise S006 QA report aligned to observed results. Commit all scoped changes to playground main. Install a complete **S007** successor prompt targeting the most important remaining player-facing reliability/usability gap (not upstream mathematics). Include exact commit SHA, tests and action/deployment links in closeout.

This work must improve only the playing interface and its independently implemented released decision machinery; **do not advance, solve, unlock or schedule KRK**.
