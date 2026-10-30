> **Update 29 October 2026:** The actual connected Cloudflare project shown by
> the owner's build logs is a **Worker using Workers Builds**, not a Pages Git
> project. This earlier Pages setup is not the active deployment path. See
> [Cloudflare Workers deployment and fix](CLOUDFLARE_WORKERS_DEPLOY.md).
>
# Cloudflare Pages — Chess Playground deployment handoff

**Prepared 29 October 2026; Cloudflare account connection and first production
deployment NOT yet performed.** Vercel is the existing live provider until a
different deployment is actually verified. This is an infrastructure task;
the proof-derived Maths release gates and independent browser engines remain
unchanged.

## Why Pages

Chess Playground builds to a pure static `dist/` directory, containing
the Maths app, independent Engine app, chess.js vendor file, Stockfish 19 Lite
JavaScript/WebAssembly and Lozza. No remote server API or secret is needed to
run either existing app. `npm run build` performs the file copy, and
`node scripts/verify-pages-output.mjs` checks the expected static assets.
This is compatible with Cloudflare Pages Git integration.

## Account owner: one-time GitHub authorisation

1. Open https://dash.cloudflare.com/ and sign in or create a Cloudflare account.
2. Open **Workers & Pages → Create application → Pages → Import an existing Git repository**.
   If Cloudflare presents a slightly different creation menu, select **Pages**
   and its **GitHub-connected** creation route, not a Worker or Direct Upload.
3. Authorize/install the Cloudflare Pages GitHub app. Prefer granting access
   only to **jfairfaxball-348/engame-chess-playground**, rather than all repos.
   This authorisation cannot be performed by committing code to GitHub.
4. Select the repository and enter these settings:

   | Setting | Value |
   | --- | --- |
   | Project name | `engame-chess-playground` (subject to available Pages name) |
   | Production branch | `main` |
   | Framework preset | `None` |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Root directory | repository root; leave blank |
   | Environment variable | `NODE_VERSION=22` |
   | Build secret/API token | none needed |
   | Functions/backend | none |

5. Select **Save and Deploy**. Cloudflare will provide the actual production
   `*.pages.dev` URL after the first successful build. Do not manufacture a
   hostname from the requested name: the name or build may differ.
6. In **Settings → Builds → Branch control**, leave automatic production
   builds enabled on `main`. For conservative free-tier usage, set preview
   branches to **None** unless previews are wanted.

## Release acceptance and rollback

- Confirm that the exact latest merged `main` SHA appears on the Pages
  deployment record; a successful GitHub test alone does not mean deployed.
- On the actual Cloudflare URL, visit both Maths Endgame and Engine Playground.
  Check that all CSS and imported JS load and that the `.wasm` engine loads.
- Test Stockfish Lite and Lozza from either colour, and Maths K/K, K+B/K and
  K+N/K. Confirm KRK still obeys `KRK_GAMEPLAY_RELEASED=false`.
- Re-run mobile/responsive checks in a browser and check for 404/CORS/MIME
  failures in the browser console, especially `/engines/*.wasm`.
- Keep Vercel available as rollback until Cloudflare passes those checks.
  Only after owner approval should the Vercel Git integration be disabled;
  do not break the existing public domain during migration.
- Every merge to `main` will trigger an automatic Cloudflare Pages build
  **after the Git integration is connected**. Development can continue with
  GitHub Node/Chromium CI regardless of hosting availability.

Official documentation:
- https://developers.cloudflare.com/pages/get-started/git-integration/
- https://developers.cloudflare.com/pages/configuration/git-integration/
- https://developers.cloudflare.com/pages/configuration/build-configuration/

No `wrangler.toml` is required for this Git-connected static site. Avoid
adding one until there is a specific Pages configuration requirement; a
Wrangler configuration can override settings in the dashboard.
