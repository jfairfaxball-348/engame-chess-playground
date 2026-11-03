# S044 — close actual S043 source gaps, investigate KRK totality

## Verified S043 baseline for S044

[Run 41596372892](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/41596372892)
passed PR-head code at `29973f16589b3b02aeed2629e3cfdd06f26c3384`.
The 16 true fresh roots produced 82 first and 440 second legal
defender replies. Separating-rank: 8+40+240 independently
authenticated local first/second/third source actions; 0 unchecked.
Tight-above: 6+12+146 authenticated; 2+30+54 unchecked.
Neither family had a detected failed premise, missing source,
capture, nonmate or structural cycle; all 16 full trees capped at
100 nodes / 20 pairs. This is finite evidence, **not mate closure**.
The source sometimes omits `choice.frame` on nested continuation:
the exact real token frame, never a manufactured one, must be used
for independent verification. The final docs-only CI is separate.

**Execute**, do not merely suggest. First verify S043 PR-head and merged-main
Actions at their exact commit SHAs, including Node, source, build and
both Chromium suites, and record the actual S043 counters. Also verify
Cloudflare Worker deployment separately; green GitHub CI is not a deploy.

Start from AGENTS.md, docs/S042_FRESH_CASES_AND_KRK_OBLIGATION.md,
docs/S043_FRESH_SOURCE_AUTHENTICATION.md and live audit script output.
Pinned read-only Lean anchors: KQK EC-T0050
`c72365a8ba46f59114a2a77d9d38993f6a52df80`;
KRK EC-T0048 `2311abe71bc1a4eed47026feccd5ba5a0760d5bb`;
KRK executable `e7de0930fc61caeb11795cf3c10fde11e4774a40`.

1. Run the fresh-source audit at 8 roots/family with `--strict`
   and `--full`, then increase legal root and frame diversity at
   explicit finite budgets. Preserve both colours and all original
   source frames. Record exact root, full board, every legal first
   and second defender reply, exact nested token and selected theorem.
   Distinguish cross-frame unverified bridge, unknown named theorem,
   failed premise, missing action, capture, nonmate, structural
   cycle and resource cap as *different* categories.
2. Inspect the actual first unchecked named S043 source families
   (especially later BandRaise/other constructors), read their
   exact frozen Lean statements, and implement independent **full**
   source-premise and move-coordinate verification where genuinely
   supported. Do not credit a theorem from an unselected frame or
   extrapolate from a short sample. Add reproducible adversarial tests.
3. In KRK, replay the real S039 PREP(rank2)->central handoff and
   central/restoration cycles with original boards and full nested
   tokens. Compare prep_bound and restoration_bound at the pinned
   Lean executable SHA. Either identify a real frozen global
   all-reply termination/cross-phase rank theorem for this exact
   JS-compatible controller, or document the narrow upstream
   missing theorem with full premises and counterexample witness.
   Do not invent a decreasing measure or mistake an existential
   MateWithin proof for executable selector certification.
4. Preserve release behaviour: K/K, K+B/K and K+N/K full board-specific
   maths equations, proof references and history; experimental KRK/KQK
   plays and honest beta labelling; source-derived Maths selector only.
   No engine/minimax/tablebase/first-legal fallback. Stage B KRK/KQK
   maths and proper clocks/history begins once both Stage A strategies
   truly terminate against all defenders. Defer KPK and Engine.
5. Run npm test, npm run verify:krk-sources, all S035-S044 audits,
   KRK/KQK adversarial and rank audits, npm run check/build and both
   Chromium suites. PR-head CI must pass **before** merging; confirm
   main CI and live Worker separately. Commit, merge, fast-forward,
   record exact measured evidence and install S045 from real results.
