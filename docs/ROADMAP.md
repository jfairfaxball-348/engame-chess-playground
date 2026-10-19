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

## NEXT — S003 chessboard visual and interaction overhaul

No mathematical changes and NO KRK release.

- [ ] Aim for a **familiar chess.com-style board experience**: muted green/cream checks, legible piece silhouettes, subtle last-move and legal-destination highlights, coherent orientation and coordinates, uncluttered controls. Do **not** copy chess.com source, trade dress, branded imagery or unlicensed sprites.
- [ ] Make an 8 × 8 board with *mathematically fixed geometry*, exact equal squares, a fixed 1:1 responsive container, and pieces drawn as absolute-positioned fixed-percentage visual layers. Audit changes on move/selection, turns, history updates and captures for **zero board reflow or square resizing**. Unicode glyph font metrics in the existing UI are suspect.
- [ ] Replace font-dependent Unicode chess glyphs with crisp consistently sized local vector piece assets that can be legally reused. Keep pieces out of grid track sizing; prevent animated image/loading size jumps and layout shift.
- [ ] Support BOTH click-to-select/click-to-destination and drag-and-drop using pointer events (mouse, touch, pen) in active games; editor should also support click placement and drag repositioning of pieces, including removal/reset. Invalid drops snap back without changing game state. Continue highlighting legal destinations during interaction.
- [ ] Make the board the primary content with a cleaner side panel / mobile layout; accessible sizes, keyboard navigation, screen-reader labels, responsive small screens (including Android), light/dark piece contrast.
- [ ] Preserve local engine policy, setup validation, orientation, turn choices, game history, reset, and the disabled KRK button.
- [ ] Add UI-oriented regression tests and where possible real browser QA; run `npm test`, `npm run check`, `npm run build`, assess Vercel and commit only within the playground.

## Later usability work (not new mathematics)

- S004: usability and accessibility follow-up from actual phone/desktop testing; optional arrows, last move, move list UX, stronger editor ergonomics.
- Future material releases **only as approved by the owner following completion upstream**. No automatic KRK roadmap, proof extraction schedule, heuristic milestones or deadline.

**Non-goals:** invent mathematics, improve parent proof, implement incomplete KRK strategy, use a prebuilt opponent, bulk tablebase lookup, claim full FIDE history correctness, or advance UWS through this repo.
