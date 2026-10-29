# KQK03 — downstream import readiness, NOT a gameplay release

**Snapshot: 29 October 2026. Parent `engame-chess/main` = `8ba4e9798a8f5f196580ddcf3325444017d19454`.** This is preparatory engineering, not an owner assertion of KQK completion. First close the KRK02 policy-release gap in [KRK02 exact blocker](KRK02_EXACT_BLOCKER.md).

## What the parent has actually proved at the snapshot

The ongoing KQK proof is not yet a **frozen, class-wide fresh-WDL50 release** or a total coordinate-to-action executable player. Do not promote it based on promising partial geometry, KQK's intuitive simplicity, or a completed KRK outcome theorem.

| Present parent declaration (all relative to `formal/EndgameChess/Rules/KQK/`) | Relevant scope; not a global selector |
| --- | --- |
| `Basic.lean`, `Moves.lean`, `Geometry.lean` | Queen-square attack/legality interface; diagonal and orthogonal lines and blockers |
| `Complete.lean`: `strong_reply` | Exhaustive *shape* of an arbitrary legal strong move (king or queen); no strategy choice |
| `CaptureBoundary.lean`: `no_weak_force`, `unsafe_weak_no_forcing` | Weak-side no-force and unsafe-queen drawing boundary under stated assumptions |
| `ShadowForce.lean`: `shadow_weak_bound`, `shadow_weak_fifty_two`, `shadow_strong_bound` | Forced mate within 52/53 plies on **Shadow** geometry; does not cover arbitrary roots |
| `Setup.lean`: `vertical_shadow_entry`, `horizontal_alignment_entry`, `blocked_file_entry_bound` | Additional region-limited entry and all-defence proofs (53/55 bounds), with explicit geometric premises |
| `Edge.lean`, `EdgeEntry.lean`, `Prison.lean`, `Staircase.lean`, `Band*.lean` | Edge confinement, protected corridor and band/wall cases with local premises |

All links must be pinned to the **exact** audited commit (not mutable main) when imported. The [upstream KQK plan](https://github.com/jfairfaxball-348/engame-chess/blob/8ba4e9798a8f5f196580ddcf3325444017d19454/docs/KQK_PLAN.md) is a **plan**, not a theorem or release certificate. No KQK `EC-T...` frozen theorem/version was found in the inspected parent tree.

## Required mathematical release gate

1. Parent freezes a full both-colours, both-turns, legal **fresh clock = 0, no incoming history** KQK outcome classification and strict under-100-ply forced-mate bound; record theorem IDs, source SHA, ledger version, axiom report and successful builds. A queen may be captured to dead KK; a stalemate is a draw. In a weak-turn winning root the queen must be safe and the weak king have a reply (unless already mated).
2. Parent supplies or certifies a **total deterministic executable selector** with proof of legality, all-defender response closure, termination and carried progress budget. Existing `MateWithin` lemmas are not automatically executable. Verify how `Classical.choose` is eliminated.
3. Derive a new KQK lock: exact independent frozen theorem SHA, source paths and per-file Git-blob hashes; fail closed on any mismatch. No live parent or GitHub calls at gameplay runtime.
4. Add separate JavaScript `src/kqk-...` geometry and choice policy with documented bijections to the actual Lean constructors. All decisions carry phase, lemma, premises, rank/budget and chosen coordinate. No Stockfish, retrograde state atlas, precomputed tablebase, or KRK rook-policy fallback.
5. Implement queen diagonal rays, interposed blockers and protected-queen cases. A rook-like rank/file cut need not remain safe under queen-specific checks, escape-square geometry and stalemate. Track exact squares set by the player, strong colour, initial side to move and history.

## Engineering checklist after proof freeze

- Extend `SUPPORTED`/piece tray availability and `materialOf` **only when approved**, retaining exactly two kings and one queen. Queen is currently dark/unavailable.
- Extend `src/chess.js` independent local rules for legal queen moves, attacked squares, blocked diagonals, check, stalemate, weak king taking the queen (transition to KK), and move-history keys. Never import `chess.js` npm or arena engine state into Maths; the separate Engine Playground may continue using its existing library.
- Extend `setupVerdict` for exact fresh KQK classification; ensure terminal root and wrong-turn legality are rejected. Do not offer Start unless `MATERIAL.kqk.playable` and verified local `KQKChooseMove` are both authorised.
- Reuse abstract square/isometry utilities and proof panel styling only where queen attack preservation is proved. The KRK four-frame transport and rook-safety lemmas are not automatically queen sound.
- Test both colours/turns, every board orientation, king/queen adjacency, attacked queen, legal queen capture, stalemate, mate-in-one, direct check, interposed strong king, corner and side corridors, promotion-like later KPK transition (future only), 50/75-move and 3/5 repetition, undo/restart and all defender branches. Test at mobile and desktop browser viewports.
- New runtime policy must not reset history or halfmove, rely on an arbitrary legal first move, or represent any nonoptimal bound as exact mate distance.
- Run Node tests, syntax, source-lock verification, build, Maths + Engine browser regressions and a new complete KQK browser playthrough before non-draft review, merge and production deployment.
- Record **one independent owner approval** after the parent freeze. Do not silently auto-sync material classes.

## Ordering

**KRK02 completion first; KQK03 is staged second.** The separate Engine S011 research workshop remains deferred in [ENGINE_S011_DEFERRED.md](ENGINE_S011_DEFERRED.md). Neither material-class gate depends on any third-party engine.
