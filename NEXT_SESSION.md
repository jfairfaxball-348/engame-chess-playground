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
- KRK13 [PR #20](https://github.com/jfairfaxball-348/engame-chess-playground/pull/20)
  was merged by strict fast-forward into this draft staging branch at
  `be3bc3efe66974ae0975b86066c217ef3815e034`.
  [CI #40941467989](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/40941467989)
  PASSED: 149/149 tests, source locks, build, Maths/Engine browser QA and a
  full **exhaustive** root audit of all 262,144 square triples / both colours.
  All **350,336 legal ongoing fresh strong-turn roots** had an actual legal
  proof-derived first move (175,616 prepared, 147,704 direct,
  27,016 two-step, 0 unsupported). This is NOT a proof that each subsequent
  all-defender path reaches checkmate. See `docs/KRK13_TWO_STEP_SETUP.md`
  and `scripts/krk13-root-selector-audit.mjs`.
- `krkPartialRootChoice` is still deliberately a PARTIAL selector.
  KRK Maths release flags remain OFF.

## Execution tasks

1. Reconcile the stacked heads without altering the upstream proof
   repository's main branch. Read the global
   `KRKForcing.SafeSetup.krk_strong_force_of_not_check` proof and each
   setup case, translating only exact kernel-verified coordinates.
2. **Do not repeat the completed 350,336-root first-move coverage audit.**
   Instead enumerate every legal weak reply AFTER the chosen first action,
   especially all 27,016 two-step setup roots; classify whether the exact
   tagged continuation reaches a prepared wall, another source phase, or
   a genuine missing subcase. Record exact root/reply FENs and source
   lemma for every failure. This is falsification, never a move chooser.
3. Finish the deterministic TOTAL **continuation** selector and global
   finite proof: arbitrary root -> source setup or direct wall -> KRK11
   `PreparedRun` -> KRK10 `CentralRun` -> checkmate, against ALL
   legal defending replies. Prove source correspondence and a global
   well-founded mating rank in fresh importing Lean modules. The
   successful exhaustive first-move JS audit is not a mate proof.
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
