# S021 — KQK whole-game source continuation closure and honest release audit

**Next execution session, installed after S020.**

## Binding purpose

Deliver a substantially more playable **Maths** KQK opponent from exact
user-arranged legal positions by translating the existing frozen
`jfairfaxball-348/engame-chess` theorem (EC-T0050 v1,
SHA `c72365a8ba46f59114a2a77d9d38993f6a52df80`), not by
inventing a new policy. KRK remains experimental. **Never remove the
full board-specific KK, KBK, KNK mathematical equations, workings,
proof steps and Lean links in setup or play.** Preserve independent
Engines tab. Do not start KPK until KQK is substantially usable.

Owner deliberately defers strict 50/75-move and history parity. Do not
let clock/history questions dominate this session. Be transparent that
the KQK and KRK JavaScript selectors are not Lean-certified or global.

## Baseline from S020

- S019 source-tagged EdgeForce, ShadowForce, BandEntry/BandProgress,
  BandRaise, RankFive and KnightPrison remain.
- S020 adds source-conditional SameRankEntry positive/backrank, escaped
  FarFilePreparation (file 0/1), direct EntryGeometry and OrientedEntry
  first walls, and TightEntry king-approach with bound `tight-file`
  protected-queen continuation.
- `test/kqk20-entry-source.test.js` exercises both colours, frame
  invariance, legal source steps and immediate replies.
- `npm run audit:kqk-roots` (fixed seed, bounded) reports **separately**
  sampled legal root selection, immediate defender continuation and
  full first-reply game completion. It is an audit, never a live policy.
  See `docs/KQK20_ENTRY_AND_AUDIT.md` for exact scope and gaps.

## Execute

1. Confirm latest `main` / CI and determine the actual production
   Cloudflare Workers URL from reliable deployment evidence. Vercel
   daily rate limiting is not a code failure; do not manufacture a URL.
2. Run the reproducible S020 KQK coverage audit, recording counts and
   examples by source family. **Measure end-to-end checkmate and
   defender branch coverage**, not only first-move availability.
3. Falsify source-continuation completeness with bounded,
   root-stratified, **all legal weak-reply** game trees and strict
   terminal-kind checks. Distinguish `unsupported`, `stalemate`,
   `capture-to-KK`, `mate`, `cycle`, and cap.
4. Implement actual missing `FarFileEntry` /
   `OrientedEntry` / `SameRankEntry` /
   `TightEntry` source cases and exact chained continuations,
   respecting all proof premises, weak escape witnesses and corner
   exceptions. Never substitute an unsourced move, scoring heuristic,
   precomputed tablebase, minimax, imported engine, or "first legal" fallback
   in the **live Maths opponent**.
5. Test exact user placements, weak-to-move starts, captured-queen-to-KK,
   all eight isometries, both colours, Undo and every immediate defender
   reply, including checked weak kings and stalemate threats.
6. Run `npm test`, `npm run check`, `npm run build`,
   `npm run verify:krk-sources`, `npm run audit:kqk-roots`,
   and both Chromium browser QA suites. Use exact-head CI,
   commit to a branch, PR and **fast-forward merge** only on success.
   Install the subsequent specific prompt with measured remaining gaps.

**Success criterion:** a demonstrably greater fraction of legal,
user-arranged fresh KQK roots can complete actual lawful checkmates
across *all* defender replies. Report exact empirical denominator,
depth/caps, and counterexamples. Never call this fully certified merely
because tests pass.
