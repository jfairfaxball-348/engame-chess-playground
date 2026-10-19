# Chess Playground — engineering roadmap

## Binding direction

This repo **does not conduct chess research**. It translates **finished, formally verified, frozen, owner-approved** results in [endgame-chess](https://github.com/jfairfaxball-348/engame-chess) into a standalone opponent. The parent repo retains all the mathematical work, including its long-term UWS ambition. Any new playable endgame class requires the explicit gate in [AGENTS.md](../AGENTS.md). No chess engines, tablebases or proof-imitating heuristic policies.

**Current release:** K vs K / K+B vs K / K+N vs K, with arbitrary legal moves demonstrating their proved dead-position outcomes. **KRK is held back**, even though selected clock-free forcing results upstream are frozen; wait for the owner's approval after upstream KRK is properly finished.

## Completed — S001 bootstrap

- [x] Static, dependency-free Vercel-compatible app.
- [x] Local legal move rules, material editor, move history, user colour and orientation.
- [x] Support for demonstrated dead-position classes.
- [x] Local browser opponent.
- [x] Local tests.

## Historical — S002 move fidelity audit

- [x] Audited and rejected prebuilt engines, online move selection and tablebase lookup.
- [x] Identified that the *then-enabled* KRK strategy was only partial proof patterns plus experimental heuristic.
- [x] Documented its limits in `docs/S002_MOVE_FIDELITY_AUDIT.md`.
- [x] **Owner correction:** removed the partial KRK selector from runtime, disabled KRK play, and made the upstream completion + owner approval gate mandatory. Prior S002 prototype is not a released material class.

## Completed in code — S003 chessboard visual and interaction overhaul

No mathematical changes and NO KRK release.

- [x] Aim for a **familiar chess.com-style board experience**: muted green/cream checks, legible piece silhouettes, subtle last-move and legal-destination highlights, coherent orientation and coordinates, uncluttered controls. Do **not** copy chess.com source, trade dress, branded imagery or unlicensed sprites.
- [x] Make an 8 × 8 board with *mathematically fixed geometry*, exact equal squares, a fixed 1:1 responsive container, and pieces drawn as absolute-positioned fixed-percentage visual layers. Audit changes on move/selection, turns, history updates and captures for **zero board reflow or square resizing**. Unicode glyph font metrics in the existing UI are suspect.
- [x] Replace font-dependent Unicode chess glyphs with crisp consistently sized local vector piece assets that can be legally reused. Keep pieces out of grid track sizing; prevent animated image/loading size jumps and layout shift.
- [x] Support BOTH click-to-select/click-to-destination and drag-and-drop using pointer events (mouse, touch, pen) in active games; editor should also support click placement and drag repositioning of pieces, including removal/reset. Invalid drops snap back without changing game state. Continue highlighting legal destinations during interaction.
- [x] Make the board the primary content with a cleaner side panel / mobile layout; accessible sizes, keyboard navigation, screen-reader labels, responsive small screens (including Android), light/dark piece contrast.
- [x] Preserve local engine policy, setup validation, orientation, turn choices, game history, reset, and the disabled KRK button.
- [x] Added UI-oriented pure-helper and static CSS/interaction regression tests. **Browser-level QA is pending S004**; CI runs test/check/build. No claim of verified zero CLS or Android drag/drop without browser measurement.

## S004 — CI result observed, browser drag regression outstanding

- [x] Corrected stale synthetic drag-click suppression, focus retention and live status announcements.
- [x] Installed real Chromium QA at 320/360/390/768/1280 CSS px; all 64 squares were measured at each size.
- [x] GitHub Actions run [#35](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/39285471688) **actually passed** npm test, npm run check, npm run build and Chromium geometry/click flow at all five widths, plus keyboard focus.
- [x] S005 traced the S004 drag timeout to **no pointer events generated** in headless Chromium, because the raw Playwright mouse helper targeted an off-viewport bottom-row square on the 1280×850 viewport. Corrected the helper to scroll source into view before measuring raw mouse coordinates and to drop outside the board while still inside the viewport. This is a **test-harness defect**, not demonstrated evidence of an app pointer-handler failure. A complete fresh browser run must still confirm the fix.
- [ ] Independent manual examination of the current deployed Vercel revision is still outstanding. A successful Vercel deployment is not the same as a successful browser QA run.

## S005 — player-facing usability implemented, final browser verification gated

- [x] One Tab stop on the chessboard; arrow navigation follows displayed white/black orientation. Enter/Space work via native buttons; Escape clears selection; focus is carried through rerenders.
- [x] **Restart from this setup** creates a new game, clears repetition/halfmove/move history and cancels pending opponent timers. Does not modify the arranged setup or computer selector.
- [x] **Undo turn** snapshots board, move log, repetition keys, halfmove clock, last-move indicator and decision explanation **before a human move**. It safely reverses that move and any subsequent engine reply; if the engine is still queued, the pending timer is cancelled. First automatic engine opening move cannot be individually undone. Undo stops at the initial human opportunity.
- [x] Editor palette labels + selected state, Erase help, validation and independent flip-board control; choosing player colour initially aligns board orientation but flip never swaps piece colours.
- [x] Player/opponent separation in history without moving board geometry.
- [x] Browser QA expanded to exercise keyboard arrows in both orientations, Escape, roving Tab, undo/restart, orientation flip and previous mouse/touch paths.
- [x] CI now publishes a separate public Node+Chromium commit status, independent of Vercel's deployment status.
- [ ] Verify a **completed green** GitHub Actions run for the corrected S005 browser test; prior red runs showed one keyboard focus bug fixed in app.js and the offscreen pointer harness bug fixed in browser-qa.mjs.
- [ ] Verify a physical Android device, Safari/WebKit, Firefox and pen interactions where possible.

## NEXT — S006 input reliability and cross-browser polish

- [ ] Start with any S005 red CI result, especially the mouse-drag trace, and correct it. Require unit/check/build/Chromium all green before declaring regression resolved.
- [ ] Inspect browser pointer capture/drop/click cancellation across mouse and touch; add stress cases with rapid move/restart/undo and resize.
- [ ] Validate orientation, keyboard and layout at mobile/desktop sizes, plus optional Firefox/WebKit automation when available.
- [ ] Keep KRK blocked and released local opponent choice unchanged.

## Later

Further user-facing polish, accessibility and explicitly approved upstream material releases only. No speculative KRK import target or heuristic substitution.

**Non-goals:** invent mathematics, improve parent proof, implement incomplete KRK strategy, use a prebuilt opponent, bulk tablebase lookup, claim full FIDE history correctness, or advance UWS through this repo.
