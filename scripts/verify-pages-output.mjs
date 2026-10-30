/**
 * Provider-independent static hosting readiness check.
 *
 * Run after `npm run build`. This checks only files present in the deployable
 * dist/ directory: it is NOT a claim that Cloudflare has connected, built,
 * served, or externally browser-tested the site.
 */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = 'dist';
const mustExist = [
  'index.html',
  'src/maths-app.js',
  'src/arena-app.js',
  'src/maths.css',
  'src/styles.css',
  'vendor/chess.js',
  'engines/stockfish-19-lite-single.js',
  'engines/stockfish-19-lite-single.wasm',
  'engines/lozza.js'
];
for (const file of mustExist) {
  const path = join(root, file);
  const stat = statSync(path, { throwIfNoEntry: false });
  assert.ok(stat?.isFile() && stat.size > 0, `Missing or empty static deployment asset: ${file}`);
}
const html = readFileSync(join(root, 'index.html'), 'utf8');
for (const path of ['/src/maths-app.js', '/src/arena-app.js', '/src/styles.css', '/src/maths.css']) {
  assert.ok(html.includes(path), `Static HTML entry does not reference ${path}`);
}

// Workers Builds must upload only compiled browser assets; do not fall back
// to Wrangler's interactive auto-configuration (which scanned node_modules/).
const wrangler = JSON.parse(readFileSync('wrangler.jsonc', 'utf8'));
assert.equal(wrangler.name, 'engame-chess-playground');
assert.equal(wrangler.assets?.directory, './dist', 'Cloudflare Workers must deploy only dist/, never the repository root');
assert.equal(wrangler.main, undefined, 'This site is static; no Worker entrypoint is required');

let assetCount = 0;
const maxAssetBytes = 25 * 1024 * 1024;
function verifySize(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) verifySize(path);
    else if (entry.isFile()) {
      assetCount++;
      assert.ok(statSync(path).size <= maxAssetBytes, `Cloudflare Worker asset exceeds 25 MiB: ${path}`);
    }
  }
}
verifySize(root);
console.log(`Static hosting package verified: ${mustExist.length} nonempty required assets, ${assetCount} total files within 25 MiB, Maths and Engine entrypoints, Cloudflare Workers points to ./dist.`);
