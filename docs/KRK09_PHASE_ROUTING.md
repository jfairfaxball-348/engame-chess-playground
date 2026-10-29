# KRK09 — Phase-preserving pursuit and actual mate regressions

29 October 2026. Proof-progress draft, stacked on KRK08. KRK gameplay remains
unreleased; main and production are not updated by this draft.

## Source proof

[Upstream PR #10](https://github.com/jfairfaxball-348/engame-chess/pull/10)
adds `KRKExecutable/LowerRouting.lean` without changing frozen modules,
KQK/KPK or the parent programme's main branch. The exact source commit and
14 source blobs are pinned in `proof-sources/krk09-routing.lock.json`.

The controller uses a fixed orientation and rank
`6 − orientedStrongFile + rookTempoDebt`.
Debt is 2 for an arbitrary rook file; behind-rook positions have debt 1
for an odd king-file offset and 0 for an even offset. A chase advances the
strong king one file and preserves lower-band offset parity. A wait moves
an arbitrary rook behind the king, or changes an adjacent odd offset to
even. Every continuing legal lower reply strictly reduces the rank.

`lowerRouting_terminates` proves a finite all-reply derivation using only
the exact chase/back-rook coordinates; its nodes cannot call restoration.
`lowerCentralWithinFive` sharpens this to at most five complete pairs to
an **Exit**, not mate, from its oriented lower-wall domain.
`offCentreUpper_sound` certifies the rook lift for interior king files
1–6, followed by the exact two-rank restoration premise. An off-centre
king need not be recentred before lifting the rook.

The focused Lean build passed all 90 dependency targets. The five new
declarations print only `propext`, `Classical.choice`, `Quot.sound`.
[Full Lean/axiom CI #40930441989](https://github.com/jfairfaxball-348/engame-chess/actions/runs/40930441989)
passed on pinned source `e9d0ecb47ef9461c933522e8d609597cea89958f`.

## Independent JS composition

`src/krk-central-sequence.js` now carries explicit continuation tags:
`central`, `lower`, `restore`, `centre`. Each is tied to the exact selected
strong move, original history length, clock, colour, frame and wall rank.
The continuation is supplied after the legal defending reply.

Lower pursuit retains its orientation until aligned/upper exit. Only a
rook lift/check enters restoration, whose king catch-up can then enter
the final centre-alignment step. The original arranged board and real
move history are never reset. There is no search, engine, tablebase,
heuristic fallback or generic legal-move selection.

Cycle diagnostics use board **and control phase**. A board can legally
occur once during centre restoration and again during pursuit, with
different selected next moves. Actual FIDE threefold claims still count
board/turn occurrences, independently of the control tag.

## Validation and limits

The former Kd5/Ra6 versus Kd7 cycle now reaches actual checkmate against
every legal reply in all eight colour/frame variants. A second, lower
root Kd4/Ra5 versus Kd6 also completes all replies. Together with edge
roots and three rescue/tempo families, the mate regressions audit 27
roots, 45,338 visited nodes and 18,973 actual mate leaves, maximum 29
plies. The 32 lower-to-Exit domain tests still reach 816 exit leaves,
maximum five pairs, now checking strict rank decrease after waits too.

These are finite tests of the JS composition. They are not a Lean proof
of the complete JS selector. Lower starting ranks 1–3 exceeded the
100,000-node diagnostic cap; that is neither success nor a counterexample.
No branches were removed to make the tests pass.

Remaining mathematical work: compose the **specific tagged central/exit/
restoration policy** into a quantitative all-reply source derivation to
mate, then connect every legal arranged KRK root, weak-to-move and drawn
roots. Carry the precise fresh 50-move budget and repetition guarantees
through that composition. The existing existential outcome proof is not
a certificate for this specific selector. Arbitrary histories and clocks
also remain gated.

`KRK_GAMEPLAY_RELEASED=false`, `MATERIAL.krk.playable=false`,
`isCompleteWinningPolicy=false`, `maxMatePlies=null` remain binding.
Do not merge the stack or deploy it as playable KRK.
