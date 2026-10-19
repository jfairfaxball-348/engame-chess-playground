# Local development rules

- Work **only** in `jfairfaxball-348/engame-chess-playground` unless the owner explicitly authorises another repository.
- Main research source `jfairfaxball-348/engame-chess` is read-only reference material, never a code/runtime dependency. Its proof, freeze and UWS workflows must not be affected.
- The playground engine must run locally, without tablebases, Stockfish, external engines, runtime GitHub requests, or model APIs.
- Distinguish logically proved outcome, locally checked implementation, experimental heuristic, and fully verified executable strategy. No badge or explanation should collapse those statuses.
- A new material class is only announced as source-frozen when the main repository has independently frozen that result. This repo reimplements rather than imports it.
- Keep sessions practical, tests reproducible, and next-session instructions complete. No obligation to enforce the parent research project's intensive theorem-freeze protocol here.
