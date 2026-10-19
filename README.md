# Endgame Chess Playground

A standalone browser playground that turns **completed, formally verified, frozen and owner-approved endgame-chess mathematics** into a playable opponent. This repo is **not a research project**: new mathematics, proofs, strategy discovery, theorem freezing and ultra-weak chess solving happen only in [the main endgame-chess repository](https://github.com/jfairfaxball-348/engame-chess).

**Release direction is strictly one-way:** endgame-chess finishes and freezes a result → owner approves its import → this repo implements a fully local, independently tested opponent for that exact scope. There is no runtime import, lookup or sync. No prebuilt chess engine, Stockfish, Syzygy, model API or remote move selection.

## What can I play now?

| Material | Upstream source | Playground |
| --- | --- | --- |
| K vs K | EC-T0003 | Available — any legal move |
| K+B vs K | EC-T0004 | Available — any legal move |
| K+N vs K | EC-T0005 | Available — any legal move |
| K+R vs K | Partial scope EC-T0019 | **Coming later: NOT PLAYABLE** until main KRK work is properly finished and the owner expressly authorises release |

K/K+B/K+N are *dead-position classes*. FIDE Article 5.2.2 normally ends such a game immediately; the playground deliberately allows further moves to demonstrate the mathematics. This is **exploration**, not a normal FIDE tournament game. The virtual halfmove/repetition history begins at an artificial local starting point, not a certified historic chess game.

KRK was previously exposed using incomplete proof-guided move patterns and an experimental heuristic. At the owner's direction that policy has now been **removed**, not merely renamed. The class remains visible as coming later but cannot be selected for play, including through `newGame`. The old S002 audit is historical and superseded by the binding [AGENTS.md](AGENTS.md).

## Using the web app

1. Choose one of the three available material classes; KRK is locked.
2. Choose your colour and side to move, arrange the pieces in a locally legal position, and start.
3. Select a piece then its highlighted square **or drag it** to a legal destination (mouse or touch; pen hardware is not independently verified). Arrow keys navigate the board without 64 Tab stops, Enter/Space activate a square, and Escape clears selection. The local opponent replies; illegal drops cannot change the game.
4. In the editor, choose a labelled piece and tap a square to place/replace it, drag to reposition, or choose Erase. Start validates local legality. Reset restores the arrangement. Choosing Black initially flips the board; Flip orientation lets you change the view independently without changing colours. During play use Restart from this setup or Undo turn (reverses your last move and the computer response, when present).

The position editor checks local chess geometry, not proof that the position can be reached from the standard initial setup.

## Local development / Vercel

No npm dependencies, credentials, subscriptions or backend. Node 20+:

```sh
npm run dev       # local site: http://localhost:3000
npm test          # rules, release gate and adversary tests
npm run check     # JS syntax
npm run build     # copy static app to dist/
```

Vercel import: `jfairfaxball-348/engame-chess-playground`. Framework Other, root `/`, build `npm run build`, output `dist` (also in `vercel.json`). Ordinary Git integration can automatically deploy `main`; no runtime variables.

## Source of truth and files

- [AGENTS.md](AGENTS.md): **binding upstream-only and KRK hold** rules; explicit owner release gate.
- [NEXT_SESSION.md](NEXT_SESSION.md): full next session, currently **S006 input reliability and cross-browser QA**.
- [docs/ROADMAP.md](docs/ROADMAP.md): engineering milestones.
- `src/chess.js`: locally implemented movement/legality, material availability and game-state rules.
- `src/engine.js`: available dead-class demonstration move selector, no heuristic or upstream runtime lookup.
- `src/app.js`, `src/styles.css`: responsive board, input handlers and interface.
- `src/pieces.js`: original local SVG piece drawings (no external sprites or font glyphs).
- `src/board-ui.js`: screen-square orientation and pointer hit-test helpers.
- `test/ui.test.js`: orientation, SVG and CSS geometry regression tests.
- `test/chess.test.js`: gameplay geometry, availability gate, no-external-engine checks.
- [S002 historical move audit](docs/S002_MOVE_FIDELITY_AUDIT.md): audit of now-withdrawn experimental KRK prototype; **not an active policy**.

S003 implemented explicit 8-row/8-column equal-track board geometry, locally drawn SVG pieces, legal-move indicators, last-move and check highlights, click/touch selection and pointer drag with capture/cancellation. The geometry and modality smoke assertions run in Node; **real browser rectangle measurements and mobile gesture QA are required in S004** and must not be implied by the pure-helper tests.

The aim is an attractive, accessible chessboard for interacting with **already known, verified results**—not a place to make further mathematical discoveries.

## S004 interaction QA — partial pass, drag failure observed

S004 fixed two user-input risks found in code review: re-rendering the entire board could lose keyboard focus, and an elapsed-time 350 ms drag-click suppression could block a legitimate immediate click. After S004, square/palette/control focus is restored after re-render, drag suppression consumes only a synthetic drag click, cancellation clears the drag ghost, and a persistent polite screen-reader live region announces status and setup errors. Visible inset focus styling was also added.

An executable real-Chromium regression suite is in `scripts/browser-qa.mjs`: 320/360/390/768/1280px 64-square rectangle checks, board stability across turns, keyboard Enter/Space, mouse drag and outside-board drop, synthetic pointercancel + immediate click, editor move/reset/invalid Start, black orientation, and Chrome touch drag. GitHub Actions installs Playwright **only for CI**, keeping the shipped app dependency-free. To run manually:

```sh
npm test && npm run check && npm run build
npm install --no-save --no-package-lock playwright
npx playwright install --with-deps chromium
node scripts/browser-qa.mjs
```

The owner's browser check accepted the S003 appearance. After S004, [GitHub Actions run #35](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/39285471688) **passed** unit tests, JS syntax, build, geometry/click/opponent flow at all five widths and keyboard focus, but **failed** on mouse drag (two-move timeout). The enlarged S005 browser test includes event tracing to diagnose that failure. CI and Vercel deployment must be checked independently; a deployed site is not proof of passing Chromium QA.

## S005 — controls, navigation and editor

S005 added a single keyboard Tab stop for the board, displayed-orientation-aware arrow movement, Escape cancellation, and preserved Enter/Space activation. Restart resets the board from the editor-defined setup, including clocks and history. Undo stores the complete pre-human-turn game snapshot and cancels any outstanding computer timer; undo is not offered until you have made a move. The original upstream-backed decision policy and playable-class gate are unchanged.

The editor has individually named piece/Erase controls with selected state, a flip-orientation button that never swaps colours, and clear validation. Move history distinguishes **You** versus **Opponent**.

S005 extended CI to cover these controls and to publish an explicit **Playground Node + Chromium QA** GitHub commit status in addition to Vercel's deployment status. Real-device Android/pen, Firefox and Safari have not yet been independently verified. See `docs/ROADMAP.md` and `NEXT_SESSION.md` for the outstanding browser verification and S006 handoff.
