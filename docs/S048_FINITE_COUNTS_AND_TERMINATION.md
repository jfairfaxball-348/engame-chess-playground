# S048 — measured complete KQK root ledger and exact all-plies proof boundary

5 November 2026. The actual S047 PR #57 was merged at
[b302254](https://github.com/jfairfaxball-348/engame-chess-playground/commit/b302254349b47cea352055f731cf7eb4034d2d6d).
The **latest PR-head** S047 16-shard workflow
[41825109758](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/41825109758)
and its artifact `s047-complete-finite-root-census` are the frozen
diagnostic input to this session. Earlier post-fix
[41824441006](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/41824441006)
also passed all sixteen shards and merger. The artifact exists, and
the merged-report job printed complete group totals, source rules,
checker categories, selected frames, and first source witnesses.
S048's independent workflow downloads and validates the **actual
artifact**, rather than treating those printed totals as a substitute.

## Complete **finite root** results, not global mate results

Frozen KQK EC-T0050 source SHA:
`c72365a8ba46f59114a2a77d9d38993f6a52df80`.

| Strong side; turn | Raw assignments | Legal boards | Ongoing | Mate roots | Stalemate roots |
| :-- | --: | --: | --: | --: | --: |
| White; White | 262,144 | 144,508 | 144,508 | 0 | 0 |
| White; Black | 262,144 | 223,944 | 222,708 | 364 | 872 |
| Black; Black | 262,144 | 144,508 | 144,508 | 0 | 0 |
| Black; White | 262,144 | 223,944 | 222,708 | 364 | 872 |
| **Total** | **1,048,576** | **736,904** | **734,432** | **728** | **1,744** |

On all **289,016 ongoing strong-turn roots**, the source supplied
an initial legal attacker move (zero missing or illegal).
Independent named-premise checks authenticated **172,328** first moves
and left **116,688** unchecked; zero failed-premise cases.
Selected source families/frames, including all eight D4 frames,
are retained separately by `s048-census-gate-report.mjs`.
The largest source-selected first-action families per strong colour
were vertical wall preparation (34,596), FarFilePreparation (34,464)
and low-wall EntryGeometry (21,636); these are **frequencies**,
not termination certificates.

Among weak-to-move roots there are **44,352 actual legal immediate
queen-capture moves** (22,176 per colour), each leading to a drawn
K/K board. These are *move occurrences*, NOT a count of distinct
drawn root positions or D4 orbits. The exact legal K/Q/k witness
Ka1/Qd4/ke5, Black to move, ...Kxd4 is already covered by S046.

Across checked immediate continuation layers, the independent
checker authenticated **2,105,840** source choices and left
**887,680** unchecked; zero failed premises or missing source
continuations were recorded. Every remaining unchecked action
must stay unchecked, regardless of how many immediate defender
replies have been enumerated. These continuation occurrences
must not be mislabelled as distinct root positions or all-plies
game-tree states.

## New executable safeguard

- `scripts/s048-census-gate-report.mjs <merged-S047.json>`
  rejects missing shards, wrong frozen source, wrong group/terminal
  partitions, lost selected rule/frame counts, broken immediate
  reply/continuation accounting, and any inflated certificate.
- It separates 4 group-level counts, first and later source actions,
  verified/unchecked/failed premises, **immediate capture moves**,
  global proof obligations, and explicit negative certification flags.
- `test/s048-census-gate-report.test.js` covers valid input, incomplete
  or forged scope, inconsistent counts, and failed/unchecked evidence.
- `.github/workflows/s048-census-gates.yml` downloads the genuine
  **S047 PR-head 41825109758** aggregation and asserts the measured
  results, then uploads an independent S048 diagnostic ledger.
  It does **not** recompute the costly entire sixteen-shard scan or
  upgrade finite census to all-depth mate.

Reproduction after downloading the named artifact from Actions:

```sh
node --test test/s048-census-gate-report.test.js
node scripts/s048-census-gate-report.mjs s047-full-root-census.json > s048-finite-gate-report.json
npm test
npm run check
npm run build
```

## Precise outstanding theorem — KQK

S047 found **no observed missing/illegal immediate controller source
action or failing independent premise after the TightEntry correction**.
This is strong finite evidence, but the first new upstream obligation
is not another initial-move coverage sweep. It is a theorem about
the **actual deterministic source-issued selector**, and the state
`(board, turn, exact FULL source continuation token)`, not merely
the board or a newly selected proof frame.

For every legitimately winning, legal KQK root, a source-side
constructive all-reply composition or equivalent certified
selector extraction must establish:

1. The first and each subsequent attacker move is the chosen
   named frozen source constructor, legal at that exact state,
   including the actual selected original/theorem D4 frame.
2. After any legal weak reply on a nonterminal winning branch,
   there exists a source choice **using precisely the issued token**,
   with its original frame, rankBefore, kind, authentication counters,
   and preparation/band/far-file/raise/backrank/corner/shadow phases.
3. A stated *well-founded* measure (or explicit global mate bound)
   decreases on EVERY continuation, including cross-phase and
   frame-transport edges. Proving a separate local `MateWithin`
   bound, or that a first move exists, is insufficient.
4. The weak king cannot win by a queen capture on a supposedly
   winning branch; real drawn/terminal roots (including capture
   to proved K/K) are correctly excluded from the winning theorem.
5. The theorem covers the entire replayable JS source controller,
   not a choice function that might choose **different** moves.

The presently pinned `EC-T0050` outcome and local
`MateWithin` statements have not supplied that all-phase
algorithm-specific composition certificate. **Do not assert a
descending global rank without proving it upstream.** This
downstream repo cannot invent it.

## Independent KRK issue

Real S039 witnesses already record
`PREP(rankBefore=2) -> central` (strong move 16-24)
then `central -> restoration` (11-19), with actual nested
`krk14-strong-continuation` tokens. The frozen PREP bound,
conditional CentralBound restoration, and ForceMate transport
are not a single descending lexicographic ranking of the
implemented dispatcher through restoration and re-entry.
Minimum upstream KRK obligation: an all-weak-reply constructive
composition/bound theorem preserving exact nested token, frame,
turn and legal move history across PREP, central, restoration,
and re-entry, or a certified equivalent policy extraction.

## Release/deployment truth table

- **A** complete finite legal-root enumeration: **YES**.
- **B** all legal *immediate* weak replies examined: **YES**;
  all local premises independently verified: **NO**.
- **C** all-depth winning source-derived controller: **OPEN**.
- **D** all-reply global termination: **OPEN**;
  full 50/75-move, repetition and rule/clock parity: **DEFERRED**.
- **E** Cloudflare Worker production version independently verified:
  **NO**; GitHub/Vercel CI is not a Worker deployment check.

Preserve K/K, K+B/K, K+N/K's complete Maths derivations and
the separate Engine arena. Do not promote KQK/KRK certification
booleans; Stage A must finish before the requested Stage B full
mathematical explanation and clock/rule parity upgrades.
See NEXT_SESSION.md (S049).
