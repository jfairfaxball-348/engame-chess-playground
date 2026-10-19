# NEXT SESSION — S003: Complete proof-guided KRK move selection

**Activation:** When the owner says "run next session" in Chess Playground, execute this prompt immediately. Work ONLY in `jfairfaxball-348/engame-chess-playground`; read the mathematical `jfairfaxball-348/engame-chess` repository only as an immutable source. Do not alter its research aims, frozen Lean source, session files, theorem ledger or UWS project.

## Owner's binding requirement

The playground's computer must genuinely use **the mathematical results proved in the main repository** to select moves, not disguise a prebuilt chess engine, downloaded tablebase, UCI/Stockfish/Syzygy overlay, external service or ordinary search algorithm as a proof-derived engine. A geometric heuristic is NOT a substitute for extraction from the proved strategy. Keep any unimplemented case explicitly experimental.

## Current baseline

S002 audited the path, implemented `src/proof-policy.js` with locally guarded source-pinned KRK witness moves, added `chooseDecision` move provenance and UI explanations, and retained a labelled heuristic fallback for unsupported cases. The immutably frozen source is EC-T0019 at `4acc3e8638a916f329788d4c2b5f0db6f2c9bf67`. Read `docs/S002_MOVE_FIDELITY_AUDIT.md`, README, roadmap, implementation and tests. This is a **partial** selector. A source-guided first move or a non-hanging rook is NOT proof of eventual mate.

## Principal goals

1. Examine the actual frozen KRK witness constructions under `formal/EndgameChess/Rules/KRKForcing/` and the S030 paper, especially `WallForce`, `LowerPursuit`, `RankAdvanceRescue`, `RookRescue`, `TwoFileCheck`, `StrategyTransport`, `ClearEntry`, `OffRankSetup`, `SameRankSetup`, `SafeSetup` and `OutcomeClassification`. Cross-check preconditions, chosen move, universal defending replies, and termination rank for each branch.
2. Implement an **explicit local proof-policy state machine** with ranks, setup phases and defence-response branches, not just isolated proof-inspired moves or numerical evaluations. Support either strong colour and each board orientation. Recompute branch conditions after each defender reply and preserve progress/safety invariants.
3. Map each runtime branch to a precise frozen theorem or sublemma and the pin above. Every engine choice must report proof branch, stated premises and next obligation. Classify as `proof-pattern` only when its exact constructive witness is implemented; do not mark a total strategy formally verified until correspondence is proved. Weak-turn immediate legal KxR remains a draw-saving choice.
4. Write adversarial regression tests covering all legal replies in the relevant parameter families, rook captures, stalemate, immediate mate, opposed-kings two-file checks, rook rescue, tempo and recurrences, both colours, and rotations/reflections. Test non-hanging and *eventual* mate of extracted branches, not only shallow one-ply safety. Track fallback rate on a reproducible, documented legal-position corpus and aim to eliminate it for clock-free KRK.
5. Keep the zero-dependency browser app and simple position editor. No runtime requests to the main repo; its code is inspiration/evidence, not a live dependency. Verify UI explanations and play for both colours; retain the experimental fallback until a genuinely complete alternative exists.
6. Keep clock-free KRK forcing separate from complete FIDE rule/history/adjudication and from exact distance or seven-piece parity. Do not claim general chess solving or a verified JavaScript strategy from a collection of tested samples.
7. Run `npm test`, `npm run check`, `npm run build`; inspect hosted CI and Vercel deployment if configured. If those checks are unavailable, state which were and were not run; do not invent a live URL or green status. Fix regressions before declaring completion.
8. Document remaining proof-to-execution obligations, commit all playground-only changes to `main`, and install the FULL subsequent prompt in this file.

Prefer achieving a fully proof-directed KRK policy in several carefully audited sessions over relabelling the existing heuristic. The mathematics remains upstream and unchanged.
