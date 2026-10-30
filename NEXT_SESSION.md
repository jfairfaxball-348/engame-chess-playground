# S025 — close remaining KRK/KQK adversarial continuation gates

**Execution session following S024.** Binding owner order is unchanged:
(1) complete genuinely playable source-derived KRK **and** KQK strategies
against lawful adversarial defender replies in temporary simplified mode;
(2) **immediately afterward** upgrade both to the mathematics/proof
working and FIDE rule/clock/history parity of KK/KBK/KNK. Do not expand
to KPK or engine research in lieu of this. Preserve the three existing
rich draw-class theorem panels and all working gameplay.

## Exact handoff and immutable source

- S024 playground PR **#33**; document:
  `docs/KQK24_CORNER_AND_RANK_FIVE.md`. Verify it is merged and
  inspect the **exact final-head** CI run, not an earlier run.
- Frozen upstream KQK EC-T0050 SHA
  `c72365a8ba46f59114a2a77d9d38993f6a52df80`
  (read-only).
- S024 translates `SetupCorners.corner_knight_low_five_rescue`:
  rank-five Q(6,5), weak K(7,7) -> Q(5,5), or Q(7,5)
  if K(5,5) blocks. The blocked continuation after K(6,7)
  is Q(6,6) mate.
- S024 fixes `KnightPrison.knight_prison_low_five_bound`:
  rank-five strong K -> K(kx,4), then one-reply tagged knight-prison
  continuation; the low-rank `RankFive.left_corner_bound` and
  `left_fork_weak_bound` JS branches now check sk.rank <= 4.
  `test/kqk24-corner-low-five.test.js` checks both colours,
  eight frames and actual defender replies.
- Reference S023 expanded CI 41057464801: KQK **81/112** bounded
  mate-closed, **31 capped**, **0 hard failures**, strongest cap
  families `FarFilePreparation` 7/8, `WeakToMove` 6/8,
  `SameRankEntry` 5/8, `EntryGeometry` 4/8.
  KRK **24/24 capped**, 0 hard failures, 54,948 structural
  revisits (all distinct incoming histories). Compare S024 numbers
  from its **own** CI, not these S023 numbers.

## Execute

1. Re-run exact enhanced bounded audits from main:
   `node scripts/krk15-stratified-mate-audit.mjs --nodes=2500
   --plies=160 --examples=6` and
   `npm run audit:kqk-adversarial -- --attempts=12000
   --per-family=4 --nodes=2500 --rounds=64`. Record same-seed
   per-family mate-closed / falsified / capped, total branches,
   first cap trajectory and actual late board+token.
2. Prioritise **FarFilePreparation**, **WeakToMove**, and
   **SameRankEntry** after the rank-five repair; use the literal
   `firstCap.path` and `test/kqk23-cap-replay.test.js` pattern
   to reproduce deep late-phase continuations. Inspect the exact
   premises and actual chosen moves in frozen `Rules/KQK/
   {FarFileEntry,SameRankEntry,OrientedEntry,TightEntry,
   KnightPrison,SetupCorners}.lean`. New steps must come from
   source-defined coordinates with all actual weak replies covered.
   Add 2-colour/eight-frame regressions and negative-premise tests.
3. For KRK, the distinct-history revisit explosion is a
   **test cost**, not automatically a controller fault. Explore
   safe diagnostic simplifications or history-complete
   coinductive/measure checks without silently reusing a win
   across different clocks/history/token. Locate first actual
   missing source continuation, if any; test exact nested token
   and all defender continuations. Do not conflate bounded
   evidence with universal mate proof.
4. Check arranged setup preservation, strong/weak turn, colours,
   8 KQK and 4 KRK frames, legal defender replies, piece-capture
   to KK, mate/stalemate, Undo/Restart, existing KK/KBK/KNK
   full mathematical calculations, and isolated Engines tab.
   Run Node tests, source locks, audits, syntax, build, Chromium
   UI QA, exact GitHub CI and deploy verification.
5. Only when both simplified strategies really finish all
   legal branches, **immediately** start Stage B: dynamic,
   position-specific KRK/KQK equations and derivation steps,
   theorem provenance, correct terminal semantics, complete
   50/75-move and repetition history, verified controller
   extraction. Otherwise keep flags **experimental/
   uncertified**, give precise remaining failures or caps,
   and install S026 to close the measured gaps.
6. Commit playground-only code, PR, inspect exact head, merge,
   fast-forward/verify main and independently check production.

Do not edit `engame-chess` upstream. No Stockfish, Lozza,
Syzygy, minimax, search atlas, arbitrary first-legal fallbacks
or hand-ranked pseudostrategies in Maths. Retain all existing
KK/KBK/KNK source links and live proof working.
