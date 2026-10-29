# KRK10 — Quantitative tagged central-to-mate policy, then all legal roots

**NEXT EXECUTION SESSION — INSTALLED, NOT EXECUTED.**

The owner still wants fully playable proof-derived KRK. KRK09 fixed the
actual pursuit/recentring cycle; do not repeat KRK05 from main's stale
handoff. Continue the latest isolated draft stack.

## Verified incoming work

- Source [PR #10](https://github.com/jfairfaxball-348/engame-chess/pull/10),
  branch `krk09-phase-index`, stacked on PR #9. Exact source SHA/blob lock
  is `proof-sources/krk09-routing.lock.json`; verify final-head full CI.
- `LowerRouting.lean` proves `lowerRouting_terminates`,
  `lowerCentralWithinFive`, chase/wait reply partition and
  `offCentreUpper_sound`. Focused 90-target Lean build passed; all five
  declarations have only standard axioms, no proof escapes.
- Rank `6−orientedStrongFile+rookTempoDebt` decreases for every continuing
  lower reply. Fixed orientation survives until Exit; the lower derivation
  admits only coordinate chase/back-rook actions, no restoration.
- JS `krk-central-sequence.js` has history-bound `central/lower/restore/centre`
  tags. The old Kd5/Ra6 versus Kd7 regression now MUST mate on every reply.
  Tests also complete Kd4/Ra5 versus Kd6 and rescue/tempo roots: 27 roots,
  18,973 actual mate leaves, maximum 29 plies. See `docs/KRK09_PHASE_ROUTING.md`.
- A board may occur during two different control phases. Cycle detection
  includes the phase; FIDE threefold still counts actual board/turn keys.
  Tests explicitly require different moves on the same board in these
  phases. Never suppress the real history to pass a test.

## Precisely distinct next obligation

The new finite lower-to-Exit proof does **not** yet prove the whole tagged
JS composition wins within the source's 50-move budget. Construct that
proof in a NEW importing upstream module:

1. Define source-indexed central, oriented lower, exit, two-rank restoration
   and final centre-alignment states corresponding to the actual JS tags.
   Compose `lowerCentralWithinFive`, upper/aligned lifts and the existing
   restoration constructors. Prove a quantitative all-defender derivation
   to genuine mate, decreasing wall height between full central epochs.
   Budget actual chosen moves, not merely a separate `MateWithin` existence
   witness or a sample-game maximum. Include aligned narrow-margin rescue.
2. Preserve fixed lower orientation; restoration begins ONLY after lifting
   the rook. Prove safe handling of a board visited under different tags,
   then establish fresh-history repetition and 50-move bounds for THIS
   selector. The automatic 75-move and claims semantics must remain honest.
3. Extend to every legal arranged KRK root: off-wall setup, either colour,
   either turn, all frames, capturable rook/drawn roots and terminal states.
   No engine, tablebase, minimax, heuristic or first-legal substitute.
4. Translate only verified source results; update immutable source locks.
   Keep original board/history. Expand complete adversarial mate tests.
   Lower ranks 1–3 currently exceed the 100,000-node diagnostic cap; do not
   label capped trees successful or treat a cap as a mathematical refutation.
5. Run exact-head Lean/axiom CI; `npm test`, `verify:krk-sources`,
   `audit:krk-phase-domains`, syntax, build, static-output verification and
   Maths/Engine Chromium suites. Local browser download was unavailable in
   KRK09's environment; use actual final-head CI results as evidence.
6. Keep the draft stack separate from main, preserve upstream KQK/KPK,
   and keep KRK release flags false until the complete source policy,
   semantics and integration gates pass. Owner already authorised the
   conditional full release; do not ask again on an inferred skill rule.
   Verify actual hosting before claiming deployment; prefer Cloudflare
   Workers static assets and keep Vercel as rollback.

Do not create another helper-only successor to avoid this composition.
The target is the complete quantified source-derived playable opponent.
