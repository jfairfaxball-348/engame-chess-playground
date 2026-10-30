# S019 — Expand proof-derived KQK strategy coverage

**NEXT EXECUTION SESSION — installed following S018.**

## Binding direction

The Chess Maths Playground is a live demonstration of the strategies developed in the separate `engame-chess` Lean project. It does not discover new mathematics, run Stockfish/Lozza/Syzygy or look up tablebases. No invented minimax, first-legal, heuristic or atlas fallback is permitted.

**Preserve the old detailed mathematical workings for KK/KBK/KNK**, including positional equations, calculations, proof steps and Lean theorem links in both setup and play. This is a permanent material-specific feature. KRK and KQK may remain compact, board-first demonstrations. The 50/75-move clock/history exactness is deliberately deferred.

## Incoming S018

- KQK now has local queen attacks, legal moves, terminal chess rules, original-square setup, two colours, explicit first opponent move, source-token undo, and queen-capture-to-KK.
- The outcome panel imports frozen `EC-T0050` from `engame-chess`, proof-source SHA `c72365a8ba46f59114a2a77d9d38993f6a52df80`.
- `src/kqk-source-policy.js` is a **partial and honest** controller implementing `Edge/EdgeForce` corner corridor and `ShadowForce/ShadowExit` copying/finishing through the eight proven symmetries. A missing case visibly refuses play. `MATERIAL.kqk.playable=false` keeps global certified gameplay gated.
- KRK beta remains isolated, KK/KBK/KNK retain their full worked proofs. Tests in `test/kqk18-experimental-play.test.js` and `scripts/browser-qa.mjs`; source and scope recorded in `docs/KQK18_PLAYABLE_BETA.md` and `proof-sources/kqk.lock.json`.

## Execution mission

1. Inspect current exact `main`, confirm S018 CI, verify browser game behaviour, `npm test`, `npm run check`, `npm run build`, `npm run verify:krk-sources`, and both browser suites.
2. Expand the runnable KQK controller from source-proved geometric constructions `StrongEntry`, `EntryFrames`, `SameRankEntry`, `FarFileEntry`, `OrientedEntry`, `BandForce`, `BandEntry`, `TightEntry`, `ClearWallEntry` at the pinned source SHA. Translate explicit phase premises and transitions, not only class outcome/existence.
3. Test adversarial *every weak reply* from newly covered root families, colour symmetry and all eight orientations, and full legal continuations ending in checkmate. Also quantify supported legal fresh winning roots and fail-closed unsupported roots without pretending these samples constitute a mathematical proof.
4. Keep the editor simple. Don't rework the old worked draw explanations, widen the UI into long KRK/KQK theorem displays, touch the independent Engine Playground, or start KPK prematurely.
5. Commit and verify exact-head Node/Chromium CI; fast-forward merge to `main` only on success. Verify Cloudflare deployment state separately; keep `wrangler.jsonc` unchanged.

**Primary success metric:** substantially more *actual user-arranged KQK positions* complete lawful games against the source-derived queen-side opponent, not more paragraphs of status documentation.
