# KQK01 — Playable experimental queen-versus-king Maths opponent

**NEXT EXECUTION SESSION — OWNER'S WORKING PLAYGROUND PRIORITY.**

## Why the focus changed
The owner explicitly wants a playable Playground quickly and has deferred strict 50/75-move history parity and full formal verification of each **JavaScript** selector. The KRK16 implementation introduces labelled experimental KRK Start from exact user positions with a local source-tagged opponent and no engine/tablebase fallback. See `docs/KRK16_PLAYABLE_BETA.md`. Keep the certified release flags and true theoretical claims distinct. Do NOT return to months of preliminary KRK root audits before progressing the available material classes.

## Upstream facts
- `engame-chess` has **finished and frozen KRK and KQK fresh WDL50 outcome proofs**.
- KQK `EC-T0050` is frozen at `c72365a8ba46f59114a2a77d9d38993f6a52df80`, with a 97/98-ply sufficient theorem and constructive geometric strategy in `formal/EndgameChess/Rules/KQK/`. Read `theorems/frozen/EC-T0050/v1.md`, `proofs/KQK_STRATEGY.md`, `docs/KQK_COMPLETION.md`.
- KPK's proof is incomplete. Do not show pawns as playable or certify their outcome until the research repo completes them.

## Mission: working playable KQK, not another audit-only phase
1. Preserve KRK16's already playable Maths KRK, exact arranged boards, honest experimental marker, source policy tags, undo, rook capture-to-KK and Engine tab. Ensure KRK beta's exact-head CI and actual deployment status are checked.
2. Add queen geometry to the standalone `src/chess.js` move/attack rules and to Maths tray/material classification. Include legal setup, queen safety, capture-to-KK, both colours and checkmate/stalemate. Use frozen KQK theorem solely for *material outcome classification*.
3. Build the shortest clear, deterministic **source-derived** KQK attacker from the published constructive KQK geometric rules. Pin theorem/source SHA. Keep no engine/Stockfish/Lozza, tablebase, minimax or arbitrary first-legal fallback in Maths; when incomplete, show explicit source-policy limitation rather than pretending global proof.
4. Enable labelled **experimental KQK Start** from a user-arranged legal root. Keep full formal selector/FIDE history certification as a separate research-quality upgrade; don't falsely claim all-defender global guarantees.
5. Node tests + browser tests for legal queen moves, checkmates, exposed queen captures, both colours, exact start and undo. Run `npm test`, `npm run check`, `npm run build`, source locks, browser QA and peer CI. Commit the exact tested head; merge only verified changes, leave the Engine tab isolated.
6. If source policy truly cannot be implemented from the published constructors in a single session, deliver the playable supported subset and precise blocker **without changing the rules of Maths mode**. Do not substitute Stockfish or another chess engine.

## Next after KQK
Keep KPK interface provisionally disabled until upstream frozen completion. When available, import as a separately labelled beta with promotion rules and clear capture/deadness behaviour.

**Measure success by real legally playable games, not by more diagnostic statistics.**
