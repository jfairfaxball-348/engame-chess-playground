# S004 — UI/browser QA and accessibility engineering closeout

Date: 2026-10-19. Scope: **Chess Playground only**. No new chess mathematics, no KRK strategy, no engine dependency.

## Inputs and evidence

- The owner reported that the visually revised S003 board looked good in their browser. This is a useful **manual appearance acceptance**, not proof of mouse/touch/keyboard behaviour on every device.
- Inspected active S003 UI, geometry helper, local rules, engine, node unit tests, workflow, README and binding AGENTS.
- Found a pre-existing CI failure: the external-engine import assertion incorrectly matched the CSS class string `last-from` in `src/app.js`, despite no import. Corrected the regex to match actual `import ... from` statements only.

## Code changes

- `95fbb94e`: preserve focus by re-focusing equivalent square/palette/control after a full render; drop the stale 350 ms suppression timer in favour of consuming only an immediately generated synthetic click after a completed drag. A new pointerdown clears stale suppression; pointercancel removes any ghost and permits the next real click.
- `dfd3c582`: visible inset keyboard focus on board squares; hidden yet persistent polite live status.
- `dc80119d`: executable Chromium integration runner `scripts/browser-qa.mjs`, evaluating 64 button rectangles and 1:1 board plus interaction scenarios (click, drag, illegal/outside, pointercancel, focus, editor and mobile touchscreen drag).
- `33f23caf`: GitHub Actions workflow runs S004 Chromium QA with a temporary Playwright install after unit/check/build. Shipped site still has no package dependencies.
- `2b515840`: repair unrelated historical false-positive test that blocked the previous S003 CI run.

## Verification status at closeout

The old S003 GitHub Actions run #30 completed **failure** on the CSS `last-from` false positive; this is the defect fixed in S004. New S004 GitHub Actions attempts, e.g. [run #35](https://github.com/jfairfaxball-348/engame-chess-playground/actions/runs/39285471688), were **queued** when inspected. Thus there was **no observed successful `npm test`, `npm run check`, `npm run build`, or Chromium run on the post-fix main branch at closeout**. These checks are automated, but their outcome must be inspected and any failures fixed first in S005. The assistant did not control or measure the owner's browser, and cannot claim Chrome/Android/pen verification or successful live Vercel redeployment.

Developer-reproducible commands:

```sh
npm test
npm run check
npm run build
npm install --no-save --no-package-lock playwright
npx playwright install --with-deps chromium
node scripts/browser-qa.mjs
```

The Chromium runner checks 320, 360, 390, 768 and 1280 CSS px widths and editor/black-orientation/keyboard/gesture actions. Browser engines outside Chromium (Firefox, Safari/WebKit), physical Android devices, pen hardware and live deployment have not been independently verified.

## Release integrity

`MATERIAL.krk.playable` remains `false`; `newGame('krk')` throws; `chooseDecision` returns null for KRK; released dead-position demonstrations still use only local legal move enumeration. Source code does not import an external playing engine or query parent research at runtime.

## Next

Run the complete installed **S005** prompt in `NEXT_SESSION.md`, starting with the unresolved CI/browser evidence gate before further UI improvements.
