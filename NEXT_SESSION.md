# KRK14 — Complete global KRK move selection and full-board gameplay

**NEXT EXECUTION SESSION — INSTALLED, NOT EXECUTED.**

## Owner priority

Finish the complete proof-derived KRK winning strategy and all-legal-root
playability. **Defer 50-move, 75-move and repetition-claim certification.**
Do not assert that a mathematical mate strategy is a FIDE-certified game.
Never use the Engine tab, Stockfish/Lozza, tablebases, minimax, an unproved
heuristic, position atlas or first-legal fallback to choose Maths moves.

## Verified boundary and incoming work

- Playground staging `krk11-history-claims-audit` includes KRK11
  prepared-wall and KRK12 direct-entry actions; exact SHA
  `e666ca73f0c8c9fc69ed96078d0dc04175c3e971` passed CI
  [#40938931511](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/40938931511).
- Upstream KRK11 `krk11-prepared-wall-policy` at
  `7cfd8462a9fd36c8e37250221ee809b5b8287836` passed Lean build
  [#40936122548](https://github.com/jfairfaxball-348/engame-chess/actions/runs/40936122548).
  The executable global root selector is NOT thereby completed.
- New KRK13 Playground [PR #20](https://github.com/jfairfaxball-348/engame-chess-playground/pull/20)
  adds the two pre-existing source-proved off-rank far-file and back-rank
  king-alignment setup moves; guards real-board/reply continuation and
  tests colour/frame/all-reply branches. Read
  `docs/KRK13_TWO_STEP_SETUP.md`. Confirm **exact final head CI**
  before promoting it, and check whether it has been integrated into
  staging; do not assume PR #20 is merged.
- `krkPartialRootChoice` is still deliberately a PARTIAL selector.
  KRK Maths release flags remain OFF.

## Execution tasks

1. Reconcile the stacked heads without altering the upstream proof
   repository's main branch. Read the global
   `KRKForcing.SafeSetup.krk_strong_force_of_not_check` proof and each
   setup case, translating only exact kernel-verified coordinates.
2. Build an **exhaustive legal-root domain report**, both colours and
   source frames, for every strong-to-move KRK board: classify by proved
   phase, test legality of returned action, and record precise FENs for
   any uncovered legal root. The domain audit must not be a move chooser.
3. Complete the deterministic TOTAL selector, including any remaining
   setup+entry frame transitions, with all-defender finite composition
   into KRK11 `PreparedRun` and KRK10 `CentralRun`. Prove totality,
   source correspondence and well-founded global mate termination in
   NEW importing Lean modules. No empirical coverage substitutes for proof.
4. Classify all **weak-to-move** roots: mate, stalemate, immediate rook
   capture to KK draw, and every safe legal weak reply into the winning
   strong-turn selector. Do not move for the weak side.
5. Verify representative complete games against every legal reply, board
   continuity, symmetry, unmodified Engine tab, Maths proof display,
   immutable per-source blob hashes, CI/Lean axioms, and browser QA.
6. When and ONLY when mathematically total, enable a clearly labelled
   proof-derived mathematical KRK play mode. Make any absent standard
   clock/history certification conspicuous. Merge exactly checked
   heads; no unverified claims of Cloudflare/Vercel production deployment.

If totality remains incomplete, leave a tested, executable improvement,
an exact list of counterexample roots/unsupported phases and a distinct
next proof obligation. Do not install another prompt in lieu of work.
