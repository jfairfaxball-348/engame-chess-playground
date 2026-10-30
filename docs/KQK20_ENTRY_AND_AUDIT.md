# S020 — KQK source entry extension and bounded coverage audit

30 October 2026. Playground repository only. Frozen parent EC-T0050 source:
`c72365a8ba46f59114a2a77d9d38993f6a52df80`.

## Executable additions

`src/kqk-source-policy.js` now admits new strictly source-premised
geometric first actions, after the S018/S019 Edge/Shadow/Band priority:

- `SameRankEntry.positive_right_entry`: descend the strong king from the
  same rank as the queen into the separating wall with the OpenBand corner
  exclusion; `backrank_entry` and `protected_backrank_entry` move the queen
  to rank one under exact file/gap conditions.
- `FarFilePreparation.far_file_preparation`: shift the queen to file 0
  **or** file 1 using the Lean escape witness, not a fixed file that might
  remove the weak king's last legal reply.
- `EntryGeometry.clear_low_wall_entry` and
  `OrientedEntry.small_file_wall_entry`: the explicit first low-rank
  and fifth-rank wall steps.
- `TightEntry.tight_king_step`: rise one king rank then use a
  one-reply, exact-position-bound `tight-file` continuation for the
  `protected_file_entry` forward/backward queen-wall action, or
  the source's narrow direct-corner mate.

All choices still require a legal move from the unchanged local move
generator, expose a `KQK.*` proof phase, and fail closed if a required
premise or source continuation is not implemented. **No** Stockfish, Lozza,
tablebase, minimax, generic king-to-king approach heuristic or legal-move
fallback has been introduced. `MATERIAL.kqk.playable` remains `false`
(certified selector not established); experimental exact-position Maths play
remains available via the existing opt-in path.

## Reproducible coverage report

Run `npm run audit:kqk-roots` to print a JSON summary of a fixed-seed sample
of fresh legal strong-turn roots in both colours. Separate fields report:
legal sampled roots, source action availability, immediate nonmate terminals,
and total immediate weak-reply positions with/without a source continuation.
A separate bounded first-legal-defender-line sample measures actual mating
termination versus `unsupported`, `cycle`, and cap outcomes.
Flags `--attempts=N --games=N --rounds=N` adjust sample sizes and bounds.
This diagnostic never chooses real user moves. It does **not** claim
exhaustive coverage or adversarial full-game certification.

`test/kqk20-entry-source.test.js` exercises exact same-rank and tight entry,
one-reply continuations, two colours, all eight symmetries, forbidden forged
tokens, and non-stalemating first actions. Existing S018/S019 regressions
were updated where their formerly unsupported backrank fixture is now
genuinely covered, rather than weakening the proof-source guard.

## Remaining

- Quantify and then close actual whole-game defender branching, not merely
  legal first moves; design bounded all-reply falsification by root region.
- Complete `FarFileEntry`, `OrientedEntry`, `SameRankEntry` alternate
  branches and all narrow-corner/weak-turn transitions where local source
  dispatch still returns null. Source existence of MateWithin is not an
  extracted JavaScript selector.
- Verify the *actual* production Cloudflare Workers URL separately from
  green GitHub CI. Vercel has reported daily deployment rate limits.
- Keep 50/75-move and full clock-history semantics deferred per owner.
  Keep full KK/KBK/KNK working and the Engines tab unchanged.

The next execution session is installed in `NEXT_SESSION.md`.
