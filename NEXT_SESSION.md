# KRK06 — Execute central-wall to exit, then global source-derived KRK policy

**NEXT SESSION — INSTALLED, NOT EXECUTED.**

## Mission

Finish the *actual* theorem-derived King + Rook versus King opponent for the
Maths tab. Work in the parent proof repo on isolated importing proof branches
when additional mathematics is needed; translate only exact successful
proven Lean declarations into the independent Playground. No more standalone
diagnostics in lieu of a total policy. Do not invent a heuristic or turn on
release flags before the complete proof and FIDE semantics.

## Verified incoming state (29 October 2026)

- Playground draft [KRK05 PR #12](https://github.com/jfairfaxball-348/engame-chess-playground/pull/12),
  branch `krk05-restoration-first-pair`, now includes
  `src/krk-restoration-first.js`,
  `src/krk-restoration-centre.js` and
  `src/krk-restoration-chain.js`.
- Commit `c3a456febfb9743b3f6612138135d92f1418bda9`
  connects the exact far-rook rescue, king catch-up and central alignment
  constructors and verifies every defending reply through a maximum of three
  pairs (six plies) to the **central-wall premise**, not to checkmate.
  [Exact-head CI #40915307300](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/40915307300)
  passed Node, provenance, coverage, syntax, build and both Chromium suites.
- Source [upstream draft PR #7](https://github.com/jfairfaxball-348/engame-chess/pull/7)
  head `b4690afeb85f315c94164cfd1d43b9435948eb2b`
  has green Lean and axiom CI
  [#40908371875](https://github.com/jfairfaxball-348/engame-chess/actions/runs/40908371875).
  The stacked parent PRs #4/#5 and #7 are not merged to proof main.
  Frozen main source lock remains immutable.
- `KRK_GAMEPLAY_RELEASED=false`, `MATERIAL.krk.playable=false`.
  Maths KRK Start is **not** enabled. Existing K/K, KBK, KNK and separate Engine
  Playground still function. The Vercel deployment quota is not a code blocker;
  Cloudflare Workers config is present, but production must be independently
  confirmed at a live URL before any deployment claim.

## Immediate next proof obligation

The exact endpoint from the new bounded restoration chain is a strong-to-move
**central close wall**: in a Lean frame, `K.y+1=R.y<k.y`,
`K.x ∈ {3,4}`. This is the input to
`formal/EndgameChess/Rules/KRKCentral/Central.lean`'s `central_bound`.
That theorem constructs a result using `positive_bound`, `wait_even_bound`
and `ExitBound`, but it does not provide a global coordinate-level playing
algorithm.

1. Inspect `Central.lean`, `Positive.lean`, `WaitEven.lean`, aligned
   repair, `ExitBound`, column/guarded/box phases and all upstream extraction
   PRs. Identify the exact missing first action and the all-defender recursive
   successor for **every** central case (strong king left, right, aligned,
   margin-deficient).
2. Add importing Lean code on an isolated parent proof branch: explicit
   destinations, legality, quantified defender replies, next-phase partition
   and a strictly decreasing global measure toward actual mate. Include
   remaining non-wall setup and all starting legal KRK states, both colours,
   both turns and all symmetry frames. Run `lake build` and exact-head axiom
   reports; preserve KQK/KPK and frozen source files.
3. Port *only* verified new constructors into local JS with immutable source
   SHA/blob links. Extend chain coverage all the way to actual mate, not a
   handoff; use original arranged board/history, no reset. Audit adversarial
   moves exhaustively across the stated domains.
4. Establish a complete legal KRK opponent, explicit checkmate terminal
   and draw/clock/repetition handling (claims, automatic rules, rook capture,
   stalemate); demonstrate the bound from **every** supported legal root.
   No tablebase, existing chess engine, minimax, search surrogate,
   model, or arbitrary legal move may select a Maths move.
5. Run Node and browser suites, upstream Lean+axiom CI, source-lock and
   regression tests. Merge only exact tested heads with coherent ancestry.
   Do not merge the existing draft KRK05 PR into a gameplay release while
   unfinished. Obtain explicit owner approval before enabling KRK Maths
   gameplay; otherwise keep the proof-progress draft and report the next
   mathematically precise obstruction, without calling it playable.

The next session should perform implementation and formal verification, not
merely update this prompt or rewrite a status report.
