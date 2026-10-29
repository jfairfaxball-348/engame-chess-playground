# Endgame Chess Playground

## Maths endgame — KRK practical play (29 October 2026)

**K + R versus K is enabled in the Maths tab as a practical, proof-informed geometric demonstration.** Place a rook and the two kings on the empty board, choose the side to move, and press **Start game**. The human **always controls the lone king** (White or Black), and the local computer plays the strong K+R side. If the computer moves first, the existing explicit first-move button preserves the exact arranged position until pressed. All moves remain legally validated and Undo restores the game.

**Important exception:** when the lone king can legally take an unprotected rook, that capture is allowed. The material becomes **K vs K** and the Maths outcome immediately displays **Guaranteed draw · rook captured**. Undo restores the three-piece starting line. This is consistent with the parent EC-T0048 fresh-position theorem: not every **weak-to-move** root is winning for K+R.

The opponent's implementation (`src/krk-play-policy.js`) selects explicit constructive moves translated from `engame-chess` Lean proofs: wall preparation, rook rescue, edge/central approach, protected pivot, guarded entry and opposition check, with an openly marked practical geometric setup phase where the exact proof's move dispatcher is not extracted. The direct frozen terminal mate-in-one formula is used first. **This is not a formally certified global JavaScript policy or a verified 97/98-ply/FIDE-clock-equivalent engine**. The demonstration uses real chess move legality and excludes Stockfish, tablebases, minimax and network chess engines from Maths mode. A correct upstream existence-of-win theorem is not evidence that any particular practical sequence wins at a fixed distance.

The source provenance and all-reply local test record remain documented in [KRK02 execution report](docs/KRK02_EXECUTION_CONTINUATION.md). Previous KRK01/KRK02 notes saying `KRK is disabled` are **historical**: the owner explicitly relaxed the exact bound/history release conditions for this practical Maths-only mode. No KQK, KPK or other material has been enabled. The independent Engine Playground remains separate.

Two intentionally separate modes share a single Vercel website:

- **Maths endgame** starts with an empty board and two full piece trays. The only currently arrangeable material is both kings plus at most one bishop, knight or rook; queen and pawn slots remain dark. Its outcome panel is backed by frozen theorems. K/K, K+B/K and K+N/K are playable against a legal-move draw adversary; KRK has its own geometric opponent. KRK is playable as the practical geometric demonstration described above; its mathematical outcome classification is independent of the particular exhibited move sequence. There is no engine, search or tablebase in this mode.
- **Engine playground** is a standard, full-rules chess spectator arena. Choose a chess engine for White and Black, Play, Pause, advance one move, change the viewing pace, flip the board or Restart. It is NOT a proof-derived mathematical engine.

## Engine playground

The initial pair is **Stockfish 19 Lite (single threaded WebAssembly)** and **Lozza (JavaScript UCI)**. The Stockfish Lite edition is significantly smaller and weaker than the full engine. Either can play either colour, including mirror matches. Both run locally in browser Web Workers, require no backend or API keys, and the display is deliberately delayed after each move so the games are watchable. The browser may download roughly 2 MB of engine assets on first use. For fair performance comparison, this arena is a spectator/demo interface, **not a calibrated engine-benchmark harness**.

The separate arena uses the standard-chess \`chess.js\` library for legality, promotion, castling, en-passant, checkmate and draw detection. The maths-only \`src/chess.js\` is independent and supports only the original three dead classes plus the practical KRK release.

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
