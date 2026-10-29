# Cloudflare Workers — static Chess Playground deployment

**29 October 2026.** The owner connected the repository to Cloudflare Workers
Builds and supplied the initial deployment log. This is a **Worker serving
static assets**, not a Git-connected Cloudflare Pages project. It is appropriate
for this static application. **No confirmed public Workers deployment URL has
yet been verified.** The existing Vercel site is rollback.

## Failure observed, accurately diagnosed

At `2026-10-29T15:44:17Z`, `npm run build` successfully produced `dist/`.
At `15:44:18Z`, Workers Builds ran its default `npx wrangler deploy`.
Without any committed Wrangler configuration, Wrangler offered to initialise a
new project and (non-interactively) accepted an `assets.directory` of `.`.
Consequently it traversed 2,254 files in the **repository root** including
`node_modules/workerd/bin/workerd` (137 MiB). Workers static assets accept
files up to 25 MiB, so deploy failed. This was NOT a failed chess app build,
a Vercel quota failure, nor an oversized playable chess-engine asset.

The remedy is the committed `wrangler.jsonc`:
```json
{
  "name": "engame-chess-playground",
  "compatibility_date": "2026-10-29",
  "assets": { "directory": "./dist" }
}
```
Keep the Cloudflare build command `npm run build`, deploy command
`npx wrangler deploy`, root repository directory, and production branch
`main`. Workers Builds should read the tracked Wrangler config instead of
initiating a fresh setup, and upload **only the build output**. No new Cloudflare
account permission, API token or dynamic Worker implementation is needed for
the previously connected Worker.

## Verification and rollout

1. GitHub CI runs `npm test`, frozen KRK proof-source verification, phase
   audit, syntax checks, `npm run build`, a static-output verifier including
   the Workers asset directory and 25 MiB-per-file limit, and Maths/Engine
   Chromium browser smoke tests.
2. After this fix reaches `main`, inspect the **Cloudflare Workers** build
   triggered by that merge (or retry if the integration does not automatically
   trigger). Ensure `wrangler deploy` loads the checked-in configuration,
   does **not** prompt to initialise or count `node_modules`, and completes.
3. Record the **actual** resulting URL from the Cloudflare UI. Since this is
   Workers, expect a `*.workers.dev` route or custom domain, NOT necessarily
   `*.pages.dev`. Do not guess an address from the Worker name.
4. Browse the live URL, checking Maths K/K, K+B/K and K+N/K; check both
   Stockfish 19 Lite and Lozza in Engine Playground, including WebAssembly
   and browser worker loading. Maths KRK remains proof-gated and not playable
   until its global policy is certified.
5. Keep Vercel available until the new host passes these checks. If there
   are further errors, capture the **new** Cloudflare build/deploy logs and
   correct their exact failure; do not disable release gates for convenience.

## Cloudflare documentation

- [Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)
- [Wrangler static assets directory](https://developers.cloudflare.com/workers/static-assets/binding/)
- [Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)

The repository remains an ordinary static build and can also be deployed using
Cloudflare Pages later, but it is not necessary to migrate a second time.
