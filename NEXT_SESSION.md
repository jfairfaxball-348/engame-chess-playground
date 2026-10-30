# S027 — close actual source-controller gaps for KRK and KQK

**Execute.** Continue after S026. Source of truth for gameplay
rules is frozen `engame-chess`; edit only `engame-chess-playground`.
Follow AGENTS.md, with the binding two-stage owner priority:

1. Complete **both** KRK and KQK simplified/play-first, source-derived
   checkmating policies from every legal user arrangement against
   all legal defender responses. Do NOT substitute a chess engine,
   tablebase, minimax, arbitrary first-legal choice, generic heuristic
   or a fabricated mathematical proof. The existing experimental
   beta remains accessible and uncertified while incomplete.
2. **Immediately when both Stage A policies actually close**,
   restore full board-specific mathematical equations, calculations,
   Lean derivations and clock/history/terminal parity for **KRK and
   KQK**, preserving existing KK/KBK/KNK rich workings. No KPK,
   extra material class or Engines workshop until this parity work.

## Exact handoff

- S025 merged on main at `7543590248b4e3023dd40e70289dd60b22ad49ee`
  after successful PR-head CI 41094156645.
- Its identical-seed 12,000-attempt/4-family, 2,500-node,
  64-round KQK monotone diagnostic: 105/120 mate-closed,
  15 capped, 0 confirmed hard failures, 7,810 cross-depth
  closed-subtree reuses. Largest cap families WeakToMove 4/8,
  FarFilePreparation 4/8, SameRankEntry 3/8.
- KRK 24/24 capped and 0 observed confirmed failures at 2,500
  nodes. This is **inconclusive**, not evidence of complete
  correctness nor of a particular source defect.
- S026 `docs/KQK26_BACKRANK_CONTINUATION.md`: translated the
  missing `SameRankEntry.backrank_entry` / `protected_backrank_entry`
  two-ply all-weak-reply composition, carrying a one-reply
  `backrank-protected` source token and testing both colours,
  board symmetries, token rejection and all replies.
- Frozen Lean KQK source SHA
  `c72365a8ba46f59114a2a77d9d38993f6a52df80`
  (read-only); inspect specifically `formal/EndgameChess/Rules/KQK/`
  before any source-policy patch.
- Check the exact final S026 CI and main commit before quoting any
  post-S025 diagnostic metrics; never reuse PR-head numbers as
  merged-head certification.

## Execute next

1. Confirm merged main and exact CI, reproduce fixed-seed KQK
   audits with `--cache=exact` and `--cache=monotone`, including
   `--attempts=12000 --per-family=4 --nodes=2500 --rounds=64`.
   Compare same roots/families, not just different sample counts.
2. **Focus on actual controller decisions**, not building another
   audit framework. Replay first KQK capped path from S025:
   strong White K=48 Q=32, weak Black K=35, Black to move;
   defender 35-28, source 48-40, defender 28-29,
   source 40-41, defender 29-30, source 41-42,
   defender 30-22, source 42-43, defender 22-21,
   source 43-44, defender 21-12; first capped state
   White to move K=44 Q=32 weak K=12, token=null.
   Determine whether this is genuinely only resource exhaustion
   or source-branch loss by tracing the **full** exact defender
   siblings, not guessing from the first cap. If only capped,
   do NOT invent a move-policy fix.
3. Prioritise remaining FarFilePreparation and SameRankEntry cap
   families, especially one-reply source commitments, tight
   proof premises and rank-five terminal cases. Use exact frozen
   source-defined actions, both colours and eight frames, with
   all legal weak replies.
4. For KRK investigate 24/24 node caps in the frozen constructive
   phase trees, derive only an actual source-supported phase rank
   or valid all-reply continuation, and distinguish history-distinct
   structural revisits. No clock-blind proof claim.
5. Run Node tests, source locks, syntax, build and Chromium QA:
   exact arranged starting position, attacker/defender turn,
   legal replies, capture-to-KK, checkmate/stalemate, Undo/Restart,
   and rich KK/KNK/KBK maths panels. Engines must remain isolated.
6. Commit, PR, test exact head, merge, verify main fast-forward,
   check Cloudflare production separately and install S028 with
   precise unresolved cases. If and only if both controllers have
   actual all-branch closure, start Stage B **immediately within
   this session**. Treat FIDE 50/75-move parity as deferred until
   source-backed mathematical strategy closure, without silently
   claiming already complete.

Owner's goal: working showcase of frozen winning/drawing
mathematics, not endless formal-audit engineering.
