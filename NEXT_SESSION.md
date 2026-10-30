# S022 — finish adversarially playable KRK/KQK, then switch to full parity

**Next execution session after S021.** Owner's binding two-stage plan
is in `AGENTS.md` (top), `docs/KQK21_ADVERSARIAL_AUDIT.md`.

## Mission and priority

Stage A: **complete the source-derived KRK and KQK winning strategies
in the Maths Playground's currently simplified playable mode.**
"Playable" means correct placement, either king colour and side to move,
lawful moves, and an actual winning continuation to mate against
every legal defender choice from the intended legal root domain — not
just first-action selection. A failing lineage stays explicitly
experimental and unsupported; never manufacture completeness.

Stage B: **the instant BOTH simplified strategies are complete, return
to KRK and KQK to build the same full mathematical derivations,
position-aware proof equations/working, and FIDE clock/history/terminal
outcome parity already enjoyed by KK/KBK/KNK.** The Stage A shortcut
is temporary. Do not divert to KPK or other material classes or
experimental engine research. Never remove any current KK/KBK/KNK
worked mathematical panels in setup or play.

## S021 evidence and starting point

- S020 main CI `41047939950` had 898/898 sampled source-selected
  strong-turn legal roots, 3827/3827 immediate defender continuations,
  32/32 first-legal-defender full games ending in mate. **Bounded
  fixed-defender sampling, not universal playability.**
- S021 introduces `npm run audit:kqk-adversarial`: seeded source-family
  strata, strong- and weak-to-move roots and all weak replies at every
  visited ply, with explicit unsupported/capture/stalemate/cycle/caps.
  Initial CI run 41049858581: 56 legal roots; 26 all-replies-mate,
  1 unsupported, 29 inconclusive; 35,879 visited states / 18,504
  visited legal weak replies, cap 1,200 nodes and 48 rounds per root.
  S021 source-backed correction resolves the previously unsupported
  Black Ka8 Qa6 / White Kc7 root with the exact Lean
  SameRankEntry.backrank_entry king-to-weak-file move. Check the
  latest post-fix exact-head CI JSON; the many capped roots require
  deeper counterexample discovery and continuation audits.
- KRK mate-tree, restoration and all-root audits remain available.
- Frozen Lean source EC-T0050 KQK `c72365a8...`; KRK source locks
  retained. No runtime parent dependency.

## Execute (not just report)

1. Read *latest* main/PR CI and the full adversarial KQK JSON from
   `audit:kqk-adversarial`; reconstruct earliest concrete failed path
   and identify its exact first missing/mis-translated frozen Lean rule.
   Do not count caps as successful mates.
2. Run the **same all-defender falsification for KRK** using the existing
   source-phase mate-tree scripts; prioritize any missing or cyclic
   strategy from either material. Address the highest-impact missing
   source continuations with literal source-premised moves and
   strict position/phase tokens; do not promote partial strategies.
3. Expand KQK root selection beyond sampled start states (exhaustive
   fresh legal roots where feasible); include both strong colours,
   all eight source symmetries, weak-turn checked positions, capture,
   underpromotion not applicable, and full undo/restart/branch invariants.
   Test all defender replies beyond immediate second move.
4. Where an all-reply tree cannot be practically exhausted, report
   bounded scope and remaining counterexamples. A line cycling under
   adversarial play is NOT a completed winning strategy.
5. **When KQK and KRK both genuinely pass the simplified-mode global
   gameplay acceptance criteria, install the immediate Stage B
   session to restore mathematical working plus all chess
   terminal/history/clock rule fidelity for both**. Derivations must
   come from actual existing upstream Lean, not an invented "proof"
   of policy totality. Do not allow 50/75-move engineering to prevent
   first completing Stage A.
6. Run Node tests, syntax check, frozen-source verifier, build,
   KQK and KRK audits, Chromium Maths and independent Engines QA,
   exact-commit CI. Commit changes on branch; PR, merge and verify main
   and update this next-session prompt to measurable remaining work.

## Nonnegotiable

No Stockfish/Lozza, tablebase, generic minimax, arbitrary move or
first-legal fallback in Maths. Live source controller and test-only
adversarial audits are strictly separate. Keep KQK/KRK experimental
disclosures and certification booleans honest. Never regress existing
KK/KBK/KNK full worked explanations.
