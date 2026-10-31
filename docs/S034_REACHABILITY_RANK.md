# S034 — real KQK preparation reachability and KRK rank obligations

31 October 2026. Downstream diagnostic-only session, PR #43.

**Scope and release honesty.** Parent endgame-chess remains read-only.
This branch does NOT alter production move selectors, frozen Lean source
locks, KRK/KQK certified material gates, KK/KNK/KBK worked maths panels,
independent Engine playground, or FIDE clock/history semantics.
Experiments do not constitute an all-defender mating theorem.

## KQK source frame case audit

The preceding S033 proof-frame check authenticated all 24 cross-frame
SameRankEntry.backrank_entry.clear_low_wall moves in their *chosen*
frozen theorem frame after four authentic FarFilePreparation roots.
It did not prove first actions in the original four-case split.

S034 adds scripts/kqk34-reachability.mjs:

1. Begin with the 16 established S025 colour/isometry fixtures,
   preserving their four actual source-issued preparation tokens.
2. Enumerate a reproducible BOUNDED canonical legal strong-turn
   subregion without inventing theorem tokens. A candidate only enters
   the audit if the existing frozen-source JS controller really chooses
   FarFilePreparation and issues a far-file continuation token.
3. Replay that exact first strong move and EVERY legal weak reply.
   Classify the resulting position in the ORIGINAL token frame by
   the ordered four-case predicate from frozen FarFileEntry.
4. Replay the actual next tagged strong move, independently authenticate
   a cross-frame SameRankEntry backrank theorem if that *exact* source
   is chosen, and replay every next lawful defender reply. Report
   missing source actions, unsafe frame attribution, resource scope,
   actual mate, other terminals, and replayable board/move keys.
5. Never reissue FarFilePreparation on an already authenticated
   preparatory token. A chosen source action under any OTHER frame is
   not thereby certified as the original-frame constructor.

The finite exhaustive rank audit in the same script checks every board
rank (0..7) satisfying the source preconditions
preWeakRank >= kingRank+2 and queenRank != preWeakRank, and every
one-square weak rank change. A tight-above reply would require
queenRank=kingRank+2 and postWeakRank=kingRank+1; necessarily
preWeakRank=kingRank+2=queenRank, contradicting offWeak. The code
checks zero such tuples; this is a precise arithmetic obstruction,
NOT a general lack of tight-above roots. Already-far-file legal roots
must be audited independently.

## KRK rank/composition diagnostics

scripts/krk34-rank-obligations.mjs consumes the exact authentic
S033 two-defender-reply source edge registry. It reports exact
original source names, observed successors, divergent weak-response
branches and source proof obligations. It does not impose an arbitrary
phase ordering or claim a source-derived lexicographic decrease.

The missing bridge is still a frozen theorem showing a well-founded
rank of the actual (board, nested continuation token) JS state
strictly descends, or reaches a bounded certified terminal, for
EVERY lawful weak response and all setup/nonwall/prep, central and
restoration compositions. KRKWinning.Policy.winning_policy
uses Classical.choose, while StrategyTransport transports existence
of ForceMate. Neither as frozen provides that JS-tagged rank lemma.

## Reproduce and release guard

Run:
- npm test
- npm run verify:krk-sources
- npm run audit:kqk-original-cases -- --legal=1200 --prepared=32
- npm run audit:krk-rank-obligations
- npm run check
- npm run build
- all pre-existing KRK/KQK checks and both Chromium browser suites
  via GitHub Actions.

S034's probes are deliberately capped. Read originalCases,
firstWitnesses, independentUnverified, missingFirstSource,
secondSourceMoves and missingSecondSource from the JSON; do not
equate observed coverage with a total proof. If CI succeeds, that
verifies these regressions, not universal mating or a Cloudflare
production deployment. NEXT_SESSION.md installs S035 for exact
continuations and the first source-backed KRK rank bridge.

## Measured PR-head S034 CI audit

[First full PR-head Actions #41220273059](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/41220273059)
**passed**, including npm test, frozen-source verification, KRK/KQK
adversarial source audits, syntax, build and both Chromium suites.

The explicitly scoped canonical-plus-fixture audit with
maxLegalRoots=1,200 and maxPreparedRoots=32 actually examined
467 distinct legal candidates before its prepared-root cap:
- 32 authentic preparation roots and 200 immediate legal weak replies.
- ORIGINAL frame: 140 direct-small-file, 60 horizontal-far-wall,
  0 separating-rank and 0 tight-above. The absence of separating-rank
  is BOUNDED ABSENCE and remains an open source-reachability obligation.
- 140 same-frame choices were named
  KQK.EntryGeometry.clear_low_wall_entry.queen_wall.
  60 different-frame choices were independently checked
  KQK.SameRankEntry.backrank_entry.clear_low_wall, with all
  60 frozen theorem premises authenticated.
- 0 missing first source actions, 0 unsupported cross-frame actions,
  0 repeated FarFilePreparation, 0 unclassified case.
- The 1,254 actual next legal weak replies all had named subsequent
  strong moves, 0 missing second source moves; 0 mates observed at
  this two-reply horizon and 0 other terminals. This is NOT a
  complete-game bound.
- Exhaustive finite rank check: 399 precondition rank tuples,
  0 satisfying a tight-above immediate post-preparation reply.

KRK rank obligation graph (24 deterministic roots, 168 first replies,
980 second replies and 980 tagged third moves):
- two-step-setup / nonwall-entry: 476 edges, including 416 -> central
  and 60 -> prep;
- direct-entry / central: 304 -> central;
- prepared-wall / central: 200 -> central;
- 0 missing tagged choices, 0 rook captures, 0 nonmate terminals.
  There is still NO upstream frozen descending board+token rank theorem.

These numbers are reproduced by S034 CI at fixed caps. They do
not imply coverage of arbitrary initial legal KRK/KQK boards,
mate termination, full history parity, or deployed Cloudflare status.
