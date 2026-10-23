import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ENGINE_OPTIONS,engineById,parseBestmove,parseScore,captureSummary} from '../src/arena-utils.js';
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

test('both engines use finite analysis commands, especially Lozza',()=>{
  for(const spec of ENGINE_OPTIONS)assert.match(spec.search,/movetime\s+\d+/);
  assert.match(engineById('lozza').search,/depth\s+4/);
});
test('captured-piece counters track both sides and material differential',()=>{
  const moves=[
    {color:'w',captured:'p'},{color:'w',captured:'q'},
    {color:'b',captured:'n'},{color:'w',captured:'p'},
    {color:'b',captured:'r'},{color:'w'}
  ];
  const c=captureSummary(moves);
  assert.deepEqual(c.w.pieces,['bQ','bP','bP']);
  assert.deepEqual(c.b.pieces,['wR','wN']);
  assert.equal(c.w.value,11);
  assert.equal(c.b.value,8);
  assert.equal(c.w.advantage,3);
  assert.equal(c.b.advantage,0);
  assert.deepEqual(captureSummary([]).w,{pieces:[],value:0,advantage:0});
});
test('arena has responsive viewport-height limits and spectator capture rows',()=>{
  const css=readFileSync('src/styles.css','utf8');
  const app=readFileSync('src/arena-app.js','utf8');
  assert.match(css,/\.arena-shell \.board-frame\s*\{[^}]*100dvh/s);
  assert.match(app,/playerStrip\(upper,captured\)/);
  assert.match(app,/playerStrip\(lower,captured\)/);
  assert.match(app,/this\.worker\.postMessage\('stop'\)/);
});

test('UCI workers initialise a new game before search (Lozza requires it)',()=>{
  const app=readFileSync('src/arena-app.js','utf8');
  const atUci=app.indexOf("if(line==='uciok')");
  const atNew=app.indexOf("this.worker.postMessage('ucinewgame')",atUci);
  const atReady=app.indexOf("this.worker.postMessage('isready')",atUci);
  assert.ok(atUci>=0&&atUci<atNew&&atNew<atReady);
});

test('human mode supports both colours, legal moves, promotion choice and undo',()=>{
  const app=readFileSync('src/arena-app.js','utf8');
  for(const id of ['arena-match','arena-human-colour','arena-opponent','arena-start-human','arena-undo'])
    assert.ok(app.includes(id));
  assert.match(app,/game\.moves\(\{square:from,verbose:true\}\)/);
  assert.match(app,/commitPlayerMove\(/);
  assert.match(app,/game\.undo\(/);
  assert.match(app,/promotion\.choices/);
  assert.match(app,/if\(playerSide==='b'\)void engineRespond\(\)/);
  assert.match(app,/pointerup/);
});
