# S027 — KQK Prepared-band continuation carried through weak reply

30 October 2026. Downstream Chess Playground only. Frozen parent KQK
EC-T0050 at `c72365a8ba46f59114a2a77d9d38993f6a52df80`.

## Why this is a source-controller repair

The frozen `formal/EndgameChess/Rules/KQK/BandProgress.lean`
theorems `prepared_king_step` and `prepared_queen_step` give
a **single exact source action** followed by
`∀ r, Legal c r → Prepared ...` in the *same orientation*.
The prior JS controller selected the correct first action but
discarded that proof continuation, restarting eight-frame root
selection after each defending king reply. That did not faithfully
carry the Lean all-reply composition.

`src/kqk-source-policy.js` now emits the `band-prepared` one-reply
token for both actions. The weak king must actually move once; the
stored original board, weak square, frame, and move count must match.
The next strong move is selected in that original source frame
**only after rechecking Prepared** (king one rank below queen,
queen rank <=5, file ordering, separating queen wall). It then
uses the **existing** BandProgress, RankFive or BandRaise source
coordinates; nothing scores or searches legal moves.

A premise failure refuses play rather than selecting an engine,
minimax, tablebase, heuristic, arbitrary legal move, or bogus proof.
The source frame is committed for one reply, not forever.

## First previously capped WeakToMove path

The S025/S026 audit first capped path starts at White K48 Q32,
Black K35, Black to move, and encounters White K44 Q32,
Black K12, White to move, token null after several defending king
replies. In this *specific* capped position the source defines
`KQK.BandProgress.prepared_queen_step`, Q32–35 in a reflected
vertical frame. The new token preserves that frame for every
legal next defender reply. This demonstrates that the *first
capped position itself* was not an unsupported source selector.
The **full all-defender tree at that root remains unproved**:
a traversal resource cap is neither a win certificate nor a
counterexample.

## Tests and engineering scope

`test/kqk27-band-prepared.test.js` exercises both colours,
eight geometric frames, each named Prepared step when actually
dispatched, all legal following weak replies, immediate
continuation availability and forged token rejection. It also
replays the first capped position with the source-specified
queen step and all immediate replies. All previous gameplay,
Maths proofs for KK/KBK/KNK, KRK, and separate Engines are kept.

The GitHub Actions workflow now runs the *same* deterministic
12,000-attempt/4-per-family/2,500-node/64-round KQK test with
`--cache=monotone` and `--cache=exact`.
These are falsification diagnostics, not new mathematical
proofs or a certificate that JS terminates on every legal board.

## Verification and remaining gates

S026 **merged-main** `f3bac9ab2ae76649d59a4ae9d924c9e05d854736`
had green Actions run 41099570173. Verified main baseline:
KQK 105/120 mate-closed, 15 inconclusive caps, 0 falsified
(monotone); KRK 24/24 capped, 0 observed hard failures
at 2,500 nodes. Do not quote an S027 post-change number
until the latest exact PR head and merged-main CI are checked.

**Stage A remains open:** KRK and KQK are experimental
play-first strategies and not proven complete under arbitrary
defender replies. Strict FIDE 50/75-move, repetition, and
board-specific KRK/KQK worked-proof parity are deferred until
**both** strategies really close. In Stage B restore those panels
immediately; the KK/KNK/KBK panels must not regress.
No KPK, engine training, or changes to the parent Lean repository.

Cloudflare Workers production must be independently inspected;
green GitHub tests are not a deployment claim.
