# NEXT SESSION — S002: Adversarial playground audit and live Vercel check

When the owner says **run next session** in the playground project, execute this prompt. Do not access or modify the parent endgame-chess research repository except to read public frozen theorem statements if specifically necessary. Keep the session lightweight: build, test, commit and push changes in THIS repository only.

1. Inspect latest `main`, the README, `docs/ROADMAP.md`, game logic and tests.
2. Check browser UI interactivity, position-editor flows, both colours, moves, engine reply, reset and small-screen usability. Fix blockers.
3. Audit static legality, king adjacency, nonmoving side in check, rook capture into K vs K, attack geometry, mate/stalemate, the artificial halfmove/history counters and repetition. Add regression tests.
4. Verify Vercel deployment status if one exists. If Git integration has not been configured, guide the owner to import THIS repo into Vercel; do not invent a deployment URL.
5. Keep the rook strategy explicitly experimental. Start planning a separate geometric policy extraction; do not claim it is guaranteed.
6. Commit/push the complete changes, report tests and live deployment evidence, then install the full next-session prompt.
