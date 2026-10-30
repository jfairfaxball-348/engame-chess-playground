# S021 — adversarial KQK continuation falsification and owner sequencing

30 October 2026. This session operates exclusively in Chess Playground.
The mathematical source of truth is the pinned EC-T0050
(`c72365a8ba46f59114a2a77d9d38993f6a52df80`).

## Previous S020 evidence — do not confuse samples with global proof

The main branch's successful GitHub run 41047939950 logged
`npm run audit:kqk-roots` with 898/898 sampled valid strong-turn roots
selectable, 3827/3827 immediate legal weak replies receiving a next
source move, and 32/32 deterministic first-legal-defender full lines
ending in mate. The sample covered 1600 attempted boards, seed
`0x20c72365`. It was **not** an all-defender game analysis.

## S021 instrument

`scripts/kqk21-adversarial.mjs` is the new standalone **test-only**
bounded attacker/defender game-tree falsifier. It neither supplies a
move nor influences live Maths opponent selection. At every weak turn it
branches over *all* lawful lone-king moves and returns to the existing
source-tagged KQK controller (with exact continuation tokens). Roots
come from a fixed-seed reproducible sampling of both colours and both
turns, stratified by actual selected KQK source family. Root and budget
selection is independent of the live opponent. Its output identifies
terminal checkmate, unsupported source phase, captured queen/KK draw,
stalemate, structural cycle, round cap and node cap separately.

Unlike a single first-legal reply, a source continuation that fails
against even one defending move is a counterexample within the tested
root/path. Exhausting a bounded tree is useful evidence but can never
certify every legal starting root. A cap is **inconclusive**, never a
success. Structural cycle keys include position and source-token identity
but deliberately omit full clock history to match the temporary
play-first goal. The audit **does not** certify strict repetition,
50/75-move, or parity to the parent full mathematical games.
`npm run audit:kqk-adversarial` and the CI workflow run this audit;
the Node test checks fixed-seed reproducibility and honest accounting.
No external engine, tablebase, minimax, scoring heuristic, or live
fallback was added.

## S021 first measured adversarial run and concrete policy correction

Exact-head CI 41049858581 passed all Node/Chromium checks. Its
`audit:kqk-adversarial` diagnostic used 4000 attempts and sampled
**56 legal source-stratified roots** (including lone-king-to-move),
exploring **35,879 positions** and **18,504 legal defender replies**,
with per-root 1200-node and 48-round caps. It reported **26
all-replies-mate**, **1 falsified**, **29 inconclusive due to caps**.
This replaces earlier claims based only on one fixed defender path;
the 29 unknown cases are *not* wins. In particular, the edge and
oriented-entry families closed on all four sampled roots each, while
same-rank, far-file and weak-to-move trees commonly reached caps.

The concrete falsifier was an initially unsupported legal position:
**Black K a8 (square 56), Black Q a6 (40), White K c7 (50);
Black to move**. In the frozen
`formal/EndgameChess/Rules/KQK/SameRankEntry.lean`,
`backrank_entry` lines 99–131, the final exceptional case has
adjacent king-to-weak and queen-to-weak files with the queen and king
two files apart. Its actual construction is the
`king_move (t := (wk.1,sk.2))`, followed after any weak reply by
`protected_backrank_entry`.

S021 adds exactly that source-derived `KQK.SameRankEntry.backrank_entry.king_to_weak_file`
move under the three exact file-distance premises to
`src/kqk-source-policy.js`. No generic move selection was added.
The original counterexample corresponds to **...Ka7** from a8.

The first post-fix exact-head CI run 41050376840 passed. With identical
seed and budgets, the source-stratified audit now selected **55 roots**:
**26 bounded all-replies-mate, 0 falsified, 29 inconclusive**.
The previously isolated `UnsupportedAtRoot` bucket vanished; because
sampling quotas are keyed to selected source family, the denominator
changed from 56 to 55. This is **not** a paired improvement in the
mate percentage and not a universal completion claim. The concrete
previously failing placement has its own eight-symmetry, two-colour
test with exhaustive *immediate* weak replies.


Tests exercise the repaired placement, the legal move and every
immediate defender response across eight symmetries and both
colours. Do **not** describe this repair as closing the global policy:
rerun the adversarial audit on the final head to measure the remaining
gaps.

## Binding owner priority (supersedes historic gate language)

1. Close **both KRK and KQK** simple-mode strategy demonstrations from
   user-arranged legal positions, including all defender continuations
   and actual checkmating play, not merely source availability.
2. Then **immediately return to KRK and KQK** for the same detailed
   equation/working/derivation/phase and real rule-and-history fidelity
   already demonstrated by KK/KBK/KNK, to the extent upstream verified
   Lean constructions really support it. Implement missing mathematical
   authoring only upstream, with source locks. Do not mistake a source
   mate-existence theorem for certified JS extraction.
3. Defer KPK, further material imports and elective engine research
   until that parity work is appropriately completed.

No owner direction permits deleting or hiding the existing
**KK, KBK and KNK full worked Maths panels**. Keep both the simplified
strategy milestone and eventual complete proof/rule fidelity visible
as distinct scopes.
