# KRK06 — Constructive central-wall first-action partition (UNRELEASED)

**29 October 2026.** Two additional local first-pair constructors now have
formal Lean proofs and an independent chess-rule translation. This is
incremental proof extraction, **not** playable KRK.

## Upstream exact proof

Stacked [Endgame Chess PR #8](https://github.com/jfairfaxball-348/engame-chess/pull/8)
on the still-unmerged KRK05 proof PR #7:

- `KRKExecutable.centralAlignedRescue_sound` gives the far-file rook
  relocation when `sk.file = weak.file` and rook file margin is below two.
  Proves legal first move, nonempty weak responses, and **all legal**
  replies preserve a strict wall and >=3 files of rook separation.
- `KRKExecutable.centralBackRook_sound` specialises the orientation rule
  in `KRKCentral.positive_bound` to a concrete rook destination:
  `d=true` -> file 0 (or 1 if already at 0); `d=false` -> file 7
  (or 6 if already at 7). All legal defender replies retain the wall
  and at least two files of rook margin.
- Both declarations are imported in `EndgameChess.lean` and include
  `#print axioms` on the isolated proof branch. The
  [exact-head Lean workflow](https://github.com/jfairfaxball-348/engame-chess/actions/runs/40916980662)
  passed at `3991ab34a9e4fc747529ef6edc5f58f53372b72e`.
- These are **local proof lemmas**, not an executable induction over
  all legal roots. In particular the source's `positive_bound`,
  `wait_even_bound`, `back_bound`, `ExitBound`, guarded/column and
  global setup have not been extracted as a terminal-to-mate policy.

## Playground translation

Stacked [Playground PR #13](https://github.com/jfairfaxball-348/engame-chess-playground/pull/13)
on still-draft PR #12:

- `src/krk-central-boundary.js` recognises the exact strong-turn central
  wall. When rook margin is below two, it selects one of the **two named
  proof constructors**; if margin is at least two, it delegates to the
  existing proof-backed READY dispatcher.
- The exact chess board, colour, proof frame, history and halfmove count are
  retained. Illegal square, invalid history, threefold-claim or near-50-move
  states fail closed. There is no standalone “play KRK” entry point.
- `test/krk-central-boundary.test.js` tests both colours, all four Lean
  frames, both orientation directions, every defending move, and a lattice
  of legal close-rook central roots. The tests are **falsification audits**,
  not a mathematical or FIDE global-win certificate.
- Engine tab and existing maths K/K, KBK, KNK remain unchanged;
  `KRK_GAMEPLAY_RELEASED=false` and `MATERIAL.krk.playable=false`.

## Exact remaining obligation

After any chosen central-wall move, derive a **complete, deterministic,
history-aware successor dispatcher** using the same proof branch. It must
dispatch every legal defending reply into a smaller well-founded phase until
actual checkmate, without any engine, tablebase, minimax, ad hoc rules,
arbitrary move fallback or unproved lemma. The first two central-wall moves
do **not** themselves decrease a published globally compositional mate rank.
The necessary positive pursuit / back-even / exit recursions and non-wall
setup remain missing.

Do not merge stacked PRs #7/#8 or #12/#13 as a gameplay release and do
not enable Maths KRK without complete verification and owner approval.
