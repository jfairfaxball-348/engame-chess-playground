# Owner scope correction — KRK03 practical Maths play, 29 October 2026

**Latest direct owner instruction overrides prior KRK01/KRK02 complete-ply parity, chess-history certification, total-selector and unreleased class requirements FOR THE KRK MATHS DEMONSTRATION ONLY.** The Maths website must allow arranging any locally legal King+Rook against King position with either side to move, and the human **always plays the lone king**. The computer plays K+R using proof-sourced constructive geometry and explicitly distinguished practical geometric setup when its formal local phases do not cover the given root. The user does not require exact 97/98-ply strategy, tablebase parity, 50/75-move claims or historical WDL50 equivalence of the move selector. Do not mislabel a practical move as an extracted Lean proof or claim the JavaScript opponent itself has a formally guaranteed finite mate bound. This latest scope explicitly authorises gameplay rollout provided legal moves and basic capture/terminal rules work and CI/browser QA pass.

**Specific capture exception:** If the human controls the lone king and the rook sits one legal king move away without strong-king protection, a legal capture of the rook MUST be allowed. It transforms the game into `K vs K`, a **guaranteed draw**; show that immediately, with undo restoring all three original pieces. The frozen EC-T0048 outcome classification already distinguishes unsafe-rook weak-turn roots from winning strong KR roots. This is a legitimate draw, not a strategy fault.

No Stockfish/Lozza/Syzygy/full chess engine, per-position lookup table, adversarial minimax or live parent GitHub at move time in Maths mode. Engine tab remains fully independent. Exact full-policy formalisation is a separate, optional future project. The existing local geometric Lean witnesses and pinned source anchors are preserved. Keep KQK dark until independently ready.

---

# Owner update — KRK02 executable release work authorised, 29 October 2026

**Current instruction supersedes the historic KRK work ban below.** The owner authorises finishing and testing the **fully playable proof-derived KRK opponent** in the Maths tab. The verified KRK01 local constructions and proof source lock may be merged into `main` and deployed **with KRK gameplay still gated**. The next priority is the executable complete KRK policy and release under `NEXT_SESSION.md` (KRK02). The mathematical release gate remains binding: do not enable KRK until total proof-corresponding move selection, all adversarial replies, correct rule/clock semantics, integration tests and release CI pass. Upstream KRK is outcome-complete but its noncomputable global `Classical.choose` policy does not itself supply executable play. The owner has explicitly authorised KRK02 engineering; this is **not** permission to substitute any unproved engine/heuristic/tablebase for the mathematical policy.

The independent Engine S011 workshop is deferred to `docs/ENGINE_S011_DEFERRED.md`. KQK should be staged for the next material-class release once the frozen upstream constructive proof and game semantics permit it; its readiness work must not weaken the KRK release gate. Existing Maths dead-position classes and Engine Playground remain unchanged.

---

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

**Historical gate (superseded for KRK02 engineering):** The owner previously held KRK implementation until proof completion. On 29 October 2026 the owner explicitly authorised the KRK02 proof-derived implementation work and requested full playable release, **conditional on the same mathematical completeness, auditable strategy, semantics and CI gates above**. The old S002 heuristic remains rejected and may not be reinstated. KRK stays unplayable until the complete policy is certified; local geometric witness modules may ship without enabling gameplay.

Currently released: K vs K (EC-T0003), K+B vs K (EC-T0004), K+N vs K (EC-T0005). The opponent may choose any legal move in those dead-position classes. Explain that the continuing board game is an exploration mode that suspends immediate FIDE dead-position termination, not a standard rated chess match.

## Engine independence and honesty

No Stockfish, Syzygy, tablebase, existing chess engine, network move-selection service, AI model, UCI binary or hidden imported engine. No runtime reference to the main research repo. Future releases are manually reimplemented and validated against immutable frozen sources; do not confuse passing samples with formal verification of JavaScript. Never call a partial strategy or heuristic "proved".

## Session style and quality

Use lightweight webapp sessions, not parent mathematical research bureaucracy. On "run next session", read and execute the full prompt in `NEXT_SESSION.md`, with owner directions overriding older plans. Improve real usability, interaction, visuals, accessibility and deployment. Check `npm test`, `npm run check`, `npm run build`, CI and Vercel where available; report which checks actually ran. Commit playground-only changes, install complete successor prompt.

**Next: S006 cross-browser/mobile usability and undo/restart edge-case QA.** S005 implemented keyboard arrow navigation, safe restart/undo, editor flip and clearer history. [Actions run #39304665312](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/39304665312) passed all Node, build and Chromium browser tests, including mouse + touch. S006 must retain green CI, expand high-value race and alternative-browser tests and keep the strict KRK hold and upstream-only mathematics rules.