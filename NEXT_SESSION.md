# S024 — resolve real KRK/KQK late-game strategy gaps

**Execution session after S023.** Binding owner order:
complete *both* KRK and KQK adversarial, source-derived
simplified playable controllers first; then **immediately** restore
full board-specific mathematical proof working and FIDE history /
clock / rule parity for both. The existing KK/KBK/KNK Maths
theorem panels are already complete and must stay intact.
KPK and Engine experimentation do not displace this work.

## Exact source handoff

- Playground S023: PR #32; detailed record:
  `docs/KQK23_FAR_WALL_AND_KRK_DIAGNOSTICS.md`.
- Frozen KQK EC-T0050 source SHA:
  `c72365a8ba46f59114a2a77d9d38993f6a52df80`.
  S023 added the exact narrow `OrientedEntry.horizontal_far_wall_entry`
  Q(6,qy) construction. Do not rewrite as an unsourced heuristic.
- Initial S023 head: Node/source/build/Chromium green on
  CI run 41057127613; unchanged-seed KQK 37/55 all-defender
  mate-closed, 18 capped, 0 confirmed hard failures;
  KRK 24/24 1,000-node capped, 0 genuine failures.
- Expanded S023 CI run **41057464801** (green) used
  `--attempts=12000 --per-family=4 --nodes=2500 --rounds=64`:
  **KQK 81/112** bounded all-defender roots mate-closed,
  **31 capped**, **0 hard failures**; `FarFilePreparation`
  7/8 capped, `WeakToMove` 6/8, `SameRankEntry` 5/8,
  `EntryGeometry` 4/8. No claim of global completeness.
- KRK expanded to 2,500 nodes *per root*: **24/24 capped**,
  0 observed hard failures; 54,948 structural revisits,
  **all with distinct incoming histories**. A naive board+token
  closure cache would not be legitimate FIDE-parity evidence.
  The existing first-root 40k-node audit also caps.

## Execute, don't stop at a diagnosis

1. Verify merged `main`, exact latest PR/main CI and the **expanded**
   CI tier: `node scripts/krk15-stratified-mate-audit.mjs
   --nodes=2500 --plies=160 --examples=6`;
   `npm run audit:kqk-adversarial --
   --attempts=12000 --per-family=4 --nodes=2500 --rounds=64`.
   Record closed/falsified/capped separately for every source family;
   do not silently upgrade caps to wins.
2. Triage KQK **FarFilePreparation**, **SameRankEntry**,
   **WeakToMove** first, since the S023 baseline had 0/4,
   0/4 and 1/4 closed respectively (with caps, not failures).
   Use `firstCap.path`, and the exact adversarial replay in
   `test/kqk23-cap-replay.test.js`, to inspect late-phase
   board+token, not just a root first move. Locate the matching
   named source lemma in frozen
   `Rules/KQK/{FarFileEntry,SameRankEntry,OrientedEntry,TightEntry}.lean`.
   Translate only a move with literal verified premises and
   all-reply continuation, add both colours/all applicable frames
   and legal-player-root regressions. No unsourced fallback.
3. For KRK, use new per-root `structuralRevisits`,
   `distinctHistoryRevisits`, defender branching and first
   cap path to distinguish repeated-work blowup from missing
   source continuation. Do NOT memoize a win across different
   histories/clocks without a justified history-equivalence proof.
   Re-run strict actual source selection against *every*
   tested defender move, retaining complete nested token.
4. Test exact editor setup placement, strong/weak turn,
   both colours, eight KQK/four KRK frames, lawful weak
   replies, queen/rook capture-to-KK, checkmate, stalemate,
   undo/restart, all existing KK/KBK/KNK proof calculations
   and Engines-tab isolation. Run Node, syntax, source locks,
   build and Chromium QA; check exact head CI.
5. **Only if both** simplified strategies are genuinely
   complete against adversarial defender replies, switch
   immediately to Stage B: position-specific KRK/KQK maths
   equations, step-by-step theorem provenance, complete
   50/75-move and repetition history, actual terminal
   semantics, and genuinely certified selector extraction.
   If not, clearly mark unresolved cases and install S025
   targeting the measured blockers.
6. Commit playground-only changes, open PR, inspect exact
   commit CI, merge and verify `main` and production
   independently. Update this handoff with measured evidence.

Never change the parent research repo. Maths must not use
Stockfish, Lozza, Syzygy, minimax, hand-selected best moves,
or arbitrary first-legal fallbacks. Keep both JS selectors
explicitly **experimental and uncertified** until proved.
