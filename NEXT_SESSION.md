# S018 — Preserve restored mathematical workings; build playable KQK

**NEXT EXECUTION SESSION — INSTALLED, NOT YET EXECUTED.**

## Owner instruction — overriding product direction (30 October 2026)

The Maths Playground has **two equally valid experiences**, not one universal presentation:
1. **K vs K, K+B vs K, K+N vs K** have a pre-existing and valued detailed mathematical explanation. **Preserve every aspect**: computed board-specific mathematical working, outcome equation, full logical proof steps, theorem reference and direct source link, all shown in setup and during play. The newly restored `drawProofMarkup` and `src/maths-proof.js` already implement this; do not remove or collapse it again. Preserve previous title "Guaranteed draw" for these classes.
2. **KRK and KQK** can use the temporarily simplified, **play-first** presentation. The owner is principally interested in watching the proof-derived strategies play, not a lengthy WDL proof rendered on screen. Keep KRK beta intact. Building full KRK/KQK explanation panels is not a release priority.

**Do not undo previous feature work to serve a new presentation preference.** Condition presentation by material, rather than deleting features.

## Verified incoming state

- `src/maths-app.js`: full KK/KBK/KNK explanation restored from existing `proofFor`, including equation, current-board working, all steps and Lean link; KRK still uses compact label and experimental notice.
- `test/maths-proof.test.js` and `scripts/browser-qa.mjs`: new regressions for full dynamic equations and the worked proofs (check their exact head and CI before asserting completion).
- KRK16 is already merged to `main` at `80e3799469f58af472610181e89f7e658b8b1dab`, with locally source-derived experimental play. The fully certified controller and strict FIDE 50/75/repetition history are deliberately deferred. No tablebase, Stockfish, arbitrary first-legal KRK attack, minimax or other engine in Maths.
- `endgame-chess` has **frozen KQK outcome proof EC-T0050**, Lean source `c72365a8ba46f59114a2a77d9d38993f6a52df80`, with 97/98-ply winning-existence bounds. The existence result does **not itself** supply a runnable deterministic queen controller. Read `theorems/frozen/EC-T0050/v1.md`, `proofs/KQK_STRATEGY.md`, `docs/KQK_COMPLETION.md`, and constructive modules in `formal/EndgameChess/Rules/KQK/` to extract actual move rules. Upstream KPK is still incomplete and must not be shown as solved.

## Mission — EXECUTE KQK playable beta, with restored old proofs protected

1. **Regression first**: confirm KK/KBK/KNK still show the original detailed mathematical working on exact user-arranged positions, both colours and either turn. Verify equations, chess/FIDE-rule derivation, computed distance or square parity and source links on setup and during moves. Preserve controls, legal-move UX and original placement. Fix tests if the restoration has any regression; never eliminate these explanations for the sake of KRK/KQK.
2. **Queen rules**: implement Q = rook rays + bishop diagonals in the independent Maths `src/chess.js`, including attack geometry, legal moves, check/checkmate/stalemate, positions with both kings and one queen, exposed-queen captures to the already playable KK draw, colour symmetry and exact source starting squares. Allow queen in the placement tray *only* for a valid KQK material root; pawns remain dim.
3. **Mathematical source**: import KQK's *frozen fresh-WDL outcome classification* from EC-T0050, without claiming the actual JS move algorithm has been Lean-verified. Pin source SHA/rules. Extract an auditable independent **source-derived constructive queen-side move selector**, with explicit phase/continuation data if needed, from the actual published constructive geometry. No external engine, Stockfish/Lozza, tablebase, minimax, manual FEN atlas, arbitrary first-legal fallback or runtime upstream requests for Maths attack.
4. **Playable UX**: enable labelled experimental KQK Start from the user's actual legal board; human controls lone king as in KRK, with both attacking colours and chosen initial side. Maintain first-move opt-in, click/drag play, undo restoring controller state, queen capture turning into KK, fully lawful game terminal states and clear fail-closed notice on unsupported source phase. Show a compact material label + honest experimental policy notice; **do not replace the restored KK/KBK/KNK explanation panels**.
5. **Verification**: `npm test`, `npm run check`, `npm run build`, frozen KRK proof source verification, browser Maths tests and isolated Engine browser QA. Add tests of KQK exact placement, both colours, geometric attack legality, checkmates, exposed queen captures, controller handoffs and failure modes. Distinguish empirical legal games from mathematical global proof. Follow actual CI for the exact commit.
6. Commit, integrate by strict fast-forward if possible, merge to production `main` only after exact-head CI and browser QA pass, preserve `wrangler.jsonc` Cloudflare Workers configuration, and verify actual deployment state rather than assuming the production URL updated. Install a genuinely necessary next session only after real implementation work.

### Acceptance
- All three **previously released draw classes retain full positional proof/equation/working**.
- KRK existing experimental strategy untouched, Maths and Engine completely isolated.
- **KQK user-configured positions can actually be played** against a mathematically sourced queen-side strategy. Label incomplete controller coverage honestly, if still partial.
- No new 50-move history-parity requirements. KPK waits for upstream proof completion.

**Do the code and real chess games; avoid turning this into an audit-only or proof-display redesign session.**
