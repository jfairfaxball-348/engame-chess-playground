# Endgame Chess Playground

An independent, minimal browser chess playground inspired by **frozen mathematical endgame results** from [engame-chess](https://github.com/jfairfaxball-348/engame-chess).

**This is a separate implementation, not an extension of the research proof system.** It never fetches from the research repository at runtime, uses no chess engine or tablebase, and does not import Lean modules. The research project's UWS (ultra-weak solution) objectives, frozen artifacts, governance and next-session schedule are unaffected.

## Run locally / Vercel

Node 20+; no npm dependencies, API keys, secrets, subscriptions or backend.

```sh
npm run dev       # http://localhost:3000
npm test          # rules and engine tests
npm run check     # JavaScript syntax checks
npm run build     # static dist/ ready for Vercel
```

Vercel: **New Project → Import Git Repository → `jfairfaxball-348/engame-chess-playground`**. Root directory `/`; Framework: Other; Build command: `npm run build`; Output directory: `dist` (also defined in `vercel.json`). Git integration deploys future `main` changes automatically. No environment variables.

## Using the app

1. Choose one of the **locally implemented** classes: K vs K, K+B vs K, K+N vs K, or K+R vs K.
2. Select your colour and side to move; use the piece palette to put exactly the required material anywhere on the board.
3. **Start playing** after a static-legality check. The board flips when playing Black. Choose a piece then a highlighted legal destination; the adversarial engine always plays the opposite colour.
4. Return to the editor, reset, or choose another class. Move history displays all plies.

The validator checks legal local geometry (king separation, side-who-just-moved cannot be in check, and exactly the prescribed material). It **does not certify retrograde reachability from the standard chess initial position**. Such a certificate is intentionally out of scope for the first UI.

## Honesty about proof / engine status

| Material | Frozen mathematical source | What the playground does | Status of LIVE move selection |
| --- | --- | --- | --- |
| K vs K | EC-T0003 | First legal move, independent of scoring | Dead-position theorem; no strategy needed |
| K+B vs K | EC-T0004 | First legal move, independent of scoring | Dead-position theorem; no strategy needed |
| K+N vs K | EC-T0005 | First legal move, independent of scoring | Dead-position theorem; no strategy needed |
| K+R vs K | EC-T0019 | Individual source-anchored construction moves, followed by local heuristic fallback when no construction matches | **Partially proof-guided; complete selector NOT formalised/verified** |

The first three material classes are **immediately drawn under FIDE Article 5.2.2**. The UI deliberately suspends that automatic termination in *mathematical exploration mode* so pieces can be moved and the geometry observed. A bishop or knight can be captured and the result is still a dead king-only position. For play demonstrations, the static state starts at a halfmove counter of 0; fivefold repetition and 75-move automatic draw termination are simulated, but real prior history is not available. Do not mistake exploration for a normal FIDE game.

The engine displays the **rule and provenance of every engine move**. `proof-pattern` means we reimplemented a concrete geometric witness from a frozen lemma, **not** that the entire JavaScript selector is a verified Lean strategy. `experimental-heuristic` means no reimplemented proof-construction rule matched and ordinary independent minimax was used. See [S002 fidelity audit](docs/S002_MOVE_FIDELITY_AUDIT.md) and [local source-pinned rules](src/proof-policy.js). The rules are pegged to EC-T0019 proof-source commit `4acc3e8638a916f329788d4c2b5f0db6f2c9bf67`; they never fetch this code at runtime.\n\nThe frozen KRK result is a **clock-free forcing theorem subject to its exact hypotheses**. It establishes existence of winning play against all legal replies, not an executable selector for the winning move, nor FIDE halfmove/repetition-history parity. The playground's move-selection heuristic may make errors or fail to force mate. The code must never claim otherwise. No lookup of Syzygy or any chess database is permitted.

## Architecture and programme boundaries

- `src/chess.js`: local rules/movement/attack maps, legality, game outcomes, move history.
- `src/proof-policy.js`: individually source-anchored KRK geometric witness patterns, with precise rule identifiers; still an unverified JavaScript implementation.\n- `src/engine.js`: delegates first to local proof patterns, then exposes an explicitly experimental heuristic fallback.
- `src/app.js`: single-page interactive editor/play UI.
- `src/styles.css`: responsive board / panel styles.
- `test/chess.test.js`: Node builtin tests including proof-witness controls, policy provenance, adversarial samples and offline-only import checks.\n- `.github/workflows/check.yml`: GitHub Actions gate for tests, JavaScript checks and production build.
- `docs/ROADMAP.md`: staged development and proof-fidelity ladder.
- `NEXT_SESSION.md`: installed handover, separate from the UWS research repo.

No external script/CDN, no accounts, tracking, model API or runtime network lookups. All game logic runs in the browser. The MIT licence is in `LICENSE`.
