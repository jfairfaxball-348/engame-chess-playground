# S032 — source-phase and four-case KQK audit

31 October 2026. Downstream Chess Playground PR #41. No changes to
frozen source locks, live Maths/Engine choices, KK/KNK/KBK worked
mathematical panels or formal release gates.

## KRK source termination obligation

S030 observed 96/96 mate-closed weak-reply spines. S031 observed
zero closed-subtree cache reuses at 2,500 nodes/root and 24/24 capped
all-defender trees, without a genuine counterexample. Neither
establishes a global ranking theorem.

The new diagnostic scripts/krk32-phase-edges.mjs enumerates all legal
FIRST weak replies at the 24 source-family/colour/frame roots, records
the named frozen-source move, complete controller token and successor
phase (or the replayable missing-source witness). It does not choose a
defender move in live gameplay and does not establish termination.

An all-defender certificate still needs a *source-backed* well-founded
measure or explicit bounded phase composition under EVERY weak reply,
including setup, direct-entry, prepared wall, central/restoration and
final mate. The current tagged controller carries nested source
tokens, not a proved globally decreasing phase rank. Do not fabricate
a rank or relabel the bounded audit as global closure.

## Frozen KQK FarFileEntry ordered cases

At upstream pinned c72365a8ba46f59114a2a77d9d38993f6a52df80
the proof far_file_stage_bound splits under its ORIGINAL frame:

1. sk.rank < queen.rank < wk.rank: separating-rank bound.
2. sk.rank+2 <= wk.rank and
   (queen.file != sk.file or sk.rank < queen.rank): small-file bound.
3. Horizontal king separation and queen/weak rank gap >= 2:
   horizontal far-wall bound.
4. Residual queen.rank=sk.rank+2, wk.rank=sk.rank+1:
   tight-above bound.

scripts/kqk32-far-file-audit.mjs transcribes this predicate partition
but NEVER chooses strong-side moves. The tests check four static
theorem-case positions across both colours/eight isometries (including
inverse proof frames for the 90/270-degree board rotations).

It then inspects GENUINE S025 FarFilePreparation source-issued tokens
and enumerates all immediate lawful weak replies. Each record includes
the original frame, actual weak move, exact case, previous source token,
chosen next source rule and chosen frame. A move under another frame is
explicitly flagged as an independent theorem-applicability obligation,
rather than incorrectly credited to the original-frame case. A
different proven frame is not automatically an invalid choice.
Unsupported continuations remain observable rather than papered over.

IMPORTANT: a static theorem-case witness is not the same as a live
reachable FarFilePreparation continuation. Real-token fixture coverage
may exercise fewer than four cases; no global case correspondence is
asserted by this audit. Expand with legitimate reachable proof tokens
for remaining cases before claiming branch completeness.

## Release gate and handoff

Stage A (source-derived, all-defender constructive mate from ALL legal
KRK/KQK roots) remains OPEN. Formal playable flags stay false;
experimental beta stays disclosed. Stage B is the immediate next
priority after BOTH strategies close: live board-specific calculations,
equations, Lean proof provenance, 50/75-move and repetition rules
parity with KK/KNK/KBK. Do not start KPK or unrelated Engine work.

For exact counts see PR #41 Actions and run
npm run audit:krk-phase-edges and npm run audit:kqk-far-file.
CI green is not a universal strategy certificate or confirmation of
the production Cloudflare Worker deployment.
