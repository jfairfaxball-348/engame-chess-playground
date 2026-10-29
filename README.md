# Endgame Chess Playground

## KRK02 continued verified extraction — 29 October 2026

The current draft [KRK02 execution continuation](docs/KRK02_EXECUTION_CONTINUATION.md) includes two-sided protected rook cuts, guarded king entries, column centring, and a concrete two-file opposition check/king-up phase. The proof-sourced extraction compiled in [upstream Lean CI #40886544904](https://github.com/jfairfaxball-348/engame-chess/actions/runs/40886544904). The non-released Playground translation passed [102 tests and browser CI #40886756069](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/40886756069). **The class-wide executable selector and carried WDL50/97/98-ply budget are still missing: Maths KRK Start remains disabled.** All work is on the separate [draft PR #4](https://github.com/jfairfaxball-348/engame-chess-playground/pull/4) and parent [draft PR #3](https://github.com/jfairfaxball-348/engame-chess/pull/3), not released production.

## KRK02 proof-to-player execution update — 29 October 2026

The KRK02 executable-policy audit confirmed a **genuine missing total selector**, including READY lower-band to protected pivot/exit and endgame finish, despite the upstream 97/98-ply forced-outcome theorem. The unreleased KRK02 audit branch adds a narrow READY rook-tempo proof extraction/JS diagnostic and all-reply tests, but **does not enable KRK gameplay**. See [exact blocker/repro](docs/KRK02_EXACT_BLOCKER.md), [next-session steps](NEXT_SESSION.md) and [KQK03 readiness](docs/KQK03_IMPORT_READINESS.md). Independent Engine Playground and currently released drawn classes remain unaffected.

## Current Maths KRK position — 29 October 2026

KRK01 is incorporated as **proof-sourced infrastructure, not yet playable**: named constructive rook/king moves, board symmetries, geometric mate-in-one and two-ply terminal cases, local wall-preparation and wall-climb progress machinery, all-reply tests and pinned upstream Lean source verification (`proof-sources/krk.lock.json` / `npm run verify:krk-sources`). The entire implementation is JavaScript in the standalone Playground; **the site does not run Lean or access GitHub while playing**.

The user has authorised KRK02 to finish the complete proof-derived adversarial policy and **conditionally** enable KRK only once proven all-phase, all-reply, history and 97/98-root-bound requirements are met. Read [NEXT_SESSION.md](NEXT_SESSION.md) and [the KRK01 proof audit](docs/KRK01_PROOF_POLICY_AUDIT.md). The independent S011 Engine workshop is preserved at [docs/ENGINE_S011_DEFERRED.md](docs/ENGINE_S011_DEFERRED.md), and KQK is the next planned material class when its own upstream proof/extraction gates are met.


Two intentionally separate modes share a single Vercel website:

- **Maths endgame** starts with an empty board and two full piece trays. The only currently arrangeable material is both kings plus at most one bishop, knight or rook; queen and pawn slots remain dark. Its outcome panel is backed by frozen theorems. K/K, K+B/K and K+N/K are playable against a legal-move draw adversary. Newly completed KRK is classified using the frozen fresh-clock theorem, but KRK *play* stays gated until a faithful executable winning policy is derived and verified. There is no engine, search or tablebase in this mode.
- **Engine playground** is a standard, full-rules chess spectator arena. Choose a chess engine for White and Black, Play, Pause, advance one move, change the viewing pace, flip the board or Restart. It is NOT a proof-derived mathematical engine.

## Engine playground

The initial pair is **Stockfish 19 Lite (single threaded WebAssembly)** and **Lozza (JavaScript UCI)**. The Stockfish Lite edition is significantly smaller and weaker than the full engine. Either can play either colour, including mirror matches. Both run locally in browser Web Workers, require no backend or API keys, and the display is deliberately delayed after each move so the games are watchable. The browser may download roughly 2 MB of engine assets on first use. For fair performance comparison, this arena is a spectator/demo interface, **not a calibrated engine-benchmark harness**.

The separate arena uses the standard-chess \`chess.js\` library for legality, promotion, castling, en-passant, checkmate and draw detection. The maths-only \`src/chess.js\` remains untouched and does not gain new material classes.

## Running and deploying

Node 20+ and \`npm install\` are required. Run \`npm run dev\` to build and serve the local static site, \`npm test\`, \`npm run check\`, and \`npm run build\`. Vercel's existing \`npm run build\` outputs \`dist/\`.

Stockfish.js is licensed GPL-3.0: source at https://github.com/nmrugg/stockfish.js, engine source at https://github.com/official-stockfish/Stockfish. Lozza source at https://github.com/op12no2/lozza. chess.js is BSD-2-Clause. Browser engine files are copied unmodified from pinned npm dependencies into static assets during the build.

Original mathematical release restrictions and controls are described in [AGENTS.md](AGENTS.md), and next engineering tasks in [NEXT_SESSION.md](NEXT_SESSION.md).

## October 2026 spectator improvements

The independent Engine Playground now fits its board to the visible browser's width **and height** (resizing responsively), and displays captured opponent pieces alongside each player's name and a +material advantage figure. Flipping the board flips the player strips too. Lozza searches with bounded `go movetime 450 depth 4` instead of unbounded `go depth 5`, and its worker receives a UCI stop request before an unresponsive-engine error is shown. The playback delay is still independent of engine thinking time. Both real engine workers are covered by the dedicated `scripts/arena-browser-qa.mjs` test; the original mathematical mode remains unchanged.

## Play vs engine

In the **Engine Playground** tab, switch Match type to **Play vs engine**. Choose White or Black and either Stockfish 19 Lite or Lozza, then select **Start game**. Click/tap a piece then a highlighted destination, or drag a piece to a legal destination. The engine replies automatically, including an opening move when you choose Black. Promotion has a piece chooser. Undo turn restores the board to before your previous move and the engine's response. New game unlocks your opponent and colour options. Engine-vs-engine spectator play remains available, and Maths Endgame is unchanged.

## S010 experimental chess AI workshop

A new, separate **research programme in Engine Playground** investigates native UCI connections, goal-conditioned chess learning and rigorous Elo testing. Start with [S010 research and architecture workshop](docs/AI_RESEARCH_WORKSHOP.md); the playable proof-derived Maths Endgame and its KRK hold remain unchanged. The workshop is documentation, not a shipped local-engine API.
