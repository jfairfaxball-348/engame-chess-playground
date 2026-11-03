# S045 — all three S044 KQK local source gaps independently authenticated

3 November 2026. **Audit-only**, based on frozen upstream Lean EC-T0050
`c72365a8ba46f59114a2a77d9d38993f6a52df80`. No changes to the
KQK/KRK runtime move selector, existing K/K–K+B/K–K+N/K Maths proof
working, independent Engine, material release flags or upstream research.

## Frozen source correspondence implemented

New `scripts/s045-source-premises.mjs` implements THREE independent local
checkers for the exact named source actions that remained unchecked in S044:

1. `KQK.TightEntry.protected_file_entry.forward_wall`:
   `Rules/KQK/TightEntry.lean`, `protected_file_entry` forward
   branch: far-file, left-clear, height, above/adjacent weak rank,
   horizontal distance and forward orientation. The **exact** queen
   destination `(strongKing.file+1,queen.rank)` is required; the
   transported source's safe/protected wall conditions are checked.
   The incoming `tight-file` source token is genuine: both prior
   legal moves, predecessor board, ply-count, king/queen/weak identity
   and original frame are independently replayed.
2. `KQK.SameRankEntry.backrank_entry.king_to_weak_file`:
   `Rules/KQK/SameRankEntry.lean` final branch after its file-wall,
   off-rank and adjacent-queen cases have been excluded. The exact
   source king destination `(weak.file,0)`, all prescribed geometry
   and emitted `backrank-protected` continuation token are checked;
   every real legal weak reply must enter the protected-queen domain.
3. `KQK.SameRankEntry.protected_backrank_entry.queen_up`:
   the `protected_backrank_entry` source premise, adjacent
   king/queen files and exact queen destination `(queen.file,1)`;
   verifies safety, legality and all immediate weak replies. The
   two-ply continuation path requires the genuine `backrank-protected`
   incoming token; the direct protected-queen branch requires no
   invented predecessor.

Every accepted move is checked against the **actual** available legal
chess move and every immediate legal defender reply. The checker
never selects moves, changes the source frame or manufactures a token.
Missing frame/unsupported bridge is `unchecked`, a demonstrably false
implemented premise is `failed-premise`; both remain distinct.
Test `test/s045-source-premises.test.js` exercises both colours,
selected symmetries, all available weak replies and rejection of
forged move/frame/token/history/predecessor witnesses.

`scripts/s042-fresh-families.mjs` now dispatches the three checkers.
`package.json` adds syntax verification and the repeatable
`audit:s045-fresh-source` audit. GitHub workflow preserves S044
original and widened outputs, adds strict **32 distinct legal roots
per family**, records true original/source-chosen frames, source
tokens and complete two-defender-layer histories, and uploads the
expanded full trace. A cap is always inconclusive.

## Actual S045 green PR-head measured counters

Implementation HEAD `6025b466491647faee40f96f6a1b46da5eabe304`,
[Actions run 41677727564](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/41677727564)
**passed**: all Node tests, source-lock verification, earlier KRK/KQK
rank/adversarial and S035–S044 audits, S045 strict audit, npm
check/build, and **both** Maths and Engine Chromium suites.

| Measure | Separating-rank | Tight-above | Total |
| --- | ---: | ---: | ---: |
| Fresh legal roots | 32 | 32 | 64 |
| First legal weak replies | 144 | 162 | 306 |
| Second legal weak replies | 880 | 720 | 1,600 |
| First independently authenticated actions | 32 | 32 | 64 |
| Second authenticated actions | 144 | 162 | 306 |
| Third authenticated actions | 880 | 720 | 1,600 |
| **All authenticated local actions** | **1,056** | **914** | **1,970** |
| Unchecked named constructors | 0 | 0 | 0 |
| False verified premises | 0 | 0 | 0 |
| Missing source actions | 0 | 0 | 0 |
| Immediate captures / nonmate terminals | 0 | 0 | 0 |
| Potential structural cycles (bounded tree) | 0 | 0 | 0 |
| Resource-capped full game trees | 32 | 32 | 64 |
| Fully mate-closed full game trees | 0 | 0 | 0 |

The **identical S044 widened 24+24 roots**, when rerun with the
new checkers, now authenticate **1,578/1,578** local source actions:
880 separating-rank plus 698 tight-above, zero unchecked/failures.
That closes the **114 previously missing independent *local*
checker instances**, not the global mating proof. All **48** S044
trees remain capped. Original eight-per-family baseline remains in
the same CI, fully source-traced. The enlarged audit includes both
strong colours and original/selected frame evidence, including
8 selected alternate frames in tight-above. Expanded artifact:
[full S045 source replay](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/41677727564/artifacts/13250712669).

## KRK exact frozen-source boundary

From the actual S039/S037 source replay, an authentic
`krk14-strong-continuation` token with
`inner.stage=prep, rankBefore=2` enters the central phase,
selecting `EndgameChess.Rules.KRKExecutable.offCentreUpper_sound`
move `16-24`. The concrete subsequent
`central -> restoration` crossing selects
`EndgameChess.Rules.KRKExecutable.restorationKing_sound`
move `11-19` with recorded log
`White Kd2; Black Kg5; White Ra4; Black Kh6`.
The nested `inner.stage=central, rankBefore=0` includes a
restoration `wallRank=3`. Neither transition is a fictional
phase label; neither carries a frozen global terminating rank.

At immutable KRK executable proof SHA
`e7de0930fc61caeb11795cf3c10fde11e4774a40`:
- `KRKCentral/Prep.lean` `prep_bound` establishes a local
  `MateWithin` based on `readyCost` plus `prepCost`;
- `KRKCentral/Restoration.lean` `restoration_bound`
  requires a supplied `CentralBound σ y E` and gives
  `MateWithin σ (E+6)` under its geometry;
- `KRKForcing/StrategyTransport.lean`
  `krk_force_transport` transports `ForceMate` existence,
  **not the JS token-tagged source move controller**.

No immutable theorem found here proves a well-founded descending
measure or bound for the exact `(board,turn,nested continuation
token)` policy over *every* weak reply and prep/central/restoration
re-entry. A source `Classical.choose`, local `MateWithin`,
finite noncycle or phase graph does not fill that obligation.
Do not fabricate a global rank or certify KRK Stage A.

## Release and next obligations

**Stage A remains OPEN for BOTH KRK and KQK.** These are
experimental partial controllers, not certified all-defender
maters from every legal starting position. The S045 independent
premise checker totality on **sampled first three attacker moves**
does not certify their later moves, all root classes or eventual mate.
Resource caps are open obligations. KRK/KQK certified release flags
remain false; strict FIDE 50/75, repetition and clock parity remain
deferred, with Stage B immediately after *genuine* Stage A closure.
KPK and unrelated Engine research remain lower priority.
KK/KBK/KNK original full mathematical working is preserved.

GitHub CI green is **not a Cloudflare Worker deployment**.
No production Worker deployment or HTTP asset version is certified
by this session. See `NEXT_SESSION.md` for S046.
