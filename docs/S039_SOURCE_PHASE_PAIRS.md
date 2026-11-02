# S039 — genuine source-phase pairs and exact finite obligations

2 November 2026. Work is downstream-only; frozen Lean source unchanged.

## Starting gate

S038 main CI run [41418972477](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/41418972477) passed. At the fixed S038 CI scope (1,600 tuples; first 10 source-prepared roots; budgets 80/14 and 160/28) it reported 36 distinct legal candidates, 10 genuine preparation roots, 42 real first defender replies, 38 chosen same-frame low-wall theorem instances and 4 independently authenticated switched-frame low-wall instances. Both budgets closed 4 finite mate subtrees and resource-capped 38; zero missing first source, failed first theorem premise, structural repeats or nonmate terminals were observed. These are **bounded source-controller results**, not universal mating.

The first real S038 resource witness begins at root
`------------------------wQ--------------------------wK----------------------------------------------------------bK--------------:w`
with `FarFilePreparation` source token frame `reflectX`,
strong queen square 14, king square 26, weak king square 56.
The first defender reply was 56-57; the selected source action was
`KQK.EntryGeometry.clear_low_wall_entry.queen_wall` 14-38, authenticated in its selected frame. Node-cap firstProblem after the finite source line is **not** an unsupported source action.

KRK still has the actual `prep -> central` board + nested
`krk14-strong-continuation` source handoff with inner PREP rank 2.
Its checker does NOT supply an immutable frozen *global* cross-phase
strict-decrease lemma over every legal defender reply. In prior
all-reply samples there were also central/restoration edges;
neither a local prep decrease nor a bounded source trace proves
global eventual checkmate.

## Executable work in this session

`scripts/s039-source-phase-pairs.mjs` visits the same deterministic
coprime KQK legal-root orbit generator (both colours, varying board
symmetries). A root is accepted only after the existing source
controller emits its actual `FarFilePreparation` action **and**
real continuation token. For each root:

1. Replay all legal first weak moves, recording exact board, full
   first two-ply log, selected source phase, theorem frame and action.
2. Independently check complete implemented hypotheses of any
   selected `clear_low_wall_entry`, `SameRankEntry.backrank_entry`
   or `tight_king_step` theorem. A theorem with no independent
   complete-premise checker is explicitly **unchecked**, never
   falsely marked proved.
3. After that **source-selected** attack move, replay every legal
   second weak move. Record four-ply history, exact continuation token,
   third source choice and separately checked/unchecked premise status.
   Capture, terminal, missing source and missing independently
   checked theorem are different outcomes.
4. On the exact same first-reply roots and genuine tokens, run
   `probeS036Tree` with paired finite budgets. Preserve first
   missing source action, failed premise, potential structural cycle
   and resource cap as separate replayable obligations. Only fully
   all-reply mate-closed subtrees receive that verdict. A cap never
   earns mate closure.
5. Carry the real KRK cross-phase source witness forward without
   inventing a global phase ranking.

This is **an audit-only diagnostic**: no `src/kqk-source-policy.js`,
`src/krk-tagged-strategy.js`, Maths UI, existing KK/KBK/KNK
proof explanations, Engine tab or material release boolean changed.

## Reproduce

```sh
npm test
npm run verify:krk-sources
npm run audit:s038-orbits -- --tuples=1600 --prepared=10 --nodes=160 --pairs=28 --krk-roots=4 --strict
npm run audit:s039-source-pairs -- --tuples=1600 --prepared=10 --nodes=320 --pairs=56 --krk-roots=4 --strict
# For every replayable root, reply, token and full four-ply log:
npm run audit:s039-source-pairs -- --tuples=1600 --prepared=10 --nodes=320 --pairs=56 --krk-roots=4 --full
npm run check
npm run build
```

PR-head CI also includes all earlier KRK/KQK source, rank and
adversarial audits and both Chromium browser suites.

## Release decisions

**Stage A is still OPEN.** A sample of mate-closed subtrees, local
theorem authentication or a finite cap sweep cannot close a
source-derived *all-defender winning strategy from every legal root*.
The KQK original-frame `separating-rank` and `tight-above`
reachability correspondence needs genuine legal rooted evidence, not
synthetic tokens. The missing KRK central/restoration global
composition rank is explicitly unverified.

Stage B (full KRK/KQK board-specific proof working and FIDE
history/clock parity) begins immediately after genuine Stage A
closure; KK/KBK/KNK working stays intact. KPK and Engine research are
not promoted. Neither GitHub CI nor a merge certifies the
Cloudflare Worker release.

Source locks: KQK `c72365a8ba46f59114a2a77d9d38993f6a52df80`;
KRK theorem `2311abe71bc1a4eed47026feccd5ba5a0760d5bb`;
KRK executable source `e7de0930fc61caeb11795cf3c10fde11e4774a40`.
