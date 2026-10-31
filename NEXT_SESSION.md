# S036 — cross-phase constructive closure for KRK and KQK

**Execution: implement, test, commit, merge, verify, install S037.**
Only edit `jfairfaxball-348/engame-chess-playground`.
Parent `jfairfaxball-348/engame-chess` is **READ ONLY**.

Read AGENTS.md, docs/S033_SOURCE_CORRESPONDENCE.md,
docs/S034_REACHABILITY_RANK.md, docs/S035_SOURCE_BRIDGES.md,
scripts/s035-source-bridges.mjs and the preceding merged PR.

## Owner's order is binding

Stage A first: BOTH KRK and KQK must demonstrate actual complete
source-derived mating play from every legal user-arranged position
versus every legal lone-king reply. Preserve exact starting squares,
both colours, legal turns, capture-to-KK, undo/reset and existing
KK/KNK/KBK fully worked maths panels. No engine, tablebase, minimax,
guessed rank or first-legal fallback. Source gaps fail visibly closed.
`MATERIAL.krk.playable` / `MATERIAL.kqk.playable` remain false for
uncertified universal selectors.

Immediately after BOTH Stage A controllers are complete: Stage B
full board-specific equations, derivations, move-proof provenance and
verified FIDE 50/75-move/repetition/history parity for BOTH KRK and
KQK, without affecting KK/KBK/KNK. KPK and Engine research are
not to displace this order.

Immutable source: EC-T0050 at
`c72365a8ba46f59114a2a77d9d38993f6a52df80`;
EC-T0048 at `2311abe71bc1a4eed47026feccd5ba5a0760d5bb`;
KRK sourceCommit `e7de0930fc61caeb11795cf3c10fde11e4774a40`.

## Concrete next S036 tasks

1. Run `npm run audit:s035-source-bridges -- --strict`, inspect
   `sourceRules`, all separately authenticated direct/switch cases,
   `alreadyFarTight` follow-on outcomes and the KRK prep source
   handoff report. Preserve real prior source tokens.
2. KQK: implement/validate the ORIGINAL-frame constructive first
   action for genuine separating-rank, direct-small-file,
   horizontal-far-wall and already-far-file tight-above roots. Do not
   treat a switched-frame source as the original theorem.
   Authenticate each chosen frozen theorem's premises and target
   independently; extend real all-reply continuations beyond two
   defender layers and seek complete-to-mate source lines. Source
   small-file `clear_low_wall_entry` and tight `tight_king_step`
   checks now exist; reuse rather than re-label as total strategies.
   Broaden legal-root strata with a reproducible seed and exact caps.
3. KRK: use S035 authentic setup→prep strict rank witnesses, then
   locate the FIRST unproved central/restoration source **phase transfer**.
   Isolate an exact (board, incoming token, selected move, legal weak
   reply, new token) counterexample to a candidate source-justified
   strict rank. Read frozen KRKExecutable/KRKCentral sources;
   do not invent a global rank from bounded local progress.
4. Run `npm test`, `npm run verify:krk-sources`,
   all pre-existing KRK and KQK root/phase/source/cycle/complete-line
   audits, `npm run check`, `npm run build`, and both Chromium
   suites in PR-head Actions. Separate mate-closed, capped,
   unsupported and truly failing branches. Compare same seed/caps for
   monotone vs exact KQK caching.
5. Commit branch, PR-head CI, merge/fast-forward if green, merged-main
   CI, precise documentation, and install S037. Do not equate
   green GitHub CI with independent Cloudflare deployment verification.

Do not mistake a two-reply finite sample, local rank decrease, or
a Lean existence theorem for universal complete-game JS certification.
