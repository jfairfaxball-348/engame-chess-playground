# Playground roadmap (independent of the main research programme)

**Purpose:** playable, proof-inspired demonstrations of the already-frozen endgame classes. This repository is an implementation branch, not an authority on endgame mathematics. No source import, submodule, runtime fetch, or automated syncing from `engame-chess`.

## S001 bootstrap (this session)

- [x] Zero-dependency static webapp, Vercel-compatible.
- [x] Piece-placement editor, material selector, user colour, turn selector, orientation, legal move highlights.
- [x] Local movement/attack legality for K/K+B/K+N/K+R, move history and game ending logic.
- [x] Adversary always plays the opposite side (with a small visual delay).
- [x] Explicit immediate-draw / exploration split for K, B, N; KRK strategy visibly experimental.
- [x] Unit tests and deploy instructions.
- [ ] Verify live Vercel deployment after importing the Git repo.

## S002 — Adversarial UI audit

- Test board interactions on phone + desktop, colour reversal, invalid setups and unusual edge/corner cases.
- Add drag-and-drop placement if useful. Keep click-to-place and keyboard support.
- Expand tests to random legal transitions and check/stalemate/capture/repetition scenarios.
- Distinguish local legality from fully retrograde-reachable positions more rigorously.

## S003 — Move-selection fidelity

- Reimplement frozen KRK proof's explicit geometric constructions as a candidate deterministic policy; use proof labels and source citations inside local code.
- Add an *explain this move* panel citing the exact local rule used (not a network proof lookup).
- No 'verified' strategy badge without a separate complete correctness theorem/proof, including all defensive replies and terminal cases.
- Preserve fallback experimental heuristic as separately labelled, not as a proxy for the proof.

## S004+ — New material releases

- Only add a new class after it is **formally verified and frozen in the parent repository**.
- Copy/rederive the needed movement principles as local code; never reach into the parent repo.
- Pin each release to its source theorem identifier, immutable git commit and reviewed interpretation.
- Test every orientation, all legal defender replies, capture transitions and clock/history distinctions.

**Non-goals:** chess solving, moving the parent research ladder, a shared engine service, tablebase ingestion, claiming formal certification for JavaScript heuristics, or publishing unproved material outcomes as frozen.
