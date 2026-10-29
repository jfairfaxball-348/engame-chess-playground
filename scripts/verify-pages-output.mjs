/**
 * Provider-independent static hosting readiness check.
 *
 * Run after `npm run build`. This checks only files present in the deployable
 * dist/ directory: it is NOT a claim that Cloudflare has connected, built,
 * served, or externally browser-tested the site.
 */
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
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
console.log(`Static hosting package verified: ${mustExist.length} nonempty assets, Maths and Engine entrypoints.`);
