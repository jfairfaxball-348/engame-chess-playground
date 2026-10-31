# S030 — close KRK all-defender source controller, then KQK and maths parity

**Execution session**, downstream `jfairfaxball-348/engame-chess-playground`
only. Check current `main`, `AGENTS.md`, `docs/KQK29_WALL_PREPARATION.md`,
and the exact last merged-main GitHub Actions run. Upstream
`engame-chess` is **read-only**. Frozen KQK source lock:
`c72365a8ba46f59114a2a77d9d38993f6a52df80`.

## Binding owner priority

1. Complete the actual **all-defender, every legal arranged-root**
   source-derived mating controllers for **both KRK and KQK** in
   simplified playable mode. Every chosen attacking move must translate
   a real pinned Lean construction. No Engines, tablebases, minimax,
   guessing or first-legal fallbacks in Maths. Preserve legal moves,
   colours, exact arranged positions, mates, rook/queen capture-to-KK
   and the entire existing detailed KK/KNK/KBK proof UI.
2. **Immediately after both strategies truly close**, implement full
   board-specific worked maths, equations, theorem links, source move
   provenance, complete outcome semantics and FIDE 50/75-move and
   repetition-history parity for KRK and KQK. Do not start KPK, engines
   or unrelated new material first.
3. Until verified, label the JS policies experimental. An outcome
   theorem or tested first actions do not establish a total policy.

## Last session S029

- S028 merged-main `a97a44c65d63ff9dc45575e87b191b24be0230a3`;
  Actions run `41131434927` passed.
- S029 PR [#38](https://github.com/jfairfaxball-348/engame-chess-playground/pull/38)
  introduced an exact one-reply `band-wall-prepare` token for frozen
  `BandEntry.wall_prepare_bound`, preserving the original Lean frame
  and requiring `preparationPotential(next)+1=preparationPotential(previous)`.
  It added two-colour/eight-frame/all-immediate-reply tests and
  documentation. **Verify S029 merge and its exact CI results** before
  quoting post-change closure figures or proceeding.
- Last known pre-S029 fixed 120-root KQK audits: monotone 98 mate-closed /
  22 capped / 0 hard failures; exact 87 / 33 / 0. KRK remained 24/24
  resource-capped, 0 known hard failures at 2,500 nodes. Do not mistake
  sampling resource exhaustion for a counterexample or complete proof.

## Execute S030

1. **KRK first.** Examine `src/krk-tagged-strategy.js`,
   `src/krk-prepared-wall.js`, `src/krk-central-sequence.js` and
   `scripts/krk14-mate-tree.mjs`. Use source-phase/structural-state
   traces from a fixed KRK15 root to distinguish repeated *identical*
   controller states from distinct branching and false history-dependent
   duplicates. Pin the first real missing phase/cycle if one exists.
   Implement only an exact theorem-authorised action or ranking
   continuation that addresses that precise failure.
2. **KQK follow-through.** Audit the same capped KQK seed/family and
   the exact/monotone cache modes as S028/S029. Determine whether the
   new wall-preparation token changes closure or only expands state.
   Trace deep `WeakToMove`, `FarFilePreparation` and `SameRankEntry`
   children and compare every actual branch of frozen
   `FarFileEntry.far_file_stage_bound` with `farFileReply`.
   Fix only a demonstrated source mismatch.
3. Add a regression for each real repair: both colours, eight board
   frames, every immediate legal defender reply, and exact before/after
   source position. Reject a cap increase or mere extra token as
   evidence of game closure.
4. Run Node tests, frozen-source verification, all KRK root/continuation
   and all-defender audits, both KQK cache modes with identical seeds
   and caps, syntax/build, and two Chromium QA suites. Review
   Maths/Engine isolation and existing KK/KNK/KBK proofs. Separate
   live Cloudflare deployment evidence from CI evidence.
5. Commit on an isolated branch, PR, verify exact PR-head checks,
   merge, verify merged-main checks, and install **S031**. Report
   actual mate-closed, capped and genuine failure counts; do not
   call Stage A or FIDE parity complete without the missing proof.

**No speculative 'strategy complete' language.**
