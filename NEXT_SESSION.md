# S049 — close the real source-controller all-plies proof gap (not another finite root sweep)

## Read verified baseline first

Read AGENTS.md, docs/S048_FINITE_COUNTS_AND_TERMINATION.md,
docs/S047_EXHAUSTIVE_ROOT_SHARDS.md and the actual S048 PR, its
merged-main CI, the separate S048 artifact-verifier workflow and the
`s048-verified-finite-census-and-open-termination` artifact. If any
S048 run failed, inspect its real logs and correct the specific
checker/workflow bug without claiming a finished artifact.

S048's S047 baseline: 16 complete shards, 1,048,576 raw labelled
KQK square assignments across colour/turn, 736,904 legal positions,
734,432 ongoing, 728 terminal mates, 1,744 stalemates, 44,352
actual immediate weak queen-capture moves leading to K/K draw.
First source: 289,016 selected, 172,328 independently checked,
116,688 unchecked, 0 missing/illegal/failed. Immediate following
source: 2,105,840 independently checked and 887,680 unchecked;
0 missing/failed. This is **finite root and immediate-reply**
evidence ONLY, not a win certificate or an all-plies game graph.

Pinned READ-ONLY Lean source locks:
- KQK EC-T0050: c72365a8ba46f59114a2a77d9d38993f6a52df80
- KRK EC-T0048: 2311abe71bc1a4eed47026feccd5ba5a0760d5bb
- KRK executable: e7de0930fc61caeb11795cf3c10fde11e4774a40

## Binding owner priority

Stage A: complete genuinely source-derived KRK and KQK
checkmating game controllers for legitimately winning legal roots
against **all** lawful weak replies, classifying real draw roots
and capture-to-K/K correctly. Source moves only; never engine,
Stockfish, tablebase, unproved minimax, heuristic or first-legal
fallback. No false material certification flags. Preserve complete
K/K, K+B/K, K+N/K position-dependent Maths proofs and Engine arena.

Stage B: immediately when BOTH Stage A controllers truly close,
return to full KRK/KQK mathematical derivations, proven policy
provenance and FIDE clock/history parity. KPK and Engine research
remain out of scope.

## S049 actual execution

1. **Verify S048 independently.** Read PR-head Node, pinned
   source checks, all legacy source/phase audits, both browser
   Chromium suites, build, and the dedicated real-artifact gate
   workflow. Verify merged-main. Do not treat the downloaded
   S047 artifact as evidence of Worker deployment; test the live
   Cloudflare Worker separately if direct HTTP/assets access exists.
2. **Stop re-running easy root scans.** Source gap evidence is zero
   at the immediate levels. Select the specific unmatched
   *all-plies theorem obligation*, not another first-turn sample.
   For KQK, inspect exact source-issued token kind, frame,
   rankBefore and full history through far-file/preparation,
   band/raise, protected backrank, tight entry, corner and shadow,
   preserving constructor-selected original vs theorem frame.
3. **Target the minimum upstream bridge.** Establish whether
   frozen Lean has an *algorithm-specific* all-defender
   constructive composition theorem for the exact JS policy,
   rather than class-level `ForceMate` or local
   `MateWithin` existence. If absent, write the precise
   smallest upstream statement (state representation,
   hypotheses, exact source strategy action, token frame
   transport, measure/bound, terminal/queen-capture exception).
   Do not modify the upstream repository from Playground.
4. **Look for a concrete counterexample before asserting any
   rank.** On several genuine S042/S039 token-bearing roots,
   replay all actual legal weak replies across preparation,
   band and phase junctions. Distinguish source missing,
   illegal, failed independent lemma, unverified premise,
   structural revisit, bounded cap, and complete mate.
   For a hard issue record full real board/turn, exact
   history, emitted nested token, frame, source rule,
   move, and legal weak reply. Do not interpret caps as
   proof or synthetic tokens as source.
5. **KRK cross-phase obligation.** Reinspect actual S039
   `PREP(rankBefore=2) -> central` (16-24) and
   `central -> restoration` (11-19), preserving genuine
   nested `krk14-strong-continuation` token and all legal
   immediate weak replies. Prove a global phase-rank
   decrease via named frozen source only if Lean contains
   that theorem; otherwise document the remaining bridge.
6. **If substantive progress is possible** implement a targeted
   independently verified source lemma bridge or robust
   full-token all-reply falsification test, with D4,
   both-colour and negative forged-token regressions.
   Never add a fabricated complete controller or proof.
   Preserve S048's measured census guard, source locks and
   all material flags.

## Quality and close-out

Run npm test, npm run verify:krk-sources,
prior source audits, npm run check, npm run build,
and Maths/Engine browser CI. Commit/PR, merge only when
PR-head checks genuinely pass; verify merged-main,
and install complete S050 prompt from *measured* results.
State separately (A) finite roots, (B) immediate source
choices, (C) full game controller, (D) termination +
FIDE history, and (E) live Cloudflare production.
