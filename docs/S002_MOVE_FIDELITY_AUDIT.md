# S002 — Move-selection fidelity and no-external-engine audit (2026-10-19)

## Verdict

**No Stockfish, Syzygy, downloaded per-position answers, engine service, pretrained chess policy or prebuilt engine overlay was found in the execution path.** The static app has no npm dependencies and operates locally in the browser. That alone does **not** establish mathematical fidelity.

**Before S002:** `src/engine.js` used geometric weights and shallow minimax for KRK without extracting a concrete move from the mathematics. Its comment and README acknowledged this. The three dead classes also used a scoring heuristic even though arbitrary legal movement was enough.

**After S002:** the decision path is `src/app.js → chooseDecision → chooseProofPattern → (if null) labelled experimental minimax`. A decision includes its rule, explanation and an origin: `dead-position-choice`, `proof-pattern` or `experimental-heuristic`. The UI shows the latest engine decision and exposes fallback honesty. The old `chooseMove` API delegates to the new decision API. The parent research repo was read only.

## Immutable mathematical source reviewed

- [EC-T0019 frozen statement](https://github.com/jfairfaxball-348/engame-chess/blob/4acc3e8638a916f329788d4c2b5f0db6f2c9bf67/theorems/frozen/EC-T0019/v1.md), exact frozen proof-source `4acc3e8638a916f329788d4c2b5f0db6f2c9bf67`.
- [Standalone geometric paper](https://github.com/jfairfaxball-348/engame-chess/blob/4acc3e8638a916f329788d4c2b5f0db6f2c9bf67/proofs/EC-C019_C021_KRK_SAFE_SETUP.md).
- [ClearEntry.lean](https://github.com/jfairfaxball-348/engame-chess/blob/4acc3e8638a916f329788d4c2b5f0db6f2c9bf67/formal/EndgameChess/Rules/KRKForcing/ClearEntry.lean), [OffRankSetup.lean](https://github.com/jfairfaxball-348/engame-chess/blob/4acc3e8638a916f329788d4c2b5f0db6f2c9bf67/formal/EndgameChess/Rules/KRKForcing/OffRankSetup.lean), [SameRankSetup.lean](https://github.com/jfairfaxball-348/engame-chess/blob/4acc3e8638a916f329788d4c2b5f0db6f2c9bf67/formal/EndgameChess/Rules/KRKForcing/SameRankSetup.lean).
- [WallForce.lean](https://github.com/jfairfaxball-348/engame-chess/blob/4acc3e8638a916f329788d4c2b5f0db6f2c9bf67/formal/EndgameChess/Rules/KRKForcing/WallForce.lean), [WallActions.lean](https://github.com/jfairfaxball-348/engame-chess/blob/4acc3e8638a916f329788d4c2b5f0db6f2c9bf67/formal/EndgameChess/Rules/KRKForcing/WallActions.lean), [RankAdvanceRescue.lean](https://github.com/jfairfaxball-348/engame-chess/blob/4acc3e8638a916f329788d4c2b5f0db6f2c9bf67/formal/EndgameChess/Rules/KRKForcing/RankAdvanceRescue.lean), [LowerPursuit.lean](https://github.com/jfairfaxball-348/engame-chess/blob/4acc3e8638a916f329788d4c2b5f0db6f2c9bf67/formal/EndgameChess/Rules/KRKForcing/LowerPursuit.lean).

The frozen theorem proves clock-free named-colour forced mate for exact strong-turn KRK under its hypotheses, and classifies weak-turn obstruction by mate/nonempty replies/captures. It does **not** expose a directly executable total selector or certify JavaScript. Our `proof-pattern` label means a locally implemented *first move appearing in a constructive proof branch*, with runtime guards; it does not mean the remaining reply tree is implemented or verified.

## Concrete policy and audit mapping

| Playground route | Source mathematical content | Guard/limitation |
| --- | --- | --- |
| K/K+B/K+N | EC-T0003/4/5 dead position | First legal move; ordinary FIDE immediate dead-position ending is intentionally suspended for exploration. |
| Weak-side KxR | EC-T0019 weak-turn capture obstruction / EC-T0003 after capture | If legal, take the unprotected rook and leave K vs K, preventing a forced KRK mate. |
| KRK instant mate | EC-T0008 finite-rank terminal case | Detect legal checkmate and choose it. |
| `krk_clear_vertical_entry_force` | ClearEntry | Signed/swap/anti-diagonal frame; 2-rank king gap, 2-file rook margin, king not blocking rook path; rook enters separating rank. |
| `krk_same_rank_retreat_force`, `krk_backrank_*_force` | SameRankSetup | Source geometric hypotheses, retreat/protected rook entry. |
| `krk_offrank_setup_force` | OffRankSetup | Off-wall rook with insufficient file margin moves to source-defined far file. |
| `krk_wall_rook_move` | WallActions and WallForce | Strict separating wall; rook moves to far file before continuing. |
| `krk_rank_advance_rescue` | RankAdvanceRescue | Upper band with at least two-file margin; next defender reply may require rook rescue. |
| `krk_rank_wall_force / lower-band catch` | WallForce | Low band and king-rook rank gap at least two; king closes that gap. |
| `krk_pursuit_king_move`, tempo | LowerPursuit / WallActions | Selected guarded lower-band branches; not the entire nested-induction algorithm. |
| Unmatched KRK turns | `src/engine.js` | **Experimental geometric minimax**: local, no engine or lookup, but not proof-selected. Shown as such to the player. |

All candidate moves are intersected with `legalMoves`; no branch may produce an illegal move. Local JS legality itself is NOT proven equivalent to the frozen Lean chess kernel. The four isometries follow the source proof's identity, rank reflection, axis swap and anti-diagonal symmetry cases; no runtime main-repo dependency exists.

## Runtime no-cheating controls

- `package.json`: no `dependencies` or `devDependencies`; Node only for local build/tests.
- `index.html`/app: internal `/src/` script and stylesheet; GitHub links are ordinary navigation only.
- `scripts/build.js`: copies the local `src/` tree to `dist/`; no downloaded assets or remote evaluation.
- `src/chess.js`: generates attack and legal-move geometry locally.
- `src/proof-policy.js`: locally encoded source-pinned constructions, no tablebase, no fetched proof at runtime.
- `src/engine.js`: local depth-two minimax is still used *only as a visible experimental fallback* for KRK.
- `test/chess.test.js`: asserts import/network/dependency boundaries and tests selected witness moves.

The search through current imported modules found no external chess engine, wasm engine, UCI pipe, network engine API or tablebase lookup. The no-dependency/forbidden-import regression is a safeguard against reintroducing one, not a full supply-chain security proof.

## Validation and limits

Source snapshots were loaded into an isolated JavaScript evaluator for a focused execution check of 10 representative decisions; all 10 passed, and the UI JavaScript parsed. In a deterministic 25,000-attempt geometric sample, 16,651 setups passed the playground validator; 16,556 strong-side turns used a labelled proof pattern, 95 used the experimental fallback, and **zero** selected proof-pattern moves left an immediately capturable rook or created stalemate. This is **diagnostic sampling, not formal certification**, nor a demonstration that mate is ultimately forced against all future replies. A Node test/build workflow was installed; its hosted result must be checked separately.

Important outstanding gaps: extract the whole S029 lower-band forcing tree and bounded rook-rescue continuation; treat all defence replies, including claimable draws, exactly; check colour/orientation and arbitrary flags against kernel semantics; prove a JavaScript or executable-policy refinement of the Lean strategy; account for real FIDE history, repetition, clock and dead-position termination; distinguish locally legal boards from initial-position-reachable histories. **Never relabel a fallback minimax decision as proof-guided, or claim that a source theorem verifies a separate implementation.**

## Session disposition

This was a targeted move-provenance audit and a partial constructive implementation, not an independent proof of a total KRK algorithm. Parent endgame-chess theorem ledgers, sources and installed sessions remain untouched. S003 is installed to close the explicit selector and correspondence gaps.
