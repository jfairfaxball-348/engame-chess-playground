# S005 — Usability and real-browser QA closeout

Date: 2026-10-19. Scope: **jfairfaxball-348/engame-chess-playground only**.

## Implemented

- Single roving keyboard Tab stop for the 8×8 board; arrow keys move in screen-relative directions for White- or Black-bottom orientation; Enter/Space activates squares; Escape clears game selection. Key targets survive DOM rerenders and computer replies.
- Restart from this setup reinitialises `newGame`, board, clock, position-key history, move log, overlay, engine note and undo history, cancelling any pending opponent timer.
- Undo turn stores explicit board/log/history/halfmove/turn snapshots before the human move and restores the exact state whether the computer reply is pending or complete. It cancels the pending timeout. It does **not** undo a computer-first opening move when the human has not played yet.
- Editor piece buttons have text/ARIA labels, selection state and an Erase affordance. A Flip orientation control does not swap board colours or modify game state. History distinguishes You and Opponent.
- All move selection still uses the original locally implemented released dead-position policy; no upstream lookup or 3rd-party engine. K/K+B/K+N remain released; KRK remains disabled and blocked by `newGame` and `chooseDecision`.

## Real CI evidence

- Earlier S004 [run #35](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/39285471688) had green Node tests, check, build, five viewport geometry passes and keyboard focus, but failed at mouse drag.
- S005 fixed a genuine **keyboard rerender focus bug**: the `focusin` listener overwrote the requested arrow target during DOM replacement. Preserve target in a local before rerender.
- Pointer diagnostics showed **no pointer events** in the old mouse test on a 1280×850 viewport, because Playwright's `page.mouse` did not scroll an offscreen e1 into view. The helper now scrolls the square before obtaining mouse coordinates; the outside-board test chooses an in-viewport exterior target. The test failure was due to the automation harness, not confirmed broken app pointer logic.
- Final verified code commit **`e9ab1a6ff2eb3e8ffa00686e987f84be629d3551`**: [successful GitHub Actions run #39304665312](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/39304665312), test job **success**. Individual steps **npm test**, **npm run check**, **npm run build**, temporary Playwright installation and `node scripts/browser-qa.mjs` all **success** on GitHub-hosted Ubuntu runner with Node 22 and Chromium.
- Chromium browser log confirms geometry/click/computer response at widths **320/360/390/768/1280**; keyboard Enter/Space/focus/live status; mouse drag single dispatch/outside rejection; pointercancel then immediate click; editor drag/reset/illegal validation/black orientation; and CDP touchscreen drag at **390px**. S005 additions also check roving arrows, Escape, Undo/Restart and flip.
- GitHub workflow now publishes the `Playground Node + Chromium QA` commit status distinct from Vercel. On the verified code commit, Vercel reported **success** separately. This does NOT imply an independent manual visit of the live website succeeded.

## Remaining limitations and successor

- No independent physical Android, pen, Firefox or Safari/WebKit run has yet been completed. There is no real-device input latency/gesture assurance from headless Chromium alone.
- The current browser suite checks a representative white human turn and black-orientation movement. More targeted tests for Undo with a Black human, computer-first turn, restart while the computer timeout is pending, captures, repetition history, and rapid repeated interactions remain valuable.
- Undo uses cloned snapshots of the state returned by the independent local chess rules; JavaScript implementation testing is not Lean formal verification.
- S006 is **cross-browser/mobile input reliability and Undo/Restart edge-case verification** (no new chess mathematics or KRK import). See NEXT_SESSION.md.

## Reproduction

```sh
npm test
npm run check
npm run build
npm install --no-save --no-package-lock playwright
npx playwright install --with-deps chromium
node scripts/browser-qa.mjs
```

These commands are confirmed via GitHub Actions. They were **not** independently executed in the assistant's isolated local container.
