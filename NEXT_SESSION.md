# S031 — close KRK all-defender proof-derived play and KQK exact source branches

**Execution session** for downstream jfairfaxball-348/engame-chess-playground
only. Read AGENTS.md, docs/KRK30_DEEP_SPINES.md, docs/KQK29_WALL_PREPARATION.md
and the exact merged-main GitHub Actions run before changing code.
Upstream jfairfaxball-348/engame-chess is **READ-ONLY**. KQK EC-T0050
source pinned at c72365a8ba46f59114a2a77d9d38993f6a52df80.

## Binding owner order

1. **Finish the actual proof-derived legal-root, all-defender mating
   controllers for both KRK and KQK.** Simplified or 'cheat' play-first
   is temporary, but each strong move MUST be authorised by an exact
   frozen Lean constructor. No Stockfish, Lozza, tablebase, minimax,
   heuristic scoring, guessed move or arbitrary legal fallback in Maths.
   Keep exact arranged boards, colours, legal moves, capture-to-KK,
   Undo/restart and all current KK/KNK/KBK maths proofs.
2. Once BOTH complete, immediately implement full KRK/KQK board-specific
   mathematical equations, worked proof steps, theorem/branch provenance,
   full outcome semantics and proper 50/75-move/repetition-history parity.
   Do NOT begin KPK, unrelated UI polish or Engine research first.
3. Do not label an experimental controller or 96 deterministic sample
   successes a universal, fully formally verified mating policy.

## S030 handoff

- PR #39 introduces deep phase-spine KRK diagnostics and controller-aware
  KQK cycle/cache keys. Check its actual merge state and exact latest CI
  before beginning work, and report changed KQK closure numbers honestly.
- Original S029 merged-main Actions #41183631312 passed. KQK fixed
  120-root, 2,500-node, 64-round results: monotone 98/120 mate-closed,
  22 capped, 0 falsified; exact 87/120 mate-closed, 33 capped, 0 falsified.
  KRK 24/24 capped and no genuine failure at 2,500 nodes.
- First S030 PR-head Actions #41187774682 passed all tests/build/Chromium.
  Across 24 KRK source-root/colour/frame fixtures and four deterministic
  LEGAL defender schedules, **96/96 deep lines reached actual checkmate**
  within 80 attacking turns. This is positive evidence about phase depth,
  not all-defender or universal closure. Do not throw away this progress.
- KQK20 had logged one board-only repeat from fixed strong white
  K=7, Q=58, weak K=9. S030 distinguishes bare board recurrence from
  identical board+full source token and retains rankBefore in KQK21
  all-defender cache identity. Verify the new CI numbers and whether a
  genuine repeating source controller remains.
- Frozen FarFileEntry.far_file_stage_bound has exact cases in order:
  separating rank wall; direct small-file wall; horizontal far wall;
  tight-above entry. The existing JS farFileReply iterates a number of
  source helpers under reflected frames. Inspect the actual tests before
  alleging a mismatch.

## Execute S031

A. **KRK first**: use the S030 96 successful deep spines as a strict
   regression. Attack the branch-width explosion of
   scripts/krk14-mate-tree.mjs and scripts/krk15-stratified-mate-audit.mjs,
   without replacing the frozen strong move policy. A sound
   all-defender *closed-subtree* memo may be considered only after
   proving its identity keeps every decision-relevant clock, source
   continuation and repetition-history fact. Do not memoize capped,
   unsupported or failed nodes and do not conflate merely geometric
   transpositions with FIDE-equivalent states. Provide before/after
   node counts and close actual full trees if possible. If a
   demonstrable, reproducible missing phase emerges, implement ONLY the
   matching frozen Lean branch, with full reply tests.
B. **KQK source case**: reproduce the former fixed-line board repeat
   with the S030 full controller key, trace source phases, classify as
   true loop vs distinct prepared-band continuation. Compare actual
   capped FarFilePreparation / SameRankEntry / WeakToMove children to
   the four frozen FarFileEntry cases. Repair only a demonstrated source
   correspondence failure; do not add generic frame cycling or increase
   caps and pretend this is mate closure.
C. Test every repaired branch for both strong colours, all eight
   KQK or four KRK transformations, every immediate legal defender
   response and the exact source pre/post geometry. Include no rook/
   queen capture and correct mate/undo/restart tests. Preserve
   material-specific KK/KBK/KNK explanations and Engine isolation.
D. Run npm test, npm run check, npm run build, source locks, KRK root/
   continuation/all-defender/spine audits, KQK first-reply and both
   identical-seed cache modes, and both Chromium QA suites. Note
   scope and counters: mate-closed / capped / genuine failures, cycles
   vs distinct-source-token board repeats. A passing Actions workflow
   does not verify live Cloudflare deployment.
E. Commit isolated branch, PR, verify exact PR-head checks, merge,
   verify merged-main checks, install S032 with a targeted remaining
   obligation. Never claim Stage A finished unless every legal root
   really closes under all defender replies; Stage B remains next.
