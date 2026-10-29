# KRK11 — Prepared wall to source-selected central mate

29 October 2026. Draft stacked on KRK10. **Neither branch is released or
merged into main.** The owner's current priority is a *complete mathematical
winning strategy*, not an immediate 50-move/repetition claim certificate.

## New strategy construction

- Parent draft [KRK11 PR #12](https://github.com/jfairfaxball-348/engame-chess/pull/12) introduces
  `KRKExecutable/PreparedWallPolicy.lean`.
- `PreparedChoice.next` fixes `prepNext` from the upstream proved controller.
  It is not a heuristic. Its positive integer `prepRank` strictly decreases
  after **every legal defender reply**; both rook-file repair and king steps
  remain inside the same oriented strict rank wall.
- At preparation rank zero the strong king is central, one rank below the
  rook, and the rook is at least two files from the weak king. The state
  matches KRK10's `PolicyCentralBound` domain.
- `PreparedRun` connects exact chosen preparation moves to
  `CentralRun` and finally `MateWithin`. The stated static upper bound is
  `2 * prepRank + 18 * (6 - rookRank) + 11` actual plies.
- This extends from an already central wall to **every strict oriented rank
  wall**, but is not yet a global arbitrary legal KRK root selector.
- Parent proof and axiom validation are **pending final-head CI** until the
  actual Actions run reports success. Do not cite the theorem as proved
  solely because this source has been committed.

## Playground implementation

- Playground draft [KRK11 PR #18](https://github.com/jfairfaxball-348/engame-chess-playground/pull/18)
  adds `krkPreparedWallChoice` and `krkPreparedWallStaticBound`.
- Source-derived prep actions hand directly to the tagged KRK10 central
  algorithm; context binds move, side, frame, history length and clock, and
  a preparation successor must strictly decrease rank. Input positions
  are not replaced.
- New regression tests exercise both strong colours, all four proof frames,
  every first legal defending reply, a complete sample checkmate trace,
  tamper rejection and unsupported-root fail-closed behaviour.
- The static source bound is **not** an exact mate distance or FIDE
  50-move/claim certificate. Old source locks remain untouched.
- `MATERIAL.krk.playable=false` and `KRK_GAMEPLAY_RELEASED=false`.
  No production deployment is claimed.

## Still needed for full playable KRK

1. Verify final-head Lean compilation and actual axioms; record immutable
   source SHA and create a separate KRK11 provenance lock.
2. Cover every non-wall legal strong-turn position with exact executable,
   all-defender, progress-certified setup/axis transport into this wall
   domain, not a search or guess.
3. Handle weak-to-move starts and the proved safe-rook versus capture/
   stalemate draw partition. Keep the user's arranged position and side.
4. Build one globally total JS selector with legal full adversarial
   checkmate games in both colours, both turns and all proof frames.
5. Run Node, source locks, phase-domain and Chromium Maths/Engine QA.
   Release only when the owner-authorised complete winning strategy is
   actually certified. **Defer 50-move/history scope** explicitly rather
   than misrepresenting it as verified; any mathematical-mode game must
   disclose the rule limitation.
