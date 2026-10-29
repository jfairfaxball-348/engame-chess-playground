# KRK11 — Finish the clock-safe selected policy and legal-root coverage

**NEXT EXECUTION SESSION — INSTALLED, NOT EXECUTED.**

Continue the KRK10 draft stack, not main's stale KRK05 handoff.
The owner still wants the complete proof-derived playable KRK opponent.

## Verified incoming result

- [Parent PR #11](https://github.com/jfairfaxball-348/engame-chess/pull/11),
  branch `krk10-central-policy`, exact source
  `2433df9ea1ccbba000740cb89f2f0f276ce65d37`, stacked on PR #10.
  Full Lean/axiom CI #40933068414 passed; focused local build passed 91
  targets. The three main declarations have standard-only axioms.
- `KRKExecutable/CentralPolicy.lean` defines actual guarded coordinate
  choices, central/lower/exit/restore/centre tags and `CentralRun`, an
  all-legal-defender finite derivation counting real chess plies.
  `policy_uncut_central_bound` proves the selected uncut CENTRAL policy
  reaches mate. `centralRun_mateWithin` connects it to the kernel.
- The exact bound is `18*((7-y)-1)+11`: rook ranks 1–6 give
  **101, 83, 65, 47, 29, 11 plies**. Rank >=2 has a proved 83-ply run.
  These are static full-central-wall statements, not all-root or FIDE
  history certificates. A 101 upper bound is not a 101-ply lower bound.
- Playground `krkCentralStaticBound` exposes this honest scope, checks
  audited traces against the static bound, and preserves all release
  flags. `proof-sources/krk10-central-policy.lock.json` pins 15 files;
  original frozen and KRK09 source locks remain independent.
- All 137 local Node tests pass. Check final-head Playground CI for
  source provenance, phase domains, syntax, build and both browser suites.
  See `docs/KRK10_CENTRAL_POLICY.md` and the draft PR's final CI links.

## Actual next obligation

1. Close the quantitative budget gap for the **selected** policy. The
   parent's tighter full-central 85-ply proof uses protected perpendicular
   cuts; current JS uses the uncut pursuit/restoration policy. Do not
   transfer the parent's 85/95/97/98 bounds to different selected moves.
   Either prove a genuinely sharper bound on this same tagged policy,
   coupling lower-phase progress with the following restoration cost,
   or compose the proved cut phases and translate their full continuation.
   No heuristics, minimax, tablebase, engine or arbitrary move fallback.
2. Prove fresh-history repetition and 50-move safety for the resulting
   selected policy, including the board occurring under two different
   control tags. Count actual board/turn keys for claims; preserve the
   arranged board, clocks and history. Retain honest 75-move semantics.
3. Compose every legal KRK root: off-wall setup, weak-to-move, both colours,
   frames, captured/capturable rook, drawn roots and terminal cases. The
   current proof starts only at a full central wall; do not enable the
   material class on that restricted result.
4. Translate only source-verified additions; update immutable locks and
   complete all-defender games. Capped reply trees are neither successful
   verification nor mathematical counterexamples. Keep every branch.
5. Run exact-head Lean/axiom CI, Node tests, all source locks, phase domains,
   syntax, build, static package and Maths/Engine browser suites. Keep
   KQK/KPK, parent main and frozen modules intact. Keep the draft stack
   separate until coherent tested integration and release gates pass.
6. `KRK_GAMEPLAY_RELEASED` and `MATERIAL.krk.playable` remain false until
   the complete source-derived opponent and rule semantics pass. The owner
   already authorised the conditional full release; no new inferred
   approval flow. Verify actual Cloudflare Workers deployment before any
   production claim; Vercel remains rollback.

This is no longer a local-helper or central-cycle problem: the selected
central policy is now proved to mate. Finish its clock-safe whole-class
composition, rather than installing another helper-only successor.
