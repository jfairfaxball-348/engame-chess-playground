# NEXT SESSION — S006: Cross-browser/mobile input and undo/restart edge cases

**Owner activation:** "run next session" authorises immediate execution of S006 in **jfairfaxball-348/engame-chess-playground**. First read AGENTS.md, README.md, docs/ROADMAP.md, the complete app/engine/UI sources, tests and the most recent CI logs/status. This is a practical webapp development session, not a chess-mathematics session. Do **not** modify the parent endgame-chess repository.

## Immutable scope and policy

Play only owner-approved, completed, verified and frozen upstream dead-position classes **K/K+B/K+N**. Preserve `MATERIAL.krk.playable=false`, `newGame('krk')` blocked, `chooseDecision('krk')===null`. KRK remains on hold until upstream completion **and** explicit owner approval. No Stockfish, Syzygy, external engines, minimax, unproved heuristics, online move selection, API endpoints or runtime sync with research. The opponent still uses only the released local legal-move demonstration selector.

## Highest-priority gate: retain green CI and stress actual user flows

1. S005 has a **completed green baseline**, [GitHub Actions #39304665312](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/39304665312) at commit `e9ab1a6ff2eb3e8ffa00686e987f84be629d3551`. Start by inspecting the latest Actions run and its separate Node+Chromium commit status, and maintain green `npm test`, `npm run check`, `npm run build` and `node scripts/browser-qa.mjs`. Don't confuse Vercel success with QA success.
2. **S004's drag failure was diagnosed and fixed:** the raw Playwright mouse coordinates were off-viewport and generated zero pointer events; scroll-before-drag corrected the harness. S005 also fixed a genuine `focusin` rerender bug affecting arrow-key navigation. Preserve both regressions and extend tests for rapid move/restart/undo, dragged pieces during resize, alternate browser input and focus race conditions. Never replace the drag test with clicking.
3. Keep existing Chromium passes for single-dispatch mouse drag, illegal/outside drop, ghost cleanup, pointercancel + immediate click, Chrome CDP touch at 390px, editor and black orientation. Add **Firefox and WebKit** automation if available in CI, or document exact constraints. Exercise mouse, touch and a physical Android/pen device if available; never claim hardware tests from Chromium emulation. All five widths 320/360/390/768/1280 must retain stable 8×8 square geometry.
4. Verify keyboard roving Tab (only one active square Tab stop), arrows in both white- and black-bottom orientation, Enter/Space play, Escape deselect and focus preservation after rerenders, engine replies, restart, undo and flip. Explicitly investigate `focusin` event order and preserve navigation targets.

## Controls / edge cases

5. Exercise repeated Undo turn: immediately after a human move but before engine reply, after computer reply, after captures, after game end and with human Black (computer opening). Check board, side to move, halfmove clock, repetition history, last-move overlay and explanation are restored exactly from the snapshot, never inferred. Restart from this setup must cancel pending timers, clear clocks/history/undoStack, retain the agreed editor setup and refuse invalid arrangements.
6. Review piece selection/erase/replacement, illegal editor validation, orientation flipping without changing colours, selected-state feedback, mobile history and viewport stability. Verify all code is accessible with a real keyboard and touch (where CI offers it); explicitly report Firefox, Safari/WebKit, Android hardware or pen interaction not tested.

## Release and documentation

7. After changes, run or obtain the **completed** Actions run and inspect logs; keep Node/Chromium green, and separately report any extra browsers/hardware actually tested. Fix real failures before accepting new features; be precise about unavailable hardware. Vercel deployment and code/browser QA remain separate. Do not claim local npm/Playwright runs if they only occurred in GitHub Actions.
8. Keep README, AGENTS.md, docs/ROADMAP.md and a concise S006 QA report aligned to observed results. Commit all scoped changes to playground main. Install a complete **S007** successor prompt targeting the most important remaining player-facing reliability/usability gap (not upstream mathematics). Include exact commit SHA, tests and action/deployment links in closeout.

This work must improve only the playing interface and its independently implemented released decision machinery; **do not advance, solve, unlock or schedule KRK**.
