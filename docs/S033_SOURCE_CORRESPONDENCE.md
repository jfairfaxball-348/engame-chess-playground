# S033 — frozen KQK theorem-frame authentication and KRK second-source edges

31 October 2026. Downstream Chess Playground PR #42.
Upstream endgame-chess was READ-ONLY. **No production controller,
KK/KBK/KNK maths panel, Engine tab, source lock or release flag changed.**

## S032 baseline and actual frozen proofs

The S032 merged-main [Actions #41196599124](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/41196599124)
passed. S032 had authenticated KRK first-reply continuations on
168/168 weak moves from 24 roots, and observed 24/24 post-preparation
KQK replies invoking a theorem in a *different frame* to the original
FarFileEntry.far_file_stage_bound case.

Frozen KQK SHA: c72365a8ba46f59114a2a77d9d38993f6a52df80.
Read FarFileEntry.lean (four ordered cases), FarFilePreparation.lean
(source-issued all-replies token), SameRankEntry.lean (backrank_entry),
and ClearLowWallEntry via the pinned OrientedEntry import chain.

Frozen KRK source sourceCommit e7de0930fc61caeb11795cf3c10fde11e4774a40,
with frozen EC-T0048 at 2311abe71bc1a4eed47026feccd5ba5a0760d5bb.
KRKWinning/Policy.lean constructs a global **Classical.choose** witness
from F-preservation. KRKForcing/StrategyTransport.lean transports the
ForceMate existence by board symmetry. These do not provide the missing
*executable JS-tagged controller global decreasing rank* across
setup, direct, central, restoration and mate.

## S033 verified KQK result

New script: scripts/kqk33-source-correspondence.mjs; test:
test/s033-source-correspondence.test.js. First
[PR-head Actions #41214503817](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/41214503817)
passed Node tests, all existing source/bounded audits, syntax/build, and both
Chromium suites.

On **four genuine source-issued FarFilePreparation roots**, across 24
immediate legal defender replies:

- original FarFileEntry proof case: 24 horizontal-far-wall;
- all 24 live selections switched frame, to named
  KQK.SameRankEntry.backrank_entry.clear_low_wall;
- **24/24 independently authenticated** in their SELECTED frame:
  strong/queen rank zero, weak rank at least two, queen/weak file margin
  at least two, legal Q(queen.file,1), unchecking weak position,
  nonempty lawful weak replies and no immediate queen capture;
- 0 unresolved cross-frame selections, 0 missing source moves.

This is more than legality: the selected move independently instantiates
the frozen SameRankEntry/clear_low_wall_entry theorem with its full
relevant premises. But it DOES NOT show the original horizontal theorem's
first prescribed branch is reproduced, nor close its all-replies
descendants. The framed theorem is an alternate valid **source** route,
not a chess-engine move.

The audit separately checks four already-far-file geometric positions
through two colours and eight isometries: **16 legal boards per case**
(64 total), all producing named initial actions in the currently tested
fixtures. They are NOT forged preparatory tokens and have NO demonstrated
full-game closure. Selected rule counts:

| Original proof case | Static roots | Source actions selected |
|---|---:|---|
| Separating rank | 16 | 16 BandEntry wall preparation |
| Direct small file | 16 | 8 EntryGeometry wall, 8 alternative-frame FarFilePreparation |
| Horizontal far wall | 16 | 16 alternative-frame FarFilePreparation |
| Tight above | 16 | 8 TightEntry, 8 alternative-frame FarFilePreparation |

These other-frame source actions still require their *own* theorem
premise checks where they are later used. The static case partition is
not live reachability. An additional frozen-source **arithmetic
obstruction** sharpens the next work:

**Tight-above cannot occur after the single legal weak reply of the
FarFilePreparation construction itself.** To reach tight-above, the
post-reply weak rank would equal king.rank+1 and queen.rank would equal
king.rank+2. The preparation's pre-reply weak rank is at least
king.rank+2; one legal weak-king step changes rank by at most one,
forcing the pre-reply weak rank exactly king.rank+2 = queen.rank.
This contradicts the preparation theorem's offWeak hypothesis
(queen.rank != weak.rank). Consequently, case four needs independent
**already-far-file** root coverage, not a fake preparation-token example.

## S033 verified KRK result

New script: scripts/krk33-second-phase-edges.mjs; CI and regression
tests included. All moves are taken from krkTaggedStrongChoice with
authentic previous source tokens. No hypothetical strong move or
adversarial move is inserted into gameplay.

- 24 source-family/colour/frame roots;
- 168 first legal weak replies (S032 regression);
- **980 legal second weak replies, 980/980 named third strong
  continuations**; 0 missing source, rook captures, nonmate terminals;
- transitions: prepared/central->central 200;
  direct/central->central 304; setup/nonwall->central 416;
  setup/nonwall->prep 60.

This uncovers genuine **phase composition branching**: there is no
basis to order every phase by a simple one-direction level.
A global JS-side descent certificate requires source-backed measures
within central/restoration plus induction across phase transfers.
Do not infer descent from the absence of cycles in a two-layer prefix.

At the S031 identical 2,500-node, 160-ply audit budget, the reference
24 all-defender KRK trees still had **0 mate-closed / 24 capped /
0 genuine failures**; S033 changes no live KRK selector, so does not
advertise new all-defender closure or a new certified strategy.
The 96/96 deterministic deep spines are likewise only samples.

## Current release boundaries

- KRK and KQK remain **experimental Stage A**; both
  MATERIAL.*.playable flags remain false for certified release.
- KK/KNK/KBK live full board-specific equations, derivations and
  proof/source panels remain untouched. Engine is separate.
- Real play must still begin from the owner's actual arranged pieces,
  both colours, with legal turns, undo/restart and capture-to-KK.
- Stage B full positional maths/provenance and strict rule/clock/history
  parity begins **immediately after both Stage A controllers are
  universally closed**, before KPK or new Engine work.
- Green CI confirms the repository tests; it does **not** independently
  verify deployed Cloudflare Worker content.

See NEXT_SESSION.md for S034 exact engineering tasks.