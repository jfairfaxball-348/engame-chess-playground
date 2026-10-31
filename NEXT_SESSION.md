# S032 — source-phase termination and exact KQK FarFileEntry case correspondence

**Execution session** for downstream `jfairfaxball-348/engame-chess-playground`
ONLY. Read `AGENTS.md`, `docs/KRK30_DEEP_SPINES.md`,
`docs/KRK31_CLOSED_MEMO.md`, `docs/KQK29_WALL_PREPARATION.md`
and exact latest merged-main Actions before touching code.
Upstream `jfairfaxball-348/engame-chess` is **READ-ONLY**;
KQK EC-T0050 pinned at `c72365a8ba46f59114a2a77d9d38993f6a52df80`.

## Owner order — do not reorder

1. **Complete the full legal-root, all-defender proof-derived KRK and KQK
   mating controllers**, not only the first move, source-root coverage
   or sampled deep spines. Each strong move must be authorised by a named
   frozen Lean construction. Maths has NO engine, tablebase, minimax,
   invented scoring, guessed action or first-legal fallback. Existing
   arrangement, both colours, gameplay and all KK/KBK/KNK worked maths
   panels must remain intact.
2. Immediately once **both** simplified controllers actually close,
   return to **both KRK and KQK** and bring them to full live board-specific
   mathematical workings, equations, complete proof/branch provenance,
   and 50/75-move/repetition-history/rules-aware parity with KK/KBK/KNK.
   Do NOT move to KPK or unrelated UI/AI work before Stage B.
3. Keep `MATERIAL.krk.playable=false` and `MATERIAL.kqk.playable=false`
   in the formally certified release gate until justified. Experimental
   beta can stay usable under its existing explicit disclosure.
   Never confuse bounded success with a universal theorem.

## Verified S031 handoff

- Original merged-main S030 Actions #41188523177 passed.
- First S031 PR-head Actions #41193610334 passed entire Node,
  source-lock, audits, build and both Chromium QA suites.
- Same 24 stratified KRK roots, 2,500 nodes/160 plies:
  **uncached 0 closed, 24 capped, 0 real failures, 60,024 visited,
  24,544 mate leaves**; history/source/clock-sensitive closed memo:
  **identical counts**, 35,094 completed memo entries and **zero
  reuses**. The memo has no benefit at this bound; leave it
  `--memo=history-counts` opt-in only. Do not weaken its history
  identity just to create apparent savings.
- S030 96/96 deterministic KRK deep spines mate-closed within
  80 strong turns; this remains a regression, NOT all-defender proof.
- KQK 120 same-seed all-defender roots, 2,500 nodes/64 rounds:
  monotone 98 mate-closed/22 capped/0 falsified; exact-depth
  87 closed/33 capped/0 falsified. S030 32/32 first-weak-reply
  fixed-line diagnostic mate-closed when full source-token identity
  replaced its old board-only false cycle.
- S031 **did not** change the live move selector or prove new KQK
  branch coverage. Source correspondence remains unverified for
  `farFileReply` across all legal replies and frames.

## Execute S032

A. **KRK: actual termination structure, not brute-force breadth.**
   Inspect immutable source phase compositions and existing
   `krkTaggedStrongChoice` tokens for a valid, source-referenced
   well-founded rank or explicit bound that decreases under **every**
   legal weak reply. Verify it against 24×colour/frame roots and
   S030 96 deep traces. If the source has no executable ranking witness,
   name the exact missing lemma/translation and keep the unsupported
   case fail-closed. Do not invent a rank or make arbitrary source
   substitutions. When appropriate, encode a checkable phased
   obligation with both-colour/frame/all-reply regressions. Report
   whether this actually closes any complete adversarial trees.
   The S031 opt-in history-cache is NOT the solution.

B. **KQK: isolate the four exact frozen FarFileEntry cases in the
   PREPARATION frame**, respecting Lean's order:
   1. `sk.rank < queen.rank < wk.rank` → separating rank wall.
   2. `sk.rank+2 ≤ wk.rank` and
      `(queen.file ≠ sk.file || sk.rank < queen.rank)` →
      direct small-file wall.
   3. horizontal weak/strong separation and
      `|queen.rank - wk.rank| ≥ 2` → horizontal far wall.
   4. residual `queen.rank=sk.rank+2`,
      `wk.rank=sk.rank+1` → tight-above entry.
   Compare **actual** current `farFileReply` decisions and token
   continuation under every legal weak reply in the same source frame.
   An action taken under a rotated frame needs its own proven source
   applicability, not just legal geometry. Implement a repair ONLY for a
   reproducible source mismatch; no generic frame cycling, new engine,
   or increased budget substituted for correctness.

C. Retain exact user-arranged board; both colours, 4 KRK/8 KQK
   frames, all legal immediate weak replies, capture-to-KK, mate,
   Undo/restart, KK/KNK/KBK full maths and Engine tab isolation.
   Make every source-branch mismatch replayable with position,
   prior proof token and actual weak move.

D. Run `npm test`, `npm run check`, `npm run build`,
   `npm run verify:krk-sources`, KRK phase/root/continuation/
   mate-strata/spine audits, KQK roots + BOTH identical-seed
   adversarial cache modes, and both Chromium QA suites. Distinguish
   **mate-closed / capped / genuine failures** for every bound.
   Compare fixed seeds and state exact changed counters. Green GitHub
   CI is NOT proof of live Cloudflare deployment.

E. Commit isolated branch, PR, verify PR-head checks, merge/fast
   forward main, verify merged-main checks, and install S033
   as a focused executable follow-up. Never assert Stage A complete
   until the *full all-defender strategy from every legal root*
   is established. Once it is, **immediately begin Stage B parity**.
