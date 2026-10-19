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
3. Select a piece then its highlighted square **or drag it** to a legal destination (mouse, touch, or pen). The local opponent replies. Illegal drops do not change the game.
4. In the editor, choose a piece and tap a square to place it, drag an existing piece to reposition it, or choose Erase. Start validates local legality. Reset restores the arrangement. The board flips when you play Black.

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
- [NEXT_SESSION.md](NEXT_SESSION.md): full next session, currently **S004 browser QA and interaction polish only**.
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
