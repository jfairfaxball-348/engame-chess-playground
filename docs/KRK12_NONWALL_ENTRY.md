# KRK12 — source-backed non-wall entry to prepared-wall strategy

29 October 2026 · stacked Playground branch `krk12-nonwall-entry` on KRK11.

## Executed code

New `src/krk-nonwall-entry.js` makes **three existing, pinned
`KRKForcing` constructive actions** selectable at fresh strong-turn roots,
each in an explicit proof frame and for either rook colour.

| Source constructor | Actual first action | Every defending reply |
| --- | --- | --- |
| `krk_clear_vertical_entry_force` | rook moves onto strong-king rank + 1 | strict rank wall |
| `krk_same_rank_retreat_force` | strong king retreats one rank | strict rank wall |
| `krk_backrank_protected_force` | protected rook advances to rank 1 | strict rank wall |

The first move comes exclusively from the already pinned, immutably locked
`krkConstructiveStep` coordinates (source SHA
`e7de0930fc61caeb11795cf3c10fde11e4774a40`,
`proof-sources/krk.lock.json`). `krkNonWallEntryContinue` verifies
the actual first move's position key, legal defender reply, side, frame,
history length and halfmove before handing off to KRK11's
`krkPreparedWallChoice`. No board-reset, heuristic, tablebase, minimax,
generic first legal move or network opponent is used.

`krkPartialRootChoice` checks available proven prepared walls in four
symmetry frames before attempting these direct entries. Its choice is
deterministic by proof-premise applicability; it is **not a total
strong-turn KRK selector**. `auditKRKNonWallEntry` enumerates ALL actual
immediate legal defending replies solely to falsify the source-to-JS
translation; defender enumeration does not choose a move. Tests cover
three distinct exact proof cases, both colours, all four symmetry frames,
negative/tampered contexts and a complete sample mate trace.

## What remains mathematically missing

- Non-wall **off-rank close-file repair**: after moving the rook to the
  far file, each defender reply must route to an exact subsequent
  vertical/horizontal entry with a total, decreasing phase index.
- Non-wall **back-rank unprotected/close-file**: position the king before
  protected rook entry and certify all replies.
- Full axis-aligned canonical setup selection, including roots not in
  these three rule domains, with a global all-defender termination rank.
- Weak-to-move root classification (mate/stalemate/rook-capture vs
  provably preserved win), and quantitative coverage tests.
- Upstream KRK11 parent proof CI and axioms must be verified at its
  final SHA; this JS extension creates NO new Lean proof.

The 50-move/repetition project is intentionally deferred per the owner's
instruction. The future Maths mode must explicitly disclose that it is
mathematical KRK play, not FIDE clock/history certification.

**Release gate unchanged:** `MATERIAL.krk.playable=false`,
`KRK_GAMEPLAY_RELEASED=false`. No live KRK gameplay or deployment
is claimed from this branch.
