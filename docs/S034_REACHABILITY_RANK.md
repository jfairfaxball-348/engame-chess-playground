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
