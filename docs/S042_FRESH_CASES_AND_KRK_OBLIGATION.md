# S042 — fresh original-frame KQK roots and KRK phase-composition boundary

2 November 2026. Downstream audit only. Frozen source is **read-only**:
KQK EC-T0050 `c72365a8ba46f59114a2a77d9d38993f6a52df80`;
KRK EC-T0048 `2311abe71bc1a4eed47026feccd5ba5a0760d5bb`;
KRK executable `e7de0930fc61caeb11795cf3c10fde11e4774a40`.

## Why this is different from the S041 sweep

The same-root S041 preparation cohort had 42 first defender replies,
all nested in a **real FarFilePreparation token**. At 4x it closed 8
subtrees, capped 34, and encountered no observed hard source or cycle
failures. It did **not** sample original-frame separating-rank and
already-far-file tight-above **fresh roots**, nor establish termination.

S042's `scripts/s042-fresh-families.mjs` creates actual legal
strong-to-move KQK positions in the *separating-rank* and *tight-above*
source-original frames. Every candidate is checked by
`validateSetup` and `kqk32CaseFromState`; both colours and selected
board symmetries are considered. The first input token is **null**.
The audited attacking moves, theorem labels, frame and continuation
tokens all come from the **actual source-derived runtime selector**.
No artificial preparation token is allowed or needed.

For each selected root, the audit checks the original-frame case,
the **actually selected theorem frame** and exact action, checks known
independent full-premise verifiers (tight_king_step, low-wall,
backrank) and labels other named theorems **unchecked**, not proved.
It then follows **every** legal first weak reply, replays the issued
token and action and follows **every** legal second weak reply,
reporting absent third source actions without fallback. A finite
all-reply tree is also probed under a stated resource cap; mate closure
requires every visited defender continuation to mate, and a capped
branch cannot be called a win. First hard source gap, failed independent
premise, unchecked constructor, capture, nonmate, structural recurrence
and resource-cap witnesses remain *separate*.

Reproduction:

```sh
npm run audit:s042-fresh-families -- --per-family=4 --candidates=64 --nodes=100 --pairs=20 --strict
npm run audit:s042-fresh-families -- --per-family=4 --candidates=64 --nodes=100 --pairs=20 --full
npm test
npm run check
npm run build
```

These are **sampled, legal fresh roots**, not the entire KQK root
space; the construction and 2-reply depth cannot prove a universal
source policy. A second-frame move is attributed only to its **selected**
theorem in that frame; it is not proof of the original-frame branch.
Any `unchecked` result is an open downstream checker obligation.

## KRK exact missing theorem

At the frozen executable Lean SHA, the source
`Rules/KRKCentral/Prep.lean` proves `prep_bound` via an induction on
`prepDistance` and budget `readyCost + prepCost`.
`Rules/KRKCentral/Restoration.lean` proves `restoration_bound`
under a supplied `CentralBound`, increasing the budget by six plies.
`Rules/KRKForcing/StrategyTransport.lean` transports `ForceMate`
through board symmetries, rather than certifying the exact JavaScript
tagged controller and its nested tokens. These are genuine source
facts, not a single extracted decreasing measure for the Playground.

**The minimum open source obligation** is a frozen statement over the
actual chosen JS-compatible policy state `(legal board, side to move,
full continuation token)` (or an equivalent explicit source policy):
for every admissible fresh root, each source action is well-defined,
legal, queen/rook-safe, and, after **every** legal defender reply, either
produces mate or a successor with a well-founded measure strictly
lower than before the pair. Crucially the statement must include
PREP→central, central→restoration, restoration→central and all other
re-entry edges, not only separate local phase ranks. A finite
`MateWithin` existence proof is **not** such an executable-selector
correspondence theorem. Do not mark `globalTerminationCertified` true.

## Preservation and release

No runtime source selector, certified material gate, proof-source lock,
old K/K–K+B/K–K+N/K Maths derivations, Engine tab, or KPK support has
changed. Stage A is open until complete source-derived all-adversary
winning from every legal root. Stage B then restores full KRK/KQK
board-specific mathematics and strict clock/history parity.

**CI evidence:** insert actual S042 PR-head and main run results only
after Actions have finished. Browser QA success is separate from
Cloudflare Worker deployment.
