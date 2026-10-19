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

## S002 — Adversarial move-fidelity audit (2026-10-19)

- [x] Audit all live move-selection paths for external engines, runtime tablebases, network dependencies and opaque score overlays. See `docs/S002_MOVE_FIDELITY_AUDIT.md`.\n- [x] Implement explicit source-pinned KRK geometric construction witnesses, separate from unverified fallback. Explain last engine decision in UI.\n- [x] Add witness/defender capture/geometry regression tests, property samples and GitHub Actions test/build gate.\n- [ ] Browser-device QA on phone + desktop, colour reversal, invalid setups and unusual edge/corner cases remains for live deployment.
- [ ] Consider drag-and-drop placement. Retain click-to-place; check keyboard board navigation on deployed app.
- [x] Extend deterministic tests and adversarial property samples for chosen proof patterns. **Sampling is not a correctness proof.**
- [ ] Certify source/target kernel-semantic agreement and retrograde reachability where relevant; current UI only checks local legality.

## S003 — Complete proof-strategy extraction (next)

- Finish extracting ALL frozen KRK forcing branches: wall advances, rook rescue, opposed-king checking, lower-band pursuit, tempo, all-defence continuations, axis transport and weak-turn classification. The S002 partial geometric witnesses must not be misrepresented as a complete policy.
- Expand the implemented **last engine decision** explanation to a complete, locally auditable rule trace and per-position obligation checks, without network proof lookups.
- No 'verified' strategy badge without a separate complete correctness theorem/proof, including all defensive replies and terminal cases.
- Track and shrink fallback coverage, and separately test every terminal, capture and legal defender reply. Preserve fallback as **experimental** until a complete strategy with correctness correspondence exists.

## S004+ — New material releases

- Only add a new class after it is **formally verified and frozen in the parent repository**.
- Copy/rederive the needed movement principles as local code; never reach into the parent repo.
- Pin each release to its source theorem identifier, immutable git commit and reviewed interpretation.
- Test every orientation, all legal defender replies, capture transitions and clock/history distinctions.

**Non-goals:** chess solving, moving the parent research ladder, a shared engine service, tablebase ingestion, claiming formal certification for JavaScript heuristics, or publishing unproved material outcomes as frozen.
