# S043 — independently authenticate fresh KQK source actions through third turn

3 November 2026. **Playground-only, audit-only.** Frozen source:
KQK EC-T0050 `c72365a8ba46f59114a2a77d9d38993f6a52df80`,
KRK EC-T0048 `2311abe71bc1a4eed47026feccd5ba5a0760d5bb`,
KRK executable `e7de0930fc61caeb11795cf3c10fde11e4774a40`.
Neither upstream repository nor the runtime selector changed.

## Verified S042 starting baseline

The merged S042 main [Actions run 41537873259](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/41537873259)
passed Node, source checks, build, Maths Chromium, and Engine Chromium
at commit `7ecb13952417f2a9922d24db796b9d640273532a`.
The S042 strict audit used four fresh legal roots per family, each with
a **null input token**, at 100 nodes / 20 pairs per all-reply tree.

| Observed, not universal | Separating-rank | Tight-above |
| --- | ---: | ---: |
| Fresh roots | 4 | 4 |
| First legal defender replies | 20 | 20 |
| Second legal defender replies | 120 | 84 |
| Authenticated first theorem | 0 | 4 |
| Unchecked first theorem | 4 | 0 |
| Unchecked second theorem | 20 | 20 |
| Missing source choices | 0 | 0 |
| Observed captures/nonmate endings | 0 | 0 |
| Tree resource caps | 4 | 4 |

The separation family started with real
`KQK.BandProgress.prepared_king_step` moves, but the old checker
only dispatched TightEntry, EntryGeometry and SameRankEntry, making
these already-supported S040 theorem instances **unchecked**.
The source premise had not failed; the verification path was missing.

## S043 implementation

The S042 diagnostic now also dispatches the independent S040
`authenticateS040LaterAction` checker for **all four** frozen
BandEntry/BandProgress/RankFive theorem constructors. It validates
their complete implemented hypotheses, exact first move and each
immediate legal defender reply. A genuine incoming same-frame
continuation token is checked for board/history/ply identity.
**Cross-frame incoming tokens remain unchecked as continuations**;
a passed local premise on the new frame cannot prove a token bridge.

The source policy sometimes omits `choice.frame` on a continuation
because the exact theorem frame is carried in the **actual issued**
incoming token. S043's first CI attempt exposed this as an erroneous
`unknown source theorem frame` diagnostic. The audit now reconstructs
that frame exclusively from the genuine token, verifies the token's
board/history identity with S040, and reports the effective frame and
its provenance. This is **not** an invented token or a runtime change.

The checker is now applied at THREE successive attacker decisions
after every legal first and second weak reply, using only actual
runtime-selected source moves and exact source-issued nested tokens.
First, second and third authentication/unchecked/failed-premise
counters are separate. In `--full` output, every encountered
nonterminal second reply includes its exact four-ply history,
third selected source/theorem, action, incoming token and premise
verdict. The original source gaps, captures, nonmate outcomes,
potential cycles and resource caps remain separately recorded.

CI now requests **eight fresh roots per family**, 16 total instead
of 8, using 128 candidates and the same 100-node/20-pair tree cap.
No fabricated `FarFilePreparation` token, chess engine, tablebase,
minimax, or arbitrary fallback has been introduced.

Reproduce:

```sh
npm run audit:s042-fresh-families -- --per-family=8 --candidates=128 --nodes=100 --pairs=20 --strict
npm run audit:s042-fresh-families -- --per-family=8 --candidates=128 --nodes=100 --pairs=20 --full
npm test
npm run verify:krk-sources
npm run check
npm run build
```

## Exact remaining mathematical boundary

A finite sequence of authenticated **local** theorems is not a proof
that the chosen JS controller mates against **all** legal defenders.
Any all-reply resource cap remains an **open search cap**, not either
a win or a counterexample. An unknown named source theorem remains
**unchecked**, not false. Stage A is therefore still incomplete.

KRK also retains the authentic S039 `PREP(rank=2) -> central`
witness and central/restoration re-entry. Frozen
`KRKCentral/Prep.lean` `prep_bound` and
`KRKCentral/Restoration.lean` `restoration_bound` provide local
quantitative obligations, and StrategyTransport supplies
symmetry transport, but not one global well-founded rank for the
**exact selected controller on (board, side, continuation token)**.
The missing upstream theorem must quantify every legal defender
response and all source phase crossings. Do not claim otherwise.

All K/K, K+B/K, K+N/K board-specific worked mathematics is retained.
KRK/KQK beta status and fail-closed behaviour remain truthful;
KPK and Engine development are deferred. FIDE clock/history
certification is not newly supplied. GitHub CI does not establish
the live Cloudflare deployment.

## Verified S043 PR-head evidence

[PR-head Actions run 41596372892](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/41596372892)
completed **successfully** at implementation head
`29973f16589b3b02aeed2629e3cfdd06f26c3384` on 3 November 2026.
All 250 Node tests, frozen-source verifications, earlier S035–S042
audits, fresh S043 strict source checks, KQK/KRK adversarial audits,
source/build checks and **both** Maths and Engine Chromium QA passed.
The final documentation-only head is a separate CI event and should
be checked before merge.

The strict 16-root / 100-node / 20-pair results were:

| Directly measured, finite S043 audit | Separating-rank | Tight-above |
| --- | ---: | ---: |
| Fresh legal strong-turn roots | 8 | 8 |
| First legal defender replies | 40 | 42 |
| Second legal defender replies | 240 | 200 |
| Independently authenticated first actions | 8 | 6 |
| First named actions without full checker | 0 | 2 |
| Authenticated second actions | 40 | 12 |
| Unchecked second actions | 0 | 30 |
| Authenticated third actions | 240 | 146 |
| Unchecked third actions | 0 | 54 |
| Failed theorem premises (all stages) | 0 | 0 |
| Missing attacker source actions (all stages) | 0 | 0 |
| Captures / nonmate endings observed | 0 | 0 |
| Resource-capped full defender trees | 8 | 8 |
| Fully mate-closed full defender trees | 0 | 0 |

Thus **288 / 288** sampled separating-rank source decisions
(8 first + 40 second + 240 third) passed independent local theorem
authentication, but **none** of the eight whole defender trees closed.
For tight-above, 164 local actions authenticated and 86 remained
unchecked, including two genuine source-selected
`KQK.FarFilePreparation.far_file_preparation.escape_preserving`
initial constructors. An unchecked source family is not a false theorem.
Both case families retained zero observed hard source gaps, captures,
nonmate outcomes or detected structural cycles at these finite caps.

This is **not** a 16-root global win certificate, still less a proof
of all legal roots and adversarial histories. The strict tests
verify local constructor correspondence only; all 16 capped trees
remain open termination obligations. The KRK full-controller
cross-phase rank and FIDE history are still missing. Cloudflare
production deployment has **not** been independently verified.
