# S035 — independently authenticate KQK actions and KRK preparation transfer

31 October 2026. **Downstream-only, diagnostic source-bridge session.**
Frozen mathematics repository was read-only. Source anchors:
KQK EC-T0050 `c72365a8ba46f59114a2a77d9d38993f6a52df80`,
KRK sourceCommit `e7de0930fc61caeb11795cf3c10fde11e4774a40`.
No Maths move controller, proof lock, certified material-release flag,
existing KK/KNK/KBK worked proof panel or Engine tab was modified.

## What this actually establishes

`scripts/s035-source-bridges.mjs` is a diagnostic consumer of **live**
`kqkSourceChoice` and `krkTaggedStrongChoice`, never another move
selector. It does not use tables, engines, minimax or a fake source token.

1. **KQK original-frame direct small-file:** On each genuine
   FarFilePreparation continuation, replay every legal weak reply, retain
   the real prior token and authenticate a selected
   `KQK.EntryGeometry.clear_low_wall_entry.queen_wall` against frozen
   `EntryGeometry.clear_low_wall_entry` and `low_right_entry`:
   king/weak rank gap at least two, king rank at most four, required
   clear queen line and file gap, exact **Q(q.file,king.rank+1)**,
   source-original frame, chess legality, legal weak replies and no
   immediate queen capture. The framed theorem's *specific first action*
   is now independently checked, not merely assumed from its string tag.
2. **KQK switched-frame horizontal:** For the selected
   `SameRankEntry.backrank_entry.clear_low_wall`, reuse the independent
   S033 theorem premise/target authentication in the *selected* frame.
   This is a legitimate alternative theorem instance, **not** proof
   correspondence with the original horizontal theorem's first action.
   Continue to the next real defender reply and tagged strong choice.
3. **KQK already-far-file tight-above:** Use genuine legally constructed
   strong-to-move boards and both colours/all eight board isometries.
   There is *no manufactured FarFilePreparation token*. When the live
   policy selects `TightEntry.tight_king_step.king_approach`, check the
   actual frozen tight hypotheses and exact **K(k.file,weak.rank)**
   source construction, plus legality and non-stalemating first move.
   Report alternate named source routes separately. Replay every real
   immediate weak response and check its next source action.
4. **KRK setup/nonwall/prep bridge:** Start the existing 24 canonical
   source-family/colour/frame seeds, enumerate the first two complete
   legal defender-reply layers, take the **live** third source choice,
   and isolate cases actually tagged `sourcePhase=prep`. The
   `KRKCentral.prep_pair` / `WallActions` rank
   `2 * prepDistance + 1{rook/weak file gap < 2}` must strictly
   decrease after the selected action and **every** next lawful weak
   reply in the *same source frame*, with a valid next tagged action.
   This supplies a checkable LOCAL source-backed decrease on the real
   setup→prep continuation boundary. It does **not** rank central and
   restoration phases or their future re-entry.

## Honest scope and unresolved obligations

The S035 diagnostics run under explicit legal-root/preparation caps
(default 1200/32, as in S034 CI). They establish neither complete root
coverage nor complete game-tree closure. The already-far-file tight
fixture tests one orbit, not arbitrary tight positions. Frozen Lean
`MateWithin` outcome existence and `Classical.choose` do not
automatically certify the concrete JS action policy.

**KQK:** need authentic source-frame separating-rank witnesses (or a
source proof of non-reachability for the preparatory subregion);
complete alternative-frame theorem authentication beyond the specific
backrank rule; real all-reply, all-ply mate closure, and a reason that
source dispatch cannot oscillate or strand a legal root.

**KRK:** local prep descent has an existing frozen lemma; still need
a frozen, explicit **cross-phase** board+continuation-token well-founded
rank for every setup, direct, central, restoration and finishing
transition. `KRKWinning.Policy.winning_policy`'s `Classical.choose`
and `KRKForcing.StrategyTransport` give global existence/transport,
not an executable JS token-rank theorem. The exact unresolved obligation
is the central/restoration → central/restoration (or completion) rank
bridge with all legal weak replies.

**Release:** `MATERIAL.krk.playable=false` and
`MATERIAL.kqk.playable=false` still mean *not universally certified*.
Keep the existing experimental partial play and all earlier material
proofs. Stage B board-specific maths/provenance/FIDE clock+history parity
follows immediately after both Stage A policies are genuinely complete.

## Validation and reproduction

- `npm test` includes S035 exact-target and source-rank regression.
- `npm run audit:s035-source-bridges -- --strict` fails on missing
  authenticated first actions, unsafe prep rank handoffs or missing
  source actions; it does not fail on an explicit bounded sample.
- `npm run verify:krk-sources`; `npm run check`; `npm run build`.
- Existing S032–S034 audits, capped mate-tree diagnostics, and both
  Chromium suites remain mandatory in GitHub Actions.
- A passed Actions run certifies these checks only. It is not evidence
  that the Cloudflare Worker URL independently deployed this commit.

See `NEXT_SESSION.md` for S036.
