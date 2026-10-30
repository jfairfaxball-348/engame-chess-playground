# KRK16 — Close deterministic KRK all-reply rank and finite complete-game gaps

**NEXT EXECUTION SESSION — INSTALLED, NOT EXECUTED.**

## Mission
Finish the genuinely outstanding theorem-derived KRK *winning strategy*: every legal strong-to-move KRK root, all legal defensive responses, guaranteed eventual checkmate by the actual deterministic source-tagged controller. The owner explicitly **deferred 50/75-move and claim-history certification**: never present a mathematical mate certificate as FIDE-certified. Do not enable Maths KRK simply because root move coverage or bounded tests pass.

## Verified incoming boundaries
- KRK13 covered 350,336/350,336 fresh strong-to-move legal roots for the FIRST proof-derived action. Do not repeat or misstate this as complete-game coverage.
- KRK14's 40,000-node full-tree check ended at the **cap** after 16,482 mating leaves and maximum 45 plies. It found no real cycle or unsupported continuation within that traversed prefix, but proved nothing about the remaining tree or other roots.
- KRK15 adds a full-nested-controller cycle key (not merely outer stage and nested central stage) and `scripts/krk15-stratified-mate-audit.mjs`: 24 roots, source families `prepared-wall`, `direct-entry`, `two-step-setup`, both colours and four frames. See `docs/KRK15_STRATIFIED_MATE_AUDIT.md` and draft PR #22. Read exact CI evidence before claiming the new changes passed.
- Frozen upstream Lean source: `engame-chess` branch `krk11-prepared-wall-policy` @ `7cfd8462a9fd36c8e37250221ee809b5b8287836`. Existing KQK/KPK research must remain undisturbed.

## Execution

1. Run the 24-root strict diagnostic with progressively larger node budgets. Distinguish a **resource cap** from a genuine cycle or missing source move; for each genuine case record root FEN, complete move variation, nested phase tag, prior strong-action position and exact Lean lemma. Determine whether more source phases/root geometries need stratified representation; examples are not the universe.
2. Independently inspect `krkTaggedStrongChoice` and every transition in `krkPartialRootChoice`, `krkSetupEntryContinue`, `krkNonWallEntryContinue`, `krkPreparedWallChoice`, `krkCentralSequenceChoice`. Propose an actual finite **lexicographic ranking function** over setup count, strict-wall preparation, upper lift, lower pursuit, restoration and terminal finish. The rank must decrease after **every** legal defensive reply; a board-level source policy may not silently reset or choose a new root action.
3. Formalise the **same deterministic source selection**, not merely a force-mate existence statement, in new Lean modules importing the frozen source. Prove source action totality, reply closure and decreasing rank on the exact legal-root domain. Preserve upstream research main and all existing theorem files, verify Lean compilation and axiom audit on the precise new head.
4. Translate only newly proved actions/rank certificates into the standalone JS Maths opponent. Do not add Stockfish/Lozza, external tablebases, minimax, an enumerated outcome atlas, arbitrary first-legal moves, or runtime GitHub/Lean calls.
5. Weak-to-move scope: show mate, stalemate, available immediate rook capture to KK draw, or every safe weak reply entering the **new fully justified** strong-turn theorem. No invented weak-side chess choices.
6. Verify complete-game traces, exact user-arranged starting board, colour symmetry, Maths/Engine isolation, source SHA/blob locks, `npm test`, `npm run audit:krk-mate-strata`, existing root/continuation audits, syntax/build and browser CI. Only if mathematical global selection and actual action correspondence are proved should mathematical KRK play be considered for owner-approved release. Otherwise maintain KRK locked.
7. Commit exact changes, wait for exact-head CI, then strictly fast-forward the **staging** branch. Do not merge incomplete source policy to `main`; do not claim Cloudflare/Vercel production release without verifying the deployed browser.

**Success is a global source-derived, all-defender winning controller; tests and successor prompts alone are not success.**
