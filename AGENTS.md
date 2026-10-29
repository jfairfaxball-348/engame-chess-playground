# Owner update — Maths tab, 29 October 2026

KRK is now completed **for outcome classification** in the parent programme (EC-T0048; see parent's current KRK completion report). The owner authorises an empty-board Maths redesign with full piece trays, selectable KRK placements and theorem-backed outcome annotation. **This supersedes the previous blanket ban on showing/selecting KRK in the editor only.** It does NOT approve an uncertified KRK move selector: the earlier gate remains on KRK gameplay until a reviewed, faithful, locally executable constructive policy is available. Never describe a theorem of winning-policy *existence* as a verified JavaScript move algorithm. Neither the separate Engine Playground nor the upstream research repo may be changed by this Maths UI work.

# Research-scope clarification (owner direction, 23 October 2026)

The **independent Engine Playground** now also hosts an exploratory chess-AI research programme, as authorised in S010. Prior statements below that "this repo does not conduct research" apply to the **Maths Endgame / proof-derived opponent only**, not to the new experimental AI arena. Do not import unproved ML moves into Maths Endgame; no KRK promotion, no edits to the upstream endgame theorem repo. S010 is documented in `docs/AI_RESEARCH_WORKSHOP.md`.

# Two independent playground modes — binding scope

The owner authorised (23 October 2026) a **new, independent engine playground** tab with standard chess and real third-party engines. The older restrictions on external engines apply **only to the original Maths endgame mode** and its local rules/opponent code (\`src/chess.js\`, \`src/engine.js\`, proof releases and tests). The new engine arena is explicitly exempt from those restrictions, but must not import its engine choices, heuristics or full-chess rules into the Maths endgame runtime. The app may ship pinned npm dependencies for the separate arena. Preserve original upstream-only rules, the KRK hold, and all existing playable material gates.

Browser UCI engine assets may only run in Engine playground, and their version and licences must be disclosed. Never claim a lightweight Stockfish build equals the full engine. Keep engineering sessions lightweight, with tests, browser QA and the full next-session handoff.

# Chess Playground — binding repository instructions

## Identity and scope

This is a **downstream, playable translation** of fully completed mathematical work in [endgame-chess](https://github.com/jfairfaxball-348/engame-chess). It does NOT discover chess mathematics. The player arranges a legal position, chooses their colour and who moves first, and plays a locally implemented opponent driven only by appropriately proved, released results.

Never derive new theorems, hunt for new chess strategies, introduce unproved minimax/heuristic substitutes, modify the parent repo, or move its UWS objective/session/governance. All mathematical progress happens exclusively in endgame-chess. This repo is for engineering, interface and faithful translation.

## Material-release gate (mandatory)

Do not enable a class merely because the parent has some frozen theorem about it. Require:
1. All results actually needed to play that class are **complete, proved and formally verified** in endgame-chess, with frozen immutable theorem/source anchors. An existence-of-forced-mate theorem is not by itself a complete executable decision procedure.
2. A complete constructive strategy/move selector, where needed, and appropriate outcome, terminal and rule-history semantics are accounted for in the parent. Pin exact versions and document any limited scope.
3. An auditable, independent **local implementation** reproducing the approved frozen results, with tests for legal moves, all replies, capture transitions, both colours and terminal cases.
4. **Explicit owner approval after upstream completion** to release/import the class into Chess Playground. No automatic promotion or runtime sync.

**KRK is explicitly ON HOLD.** Although EC-T0019 freezes some clock-free forcing mathematics, the owner has said to WAIT until the KRK work is properly finished upstream before importing/playing it here. Do not work on KRK strategy extraction, rule expansion, minimax, or proof-derived KRK move choice during ordinary playground sessions. Do not unlock KRK without the owner's further express approval. The earlier S002 partial KRK code has been withdrawn from the runtime; its audit remains historical. KRK chess geometry may remain for future tests, but the material class must stay unplayable.

Currently released: K vs K (EC-T0003), K+B vs K (EC-T0004), K+N vs K (EC-T0005). The opponent may choose any legal move in those dead-position classes. Explain that the continuing board game is an exploration mode that suspends immediate FIDE dead-position termination, not a standard rated chess match.

## Engine independence and honesty

No Stockfish, Syzygy, tablebase, existing chess engine, network move-selection service, AI model, UCI binary or hidden imported engine. No runtime reference to the main research repo. Future releases are manually reimplemented and validated against immutable frozen sources; do not confuse passing samples with formal verification of JavaScript. Never call a partial strategy or heuristic "proved".

## Session style and quality

Use lightweight webapp sessions, not parent mathematical research bureaucracy. On "run next session", read and execute the full prompt in `NEXT_SESSION.md`, with owner directions overriding older plans. Improve real usability, interaction, visuals, accessibility and deployment. Check `npm test`, `npm run check`, `npm run build`, CI and Vercel where available; report which checks actually ran. Commit playground-only changes, install complete successor prompt.

**Next: S006 cross-browser/mobile usability and undo/restart edge-case QA.** S005 implemented keyboard arrow navigation, safe restart/undo, editor flip and clearer history. [Actions run #39304665312](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/39304665312) passed all Node, build and Chromium browser tests, including mouse + touch. S006 must retain green CI, expand high-value race and alternative-browser tests and keep the strict KRK hold and upstream-only mathematics rules.