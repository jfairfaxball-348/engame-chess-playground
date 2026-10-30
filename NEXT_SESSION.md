# S023 — close remaining KRK/KQK adversarial strategy gaps (Stage A)

**Next execution session after S022.** Binding sequence: finish the
**source-derived checkmating strategies** for *both* KRK and KQK
in temporary simplified-mode gameplay, THEN immediately return to
the **full mathematical derivation, proof-panel and FIDE history/clock
parity** for those same classes. Do not divert to KPK or engine research,
and never regress the already-complete KK/KBK/KNK worked Maths.

## S022 source and test handoff

- S022 PR #31 added `KQK.OrientedEntry.high_file_corner_entry`
  exact Q(7,5)# from frozen parent EC-T0050
  `c72365a8ba46f59114a2a77d9d38993f6a52df80`, with
  legal setup/colour/eight-symmetry mate regression.
- KQK all-defender audit now memoizes ONLY fully closed, depth-matched
  all-mate subtrees, checks structural cycles first and keeps caps
  explicitly inconclusive. Run `npm run audit:kqk-adversarial`.
- Initial S022 green PR-head CI run 41052834416 (before corner addition),
  same 55 sampled roots as S021, closed 37 vs previous 26,
  falsified 0, capped 18. 13,146 reuses of fully closed subtrees.
  **Recheck final-head metrics**; never interpret 18 caps as wins.
- S022 added CI KRK source-stratified all-defender audit
  `node scripts/krk15-stratified-mate-audit.mjs --nodes=1000 --plies=160 --examples=6`.
  Initial run: 24/24 capped, 0 genuine failures,
  0 root family mismatches, 9,724 mating leaves.
  Existing KRK one-root 40k-node test also caps.
- Complete S022 notes in `docs/KQK22_CLOSURE_AND_CORNER.md`.
  KRK/KQK certified-selector flags remain false.
  The remaining proof-related ambiguity must remain visible.

## Execute S023 (do not stop at research)

1. Inspect latest merged `main`, PR head and exact CI JSON.
   Run KQK `--attempts=12000 --per-family=4 --nodes=2500 --rounds=64`
   where CI resources allow. Record family-level all-mate,
   hard failures, capped roots separately. Use each new
   `firstCap.path` to replay a representative late-stage
   state, not merely the first attacker action.
2. Add targeted regression(s) for an actual missing or cyclic
   continuation, both colours and every applicable board symmetry.
   Match the *exact* cited frozen Lean theorem and hypotheses
   before adding a source-tagged move. Consider
   `FarFileEntry.far_file_stage_bound` and
   `OrientedEntry.horizontal_far_wall_entry`
   (especially high-file/low-margin exceptions).
   No unsourced fallback.
3. Improve KRK all-defender termination analysis without hiding
   cycles under clock/history, and make capped leaves transparent.
   Distinguish combinatorial reconvergence from genuine strategy
   incompleteness. Keep the complete state/token when checking
   cycles; do not reuse different FIDE histories as equivalent.
4. Test both from **exact user-arranged legal placements**,
   strong/weak turn, both colours, all frames, every lawful
   weak reply, mate/draw/capture/undo/restart, Maths proof
   regression and Engines isolation.
5. If BOTH are truly complete for the temporary simplified
   chess-rule scope, immediately install Stage B:
   position-specific KQK/KRK math equations and derivation steps,
   live theorem provenance, correct repetition/50/75 move and
   terminal semantics, and complete certified selector work
   genuinely supported upstream. Do not invent Lean proofs.
   Otherwise install S024 with precise measured remaining gaps.
6. Run Node, syntax, source lock, build, broad KQK/KRK audit,
   Chromium Maths + Engines QA, exact-head CI. Commit, PR, merge,
   verify main and any deployed production site separately.

**Strict limits:** Maths runtime uses named frozen constructive source
rules only. No Stockfish/Lozza, tablebases, minimax, arbitrary move,
first-legal fallback or false certification. Caps remain inconclusive.
Do not delete or simplify KK/KBK/KNK mathematical working.
