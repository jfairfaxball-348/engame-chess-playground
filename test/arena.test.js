import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ENGINE_OPTIONS,engineById,parseBestmove,parseScore} from '../src/arena-utils.js';
test('two real, distinct browser UCI engines are selectable by both colours',()=>{
  assert.deepEqual(ENGINE_OPTIONS.map(s=>s.id),['stockfish','lozza']);
  assert.ok(ENGINE_OPTIONS.every(s=>s.url.startsWith('/engines/')&&s.search.startsWith('go ')));
  assert.equal(engineById('stockfish').name,'Stockfish 19 Lite');
  assert.equal(engineById('missing'),undefined);
});
test('UCI bestmove parses promotion and rejects invalid engine output',()=>{
  assert.deepEqual(parseBestmove('bestmove e2e4 ponder e7e5'),{from:'e2',to:'e4'});
  assert.deepEqual(parseBestmove('bestmove a7a8q'),{from:'a7',to:'a8',promotion:'q'});
  assert.equal(parseBestmove('bestmove (none)'),null);
  assert.equal(parseBestmove('info depth 5'),null);
});
test('UCI score is from White perspective',()=>{
  assert.equal(parseScore('info depth 9 score cp 122 nodes 55','w'),'1.22');
  assert.equal(parseScore('info depth 9 score cp 122 nodes 55','b'),'-1.22');
  assert.equal(parseScore('info depth 9 score mate -3','b'),'M3');
});
test('maths and engine playgrounds are isolated in separate tabs',()=>{
  const page=readFileSync('index.html','utf8');
  const arena=readFileSync('src/arena-app.js','utf8');
  assert.match(page,/id="tab-maths"/);
  assert.match(page,/id="tab-arena"/);
  assert.match(page,/id="engine-playground"[^>]*hidden/);
  assert.doesNotMatch(arena,/from '.\/chess\.js'|from '.\/engine\.js'/);
  assert.match(arena,/new Worker\(/);
  assert.match(arena,/game\.move\(/);
});
