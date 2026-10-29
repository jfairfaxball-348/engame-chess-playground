# Deferred independent Engine Playground workshop — S011

This is the **original** `NEXT_SESSION.md` preserved verbatim when KRK02 was prioritised on 29 October 2026. It is deferred, not cancelled. Run it after the owner explicitly selects the Engine Playground workshop again. Do not let this engine session override the next Maths KRK session, import any external engine into Maths, or change the KRK proof gate.

---

# NEXT SESSION — S011: Local UCI companion feasibility spike

Owner's S010 workshop findings: [docs/AI_RESEARCH_WORKSHOP.md](docs/AI_RESEARCH_WORKSHOP.md). "Run next session" authorises implementation.

Scope: **independent Engine Playground only**. Preserve Maths Endgame, immutable upstream mathematical gates and KRK hold. Keep the session pragmatic; no governance expansion.

1. **Machine inventory first:** capture actual Windows CPU/core count, RAM, GPU/VRAM, disk and OS using the commands in the S010 workshop. Record native Stockfish 19 bench numbers; only then size workers/training experiments.
2. Build a minimal secure loopback-only UCI companion (Python + python-chess is the leading candidate). Discover locally registered, explicitly allowlisted engines without rebuilding frontend. Two independent UCI sessions; support a tiny Python UCI fixture for deterministic tests.
3. Prove connectivity from deployed HTTPS page in Chrome to localhost **with modern LNA user gesture/permission**. Test WebSocket mixed-content behavior, Origin/token authentication and failure messages; no blanket LAN listeners, arbitrary executable commands, privileged paths or publicly exposed credentials. Try Firefox and maintain a viable same-origin local UI fallback.
4. Adapt the Engine Playground only: choose local engine for White/Black, surface depth/nodes/time/PV/evaluation, handle stop/restart/worker crash/stale IDs. Preserve existing Stockfish Lite and Lozza browser workers.
5. Verify 20-ply native/local fixtures; two simultaneous engines, illegal move rejection, timeouts and denied-permission security negative tests, existing tests/build/browser QA. Separate tests **actually run** from tests proposed.
6. Prepare an experimental schema for FEN + full move history + PGN, goal predicates, position-family splits and compute logging. **Do not start a large model training run** without throughput benchmarks.

Success = a secure, reproducible connection and discovery/telemetry proof, or a documented falsification and working local-first fallback. New ML work begins after S011 hardware and bridge outcomes, following S012 research experiment in S010 file. Commit code/results, include full subsequent short prompt.
