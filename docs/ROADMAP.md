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

## S004 — interaction fixes delivered, Chromium CI validation pending

- [x] Replace 350 ms click suppression with suppression scoped to the completed drag; cancellation permits immediate next click.
- [x] Retain keyboard focus through board/palette/sidebar rerenders and add visible inset square focus.
- [x] Add persistent `role=status` live announcement for turn/check/outcomes, editor validation and invalid actions.
- [x] Add dependency-free production app with **temporary CI-only** Playwright Chromium tests measuring all 64 squares at 320/360/390/768/1280px and exercising mouse, touch, keyboard, editor, invalid drop and pointercancel.
- [x] Fix previously failing `test/chess.test.js` assertion that confused CSS `last-from` with an external import; no relaxation of external-engine exclusion.
- [ ] Confirm a **completed passing** GitHub Actions Chromium run; current commits queued when this session was documented.
- [ ] Independently inspect the deployed Vercel revision in a browser; owner's earlier positive appearance check is acknowledged but not an S004 automated pass.

## NEXT — S005 game controls and editor ergonomics

- [ ] Close any S004 browser/CI defects before new features.
- [ ] Improve keyboard square navigation, restart/undo accessibility, orientation/editor controls and history presentation.
- [ ] Add browser regression coverage for each addition. Continue holding KRK.

## Later usability work (not new mathematics)

- S005: game usability — arrow-key board navigation, accessible history and safe restart/undo, plus editor quality-of-life changes.
- Future material releases **only as approved by the owner following completion upstream**. No automatic KRK roadmap, proof extraction schedule, heuristic milestones or deadline.

**Non-goals:** invent mathematics, improve parent proof, implement incomplete KRK strategy, use a prebuilt opponent, bulk tablebase lookup, claim full FIDE history correctness, or advance UWS through this repo.
