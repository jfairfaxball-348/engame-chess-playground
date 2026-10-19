# NEXT SESSION — S005: Player controls, editor ergonomics and accessible navigation

**Owner activation:** "run next session" means immediately execute S005 in **jfairfaxball-348/engame-chess-playground**. Read AGENTS.md, README.md, docs/ROADMAP.md, docs/S004_QA_REPORT.md, the complete active UI/engine source and existing tests. This is a practical webapp engineering session, not mathematical research. Do not modify the parent endgame-chess repo.

## Mandatory release boundaries

Playable K/K+B/K+N are demonstration classes with arbitrary legal choices justified by their completed dead-position theorems. **KRK remains disabled (MATERIAL.krk.playable=false)**. Do not import it until the upstream strategy is truly complete, proved, verified, frozen and expressly approved by the owner. No prebuilt chess engines, tablebases, remote runtime lookups, chess-solving heuristics or invented mathematical work.

## Priority order

1. **Finish S004 verification first.** Inspect the newest GitHub Actions run, correct any syntax/unit/browser failure in S004 `scripts/browser-qa.mjs`, run npm test, npm run check, npm run build and browser suite to green. On 320/360/390/768/1280 viewports verify stable 64-cell square geometry. Report actual commands, platform and evidence. Do not assert an unobserved Vercel redeploy succeeded.
2. **Keyboard board navigation.** Make the 8 × 8 grid practical without 64 Tab presses: arrow-key square movement that respects white/black orientation, Enter/Space activate selection and play, Escape cancels selection. Preserve sensible Tab stops and focus through game/computer rerenders. Keep clear per-square ARIA labels and live announcements for check, invalid moves, game end and edit validation.
3. **Human-friendly game controls.** Provide a clear "Restart from this setup" in addition to "Edit/new game", resetting the full game state/history and cancelling queued opponent turns. Assess a safe "Undo turn" (human move + engine response, or correct partial turn) with explicit deterministic state snapshots; do not implement if legality/history will be inconsistent. Never change engine decision policy.
4. **Editor ergonomics.** Improve piece palette labels and selected state, replacement/removal affordance, validation messages, first-to-move and black-colour orientation; provide a simple reverse-orientation control only if it stays consistent with play and does not swap chess colours. No illegal arrangement should start a game.
5. **History usability and visual refinement.** Present turns with clear player/engine separation and restrained last-move indicators, particularly mobile. Board size and 1:1 square geometry must remain invariant through controls, selection, history, resize and move changes. Keep main board visually dominant.
6. **Regression/integrity.** Extend executable browser tests for added controls and input modes. Assert that only approved material is playable, choosing KRK always fails, `chooseDecision('krk')` returns null, game decisions only come from the locally implemented released rules, and no third-party engine/network/tablebase code enters runtime. Run CI and (when observable) Vercel check.

## Exit and successor

Commit all scoped improvements to playground only; state exact SHAs, commands/results and untested environments. Update README and docs/ROADMAP.md. Install a full **S006** next-session prompt chosen from the largest remaining usability risk found during S005. Keep KRK on hold and do not set a speculative release date.
