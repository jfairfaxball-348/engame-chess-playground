# S037 — close the first S036 real-token source gap

**Execution, not another cosmetic report:** implement, unit-test,
PR-head CI, merge/fast-forward if green and install S038.
Only edit `jfairfaxball-348/engame-chess-playground`; parent
`jfairfaxball-348/engame-chess` is READ ONLY.

Start with `AGENTS.md`, `docs/S035_SOURCE_BRIDGES.md`,
`docs/S036_CROSS_PHASE_CONTINUATIONS.md`, `scripts/s036-cross-phase-audit.mjs`,
and the last merged PR. Re-run:

```sh
npm run audit:s036-cross-phase -- --nodes=800 --pairs=64 --prepared=8 --tight=4 --krk-roots=8
npm run audit:s035-source-bridges -- --strict
```

Priority is **Stage A**: genuinely complete source-derived KRK and
KQK checkmating strategies from each legal user-arranged board,
against every legal lone-king response, with exact squares/colours/
turns, rook/queen capture-to-KK, undo and existing KK/KNK/KBK proof UI
preserved. The experimental controllers remain marked as such until
universal certification exists. No engine, tablebase, minimax,
fabricated source token/rank or first-legal attacking fallback.

1. From the S036 JSON, pick the first **actual** unsupported KQK
   continuation, if any. Reconstruct its board, exact source-issued
   token, two legal move histories and original/switch theorem frame.
   Audit frozen theorem premises and implement only a genuinely
   specified source branch. Expand original-frame separating-rank
   reachability and already-far tight/root strata with deterministic,
   reproducible seeds. Do not relabel switched-frame proofs as original.
2. From `firstCrossPhaseWitness`, identify the first KRK
   central/restoration phase-transfer **whose descent is not secured
   by an identified frozen lemma**. Classify the exact source term and
   either verify a source-backed rank for every legal weak reply or
   preserve the counterexample as an unproved obligation. Do not
   infer a global termination rank from the verified PREP rank.
3. Deepen all-reply probes from the same source-issued roots; record
   mate-closed, node/pair caps, unsupported, structural repeats,
   legal-piece capture and nonmate terminals distinctly. Compare
   KQK exact vs monotone caching on identical deterministic
   roots/depth/caps; only ever cache fully closed subtrees.
4. Run `npm test`, frozen-source verification, all KRK/KQK
   root/phase/rank/closure/cycle audits, `npm run check`,
   `npm run build`, two Chromium suites in GitHub Actions.
   Report **measured** counts, never assert universal mating or FIDE
   parity from a finite sample. Merge only after verified CI and
   distinguish merged GitHub from independent Cloudflare deployment.

Immediately after BOTH Stage A strategies actually close, resume
**Stage B** for BOTH KRK and KQK: live board-specific derivations,
equations, move-proof links and full rule/clock/history parity,
without regressing KK/KNK/KBK. KPK/Engine work remains lower priority.

Frozen provenance: KQK EC-T0050 `c72365a8ba46f59114a2a77d9d38993f6a52df80`,
KRK EC-T0048 `2311abe71bc1a4eed47026feccd5ba5a0760d5bb`,
KRK sourceCommit `e7de0930fc61caeb11795cf3c10fde11e4774a40`.
