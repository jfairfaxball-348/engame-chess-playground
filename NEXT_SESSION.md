# S039 — turn newly exposed genuine source obligations into complete play

**Execute, test, review, merge and ship code.** Work ONLY in
`jfairfaxball-348/engame-chess-playground`; treat
`jfairfaxball-348/engame-chess` as an immutable mathematical
source. Start with `AGENTS.md`,
`docs/S038_WIDENED_SOURCE_ORBITS.md`,
`scripts/s038-orbit-closure.mjs`, S038's merged PR, and the
latest published Actions JSON.

**Priority A remains unchanged:** complete truly source-derived
KRK and KQK all-defender mating play from every legal user-arranged
root. This must not be mistaken for first-move coverage, a capped
search tree, a theorem of strategy existence, or a finite mate sample.
No engine, tablebase, heuristic, minimax, arbitrary legal fallback,
fabricated source move, fake rank or invented Lean theorem.
Keep experimental partial-play honesty.

1. Extract the first `firstActualGap`, `firstUnverifiedTheorem`,
   `firstPotentialCycle` and `firstResourceCap` from S038 JSON,
   including true tokens, squares, original/switched theorem frames,
   source moves and full move histories. Reproduce with higher node/pair
   caps on identical roots, retaining exact root identities.
2. **Close a specific source phase if and only if** the frozen theorem
   genuinely supplies the missing move **and** token under its complete
   hypotheses. Build independent premise assertions and tests for
   EVERY legal first and second defender reply. Otherwise retain a
   minimal replayable outstanding counter-obligation rather than
   calling a resource cap a policy failure or a complete mate.
3. For the KRK `prep -> central` example with inner PREP rank 2 and
   the first restoration bridge, check for a pinned, frozen
   central/restoration rank-composition lemma over the exact nested
   token. If absent, expose the smallest explicit obstruction and
   keep the global termination claim false.
4. Test all legal-root orbits, all defender branches, full-game
   depth/cap sweeps and exact-vs-monotone closed-only cache on the
   **same** full root identities. Cache only all-replies-closed
   subtrees; distinguish mate/capture/stalemate/unsupported/structural
   recurrence/resource cap.
5. Run `npm test`, source-lock checks, all KRK/KQK rank/phase/cycle
   and full-game diagnostics, `npm run check`, `npm run build`
   and both Chromium suites. Create PR, inspect **completed** CI,
   merge/fast-forward only if green, report independent Worker
   deployment separately, and install S040 with measured results.

**Immediately when both Stage A controllers truly become total,**
start Stage B restoring full board-specific equations, proof derivations,
source-linked decisions and history-aware FIDE clocks/repetition for
KRK and KQK. Existing KK/KBK/KNK mathematical panels must remain.
KPK and Engine research remain lower priority.

Frozen KQK `c72365a8ba46f59114a2a77d9d38993f6a52df80`;
KRK theorem `2311abe71bc1a4eed47026feccd5ba5a0760d5bb`;
KRK source `e7de0930fc61caeb11795cf3c10fde11e4774a40`.
