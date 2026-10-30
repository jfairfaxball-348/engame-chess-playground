# S020 — Complete source-derived KQK entry and full-game adversarial coverage

**Next execution session, installed following S019.**

## Binding direction

Chess Maths Playground demonstrates the *separate engame-chess Lean
project's constructed strategies* as a playable opponent. Do not invent
new mathematics in the Playground, call Stockfish/Lozza/tablebases/minimax,
add arbitrary first-legal moves, or use a move atlas as a substitute.
The 50/75-move full history parity is deliberately deferred.

**Permanent regression constraint:** KK, KBK, KNK retain their original
board-dependent mathematical proof panels, equations, working and Lean
links in setup and play. KRK/KQK may remain compact, play-first, and
explicitly experimental. Do not modify the independent Engines tab.

## Incoming S019

- S018 edge/shadow KQK working, two colours, user-chosen exact start, Undo,
  captured-queen-to-KK and original mathematical proof restoration are
  preserved.
- `src/kqk-source-policy.js` now supports extra separating-rank king
  preparation, prepared king/file progression, guarded cross/rise,
  rank-five corner repair and knight-box cases from source SHA
  `c72365a8ba46f59114a2a77d9d38993f6a52df80`.
- Source proof references: BandEntry, BandProgress, BandForce, BandRaise,
  RankFive, KnightPrison, EntryFrames, StrongEntry.
- Crucial pitfall: `BandRaise.prepared_raise_bound` has a special
  queen-to-(5,5) corner branch when its queen is on rank four and the
  weak king at file seven. Never generalise the ordinary queen rise to
  that case; that led to a reproducible stalemate.
- Tests: `test/kqk19-band-source.test.js`; details:
  `docs/KQK19_BAND_EXTENSION.md`. The certified flag stays false.

## Execution mission

1. Verify exact current `main` / S019 CI and the *actual* production
   Cloudflare deployment independently; do not infer deployment from Git.
2. Quantify supported legal fresh KQK roots and complete defender-branch
   games under a reproducible, bounded, **diagnostic-only** corpus. Keep
   availability, legal-move correctness and game termination separate.
3. Implement the next missing *explicit, source-constructed* KQK phases,
   prioritising `SameRankEntry`, `FarFilePreparation`,
   `OrientedEntry` and `TightEntry`. Follow exact Lean premises and
   defender reply cases, including diagonal/check and stalemate exclusions.
   Build source-tagged continuations with tokens when needed.
4. Test both colours, eight symmetries, adversarial all-reply children
   and complete lines ending in actual checkmate. Fix failures instead
   of softening release flags or deleting counterexamples.
5. Run `npm test`, `npm run check`, `npm run build`,
   `npm run verify:krk-sources`, and both Chromium suites. Commit and
   PR/fast-forward merge only after exact-head CI success.
6. Preserve `wrangler.jsonc` and the Engines tab unchanged. Do not
   start KPK until the Playground's KQK is substantially playable.

**Primary metric:** greater fraction of **user-arranged legal KQK roots**
that actually complete lawful checkmates versus every legal defender
reply, rather than more documentation or JavaScript outcome assertions.
Be explicit about any still-incomplete root families.
