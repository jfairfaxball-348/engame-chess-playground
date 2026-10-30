# S026 — protect KQK SameRankEntry backrank continuation

30 October 2026. Downstream playground only, with frozen parent EC-T0050
at `c72365a8ba46f59114a2a77d9d38993f6a52df80`.

## Verified source premise and implementation

In `formal/EndgameChess/Rules/KQK/SameRankEntry.lean`, theorem
`backrank_entry` has a final branch when the strong king and queen
are on rank zero; the weak king is at rank >=2; both strong and queen
files are one square from the weak file on opposite sides. The proof
first moves the strong king onto the weak king's file and then uses
`mateWithin_pair` to handle **every legal weak reply**, invoking
`protected_backrank_entry` in the *same source orientation*.

Before S026 the JavaScript emitted the first move with no continuation
token, discarded this exact two-ply compositional fact and re-entered
the initial multiphase dispatcher after the defender replied. That is
not a literal translation of the Lean all-reply composition. S026 adds
a one-reply `backrank-protected` token and the guarded
`protectedBackrankReply` continuation. The only selected move is the
source's Q(q.file, 1); the exact king/queen ranks, adjacency,
off-queen weak file and token legality are checked before choosing.
There is no engine, minimax, tablebase, heuristic or arbitrary move
fallback. If the premise is absent, the controller fails closed.

New test `test/kqk26-backrank-protected.test.js` covers both strong
colours, the eight board isometries and all legal defender replies
for every fixture that selects this source branch, including forged
token and premature-token rejection. All other proof panels, KRK and
the Engines tab are untouched.

## Stage A and diagnostics

This is a concrete source-controller continuity improvement, **not**
a full KQK or KRK checkmating strategy certificate. S025's fixed-seed
2,500-node/64-round sample was 105/120 KQK mate-closed, 15 capped,
zero observed hard failures (monotone clock-free cache); 24/24 KRK
sample roots were capped. S026 did not establish all-root closure.
Those caps do not themselves demonstrate missing moves or losing
moves. Stage B (full KRK/KQK worked proofs and FIDE rule-aware
parity) remains blocked on BOTH simplified strategies being complete.

The **post-change** CI and audit values must be checked against the
exact tested SHA before quoting them as S026 results. In particular,
the GitHub Actions bounded adversarial checks are falsification tools,
not a global mathematical proof. Cloudflare Workers deployment needs
independent confirmation; a green GitHub CI alone is not deployment.

## Next targeted work

Use `NEXT_SESSION.md` for S027. Prioritise the reproducible
KQK first-cap family WeakToMove: strong White K=48 Q=32, weak Black K=35,
Black to move, first resource cap after source BandEntry/BandProgress
into K=44 Q=32 weak K=12 White to move with no token. Check the actual
path and source premises before proposing any further policy change.
Investigate KRK 24/24 caps independently and avoid merging
different history/clock contexts into a false theorem.
