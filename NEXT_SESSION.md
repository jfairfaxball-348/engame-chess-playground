# NEXT SESSION — S004: Live chessboard QA, polish and accessibility

**Owner activation:** On "run next session", immediately execute S004 in **jfairfaxball-348/engame-chess-playground**. Read AGENTS.md, README, docs/ROADMAP.md, src/app.js, src/styles.css, src/board-ui.js, src/pieces.js and tests. This is a lightweight **UI engineering session**, not a maths research project. Never edit the main endgame-chess repo.

## Binding constraints

Only completed, verified, frozen and explicitly owner-approved parent results may be converted to local opponent logic. **KRK remains COMING LATER / unplayable**, even if some upstream KRK partial results exist. Do not write KRK policy or work on chess mathematics, heuristics, external engines, tablebases, AI services or runtime upstream calls. Keep released K/K+B/K+N demonstrator behaviour honest and independent.

## Principal objective

Make S003's new chessboard **actually pleasant and reliable** in real browsers, especially a desktop Chrome-style experience and Android touch. This session must prioritise evidence-based interaction QA, accessibility and bug fixing rather than adding unrelated features.

1. **Run and reproduce**: inspect current Vercel live site and checkout; run npm test, npm run check and npm run build. Where browser automation is possible, add executable integration tests (Playwright only if justified; don't silently add dependencies) which load the real board, record the bounding rectangles of 64 buttons and chessboard, and assert all square widths/heights equal within subpixel tolerance, board width approximately equals height, and no square jumping or lateral reflow before/after piece click, move, opponent turn, selection, history update, edit/reset and resize. Run at mobile 320/360/390px and desktop 768/1280px. If browser tools unavailable, report precisely what remained untested, preserve repeatable manual acceptance steps, and still deliver substantive fixes.
2. **Both modes**: demonstrate click-to-select/click-to-move and press/drag/drop (mouse, touch, pen where available), valid vs invalid drop, dragging out of the board, pointercancel, quick repeat action, and black orientation. Confirm all use game play() and cannot produce two moves, wrong-side moves, a turn during opponent thinking, or a ghost stuck on screen. Confirm keyboard (Tab/Enter/Space) and readable focus. Test click even immediately after cancelled drag, and assess suppression window/race.
3. **Editor**: test click palette placement and dragging existing pieces, including king replacement, erase, reset, black orientation, both possible first-movers and invalid positions blocked at Start. Ensure editor drag never changes game until Start and board orientation change never mirrors individual pieces or letters.
4. **Polish what real testing reveals**: player-focused page with dominant board, calm status, move history and last-move/check highlights. Improve live announcements for check/terminal status, target accessibility, focus retention, mobile control reach and board touch handling without globally disabling scrolling. Avoid excessive branding and research exposition.
5. **Release gate and integrity**: assert MATERIAL.krk.playable=false; newGame('krk') blocked; chooseDecision('krk') returns null; nothing fetches engines/tablebases or upstream repo. Preserve local rules and game logs. Verify live Vercel deployment only if observed; commit all changes to playground main after checks.

## Exit criteria and successor

Provide before/after description with exact commits, test commands and actual results, browser environments used and any blind spots. Fix all reproducible S003 regressions found, not merely list them. Update docs/ROADMAP.md and README. Install a complete S005 prompt for the most important remaining UI/UX improvement; **do not schedule KRK release without upstream completion and express owner approval**. No new chess mathematics.
