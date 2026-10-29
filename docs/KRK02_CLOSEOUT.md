# KRK02 — staged-code closeout and KRK03 handoff (29 October 2026)

## Owner decision and what was actually achieved

On 29 October the owner explicitly requested **close out, commit, merge, push, fast-forward and install the next session as closing out KRK to be fully playable**. This authorises integration of the **inactive, tested partial extraction as engineering groundwork** into Playground `main`, not the release of an unproved KRK opponent. The owner’s long-standing *mathematically proof-derived* gameplay requirement remains binding.

### Last independently observed completed checks, BEFORE this closeout commit

- Mathematical importing branch [engame-chess PR #3](https://github.com/jfairfaxball-348/engame-chess/pull/3): full Lean build, forbidden-token gate and axiom inspection **passed**, [run #40886544904](https://github.com/jfairfaxball-348/engame-chess/actions/runs/40886544904), commit `c8a77755c69adc63ffee6e32eeeebdfa35b7bea4`.
- Playground staging [PR #4](https://github.com/jfairfaxball-348/engame-chess-playground/pull/4): **102 Node tests**, Maths and Engine Chromium browser QA **passed**, [run #40886756069](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/40886756069), commit `e8bb98d0e6ff9628fb1189a3f8387cf1b6f682ed`. Later head `11ca62094dd2f0402074b21c7f25ddc873fd5e17` also had completed successful [run #40887129078](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/40887129078). Verify the **final** integration head and `main` CI independently.
- This work implements exact **local** Lean witnesses: READY tempo, right/left protected cut, guarded king advance, column approach and opposition check/king ascent; the JavaScript equivalents stay isolated from the game loop. A cross-phase all-reply fixture covered 48 pivot replies, 288 guarded replies and 288 wall handoffs.
- Frozen original `engame-chess` proof files unchanged. Parent importing PR #3 retains a separate branch; its current mergeability must be audited against newer KQK mathematical `main` commits.

## Explicit non-release boundary

`src/krk-local-witness.js`: `KRK_GAMEPLAY_RELEASED = false`.

`src/maths-model.js`: every KRK `setupVerdict` has `canStart = false`. `MATERIAL.krk.playable` is false. The queen and pawn setup pieces remain unplayable. No complete `KRKChooseMove` has been proved, imported or exposed. No production KRK mate-playthrough has been verified.

## Concrete remaining formalisation

The frozen parent proofs show a fresh-clock winning classification and existence of mate within specified 93/97/98-ply bounds, but they do not automatically give a computable total move selector. Remaining obligations:

1. Finish **every legal-root** constructive setup case, including weak-to-move, attacked rook and chess terminals.
2. Turn `KRKCentral/{Column,Central,Positive,Back,BackEven,WaitEven,Restoration,ExitStep,Full,SmallCentral}` and related `KRKBox` proof branches into a **deterministic, all-reply** playable phase machine, especially the guarded-axis/column to final mate recursion.
3. Prove **global decreasing phase rank**, 93/97/98-ply root bound and original FIDE clock/repetition correctness; no cycles, hidden fallbacks or fresh-history resets.
4. Pin imported parent source and test JS bridge, full adversarial games, both orientations/colours and `main` CI/deployment **before** unlocking KRK.

## Closeout decision

- The Playground partial code may be **merged as dormant, feature-gated groundwork** after checks, because existing working games remain unchanged. This is **NOT** a KRK gameplay release. If merged, follow up with actual resulting main SHA and green CI; otherwise record why merge was not possible.
- Keep mathematical extraction PR #3 **open and unmerged** until its global proof/compatibility requirements are discharged. Do not equate local CI success with full executable strategy certification.
- Follow the newly installed [KRK03 session](../NEXT_SESSION.md) to make KRK *genuinely* fully playable. Previous instructions are archived at [KRK02B_SESSION_ARCHIVE.md](KRK02B_SESSION_ARCHIVE.md). KQK03 readiness and independent Engine tab are preserved.
