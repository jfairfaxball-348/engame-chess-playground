# KRK15 — Prove tagged KRK all-defender termination and close remaining complete-game paths

**NEXT EXECUTION SESSION — INSTALLED, NOT EXECUTED.**

## Owner priority
Complete the proof-derived winning strategy and playable legal-root coverage for KRK, not a first-move atlas or artificial Engine-tab opponent. **50/75-move and repetition-claim certification are deferred**, and mathematical mate must never be mislabelled FIDE-certified.

## Exact incoming state
- KRK11 staging: `krk11-history-claims-audit` (draft PR #18), currently contains KRK12/13 and KRK14 continuation work via its stacked draft PR #21, once CI-tested and integrated.
- Prior KRK13 **full** first-move audit: **350,336 / 350,336** fresh ongoing legal strong-turn roots selected, no uncovered root, [CI #40941467989](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/40941467989). **DO NOT redo this as new work.**
- KRK14 adds `src/krk-tagged-strategy.js` (source-tagged first/second/continuing moves), `scripts/krk14-continuation-audit.mjs` (every first and second defender reply on specified roots; exact FEN failures), `scripts/krk14-mate-tree.mjs` (all-defender finite-root complete-game falsification; explicit caps), and weak-to-move rook capture/mate/stalemate/safe reply classification.
- On exact head `a55ad073982654f0dd9180d5f0043f708a92f6b1`, [CI #40972054825](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/40972054825) passed: 14,422/14,422 first and 84,796/84,796 second handoffs in the 2,048-triple prefix; 16,564/16,564 safe weak replies covered and 352 weak-root immediate rook captures. See `docs/KRK14_TAGGED_CONTINUATION.md`. New whole-tree checks have a separate head/CI; verify those before relying on them.
- Upstream Lean `krk11-prepared-wall-policy` @ `7cfd8462a9fd36c8e37250221ee809b5b8287836` passed axioms/Lean [#40936122548](https://github.com/jfairfaxball-348/engame-chess/actions/runs/40936122548). Relevant `formal/EndgameChess/Rules/KRKForcing/{SafeSetup,OffRankSetup,SameRankSetup}.lean`. Main upstream remains independent/read-only until new Lean proof work is isolated.

## Required execution, in order
1. Read the latest KRK14 **mate tree** result in PR #21 and reproduce any exact failing FEN/variation. Separate real unsupported source phase from insufficient node cap. Do not silently select another move.
2. Extend the all-reply full-game audit to stratified samples across `prepared-wall`, `direct-entry`, `two-step-setup`, both colours and all frames. Record the precise first failing continuation, phase token, FEN and lemma. Do NOT claim that a passing sampled tree is a universal theorem.
3. In fresh importing Lean source, formalise **the actual deterministic tagged selector** and a single global well-founded lexicographic rank over first setup, prepared descent, central path, and terminal mate. Check every defensive reply and show rank descent, from every legal strong-turn root. Reconcile source proof/translation mismatches, without altering existing formal theorem files.
4. Prove and port the complete weak-to-move classification: mate; stalemate; rook capture to KK draw; or every safe weak reply reaches the strong-turn theorem. Never play for the weak side.
5. When the exact global source policy is truly complete, verify all-root legal board continuity, independent JS-to-Lean action agreement, real mate traces, no engine fallback, UI Maths/Engine isolation, source/blob locks, Node/browser/build CI and upstream Lean/axiom checks. ONLY THEN consider enabling a clearly marked **mathematical KRK play** mode, keeping FIDE clock/history caveat visible.
6. Commit, run CI on exact head, strictly fast-forward staged changes. Do not merge incomplete game policy to `main` or claim Cloudflare/Vercel deployment; release flags remain false until actual global verification and owner approval.

If the complete proof still has a genuine missing subcase, leave a substantive tested improvement and exact counterexample/proof obligation, never an invented move or documentation-only replacement for code.
