# NEXT SESSION — S007: Engine playground browser integration and reliability

Owner activation: "run next session" authorises implementation. Preserve all existing Maths Endgame restrictions and KRK hold.

Inspect the new Engine playground tab: Stockfish 19 Lite single-threaded WASM and Lozza UCI JS, standard chess.js rules, automated playback, pause, single-step, restart, colour selections, independent playback throttle, orientation and SAN history.

Priority:
1. Complete independent real-browser smoke tests for each UCI worker (verify both engines can reach bestmove), at least one complete short match, legal move validation, and double-click / pause / restart during search. CI must fail on worker crashes or timeouts.
2. Ensure browser worker URLs, WASM MIME type, and packaging work in deployed Vercel as well as local server; check source licences and build size.
3. Extend QA to 360px mobile and desktop, verify no original endgame board changes, keyboard navigation and live game semantics.
4. Add optional PGN export, evaluation/time/depth display, dynamic thinking budget, and full draw/terminal handling if viable.
5. Run npm test, npm run check, npm run build and real Chromium QA. Report actual completion, do not infer. Keep NEXT_SESSION complete and concise.

Do not modify the upstream endgame-chess mathematical repository or unlock KRK.
