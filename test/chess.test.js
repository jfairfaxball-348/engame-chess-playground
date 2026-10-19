import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  MATERIAL, makeBoard, initialSetup, validateSetup, squareAt, attacks,
  legalMoves, newGame, play, applyMove, outcome, distance, findKing, positionKey
} from '../src/chess.js';
import { chooseMove, chooseDecision, strategyLabel } from '../src/engine.js';
const sq=squareAt;

test('only upstream-released dead classes are playable; KRK stays gated',()=>{
  assert.deepEqual(Object.keys(MATERIAL),['kk','kbk','knk','krk']);
  assert.deepEqual(Object.entries(MATERIAL).filter(([,m])=>m.playable).map(([id])=>id),['kk','kbk','knk']);
  assert.equal(MATERIAL.krk.playable,false);
});

test('default arrangements satisfy local geometry for colours and turns',()=>{
  for(const mat of Object.keys(MATERIAL))for(const stronger of ['w','b'])for(const turn of ['w','b']){
    const board=initialSetup(mat,stronger);
    assert.equal(validateSetup(board,mat,turn),null,mat+'/'+stronger+'/'+turn);
    assert.ok(distance(findKing(board,'w'),findKing(board,'b'))>=2);
  }
});
test('adjacent kings are invalid',()=>{
  const b=makeBoard();b[sq(4,4)]='wK';b[sq(5,4)]='bK';
  assert.match(validateSetup(b,'kk','w'),/Kings/);
});
test('the nonmoving side cannot remain in check',()=>{
  const b=makeBoard();b[sq(4,0)]='wK';b[sq(4,7)]='bK';b[sq(4,3)]='wR';
  assert.equal(validateSetup(b,'krk','b'),null);
  assert.match(validateSetup(b,'krk','w'),/still in check/);
});
test('knight movement and boundaries',()=>{
  const b=makeBoard();b[sq(4,0)]='wK';b[sq(4,7)]='bK';b[sq(1,5)]='wN';
  assert.equal(attacks(b,'w',sq(0,7)),true);
  assert.equal(attacks(b,'w',sq(1,7)),false);
  assert.ok(legalMoves(b,'w').every(m=>m.to>=0&&m.to<64));
});
test('slider cannot attack through its own king',()=>{
  const b=makeBoard();b[sq(0,0)]='wR';b[sq(0,2)]='wK';b[sq(0,7)]='bK';
  assert.equal(attacks(b,'w',sq(0,7)),false);
});
test('geometry retains safe rook capture into king-only position for future reuse',()=>{
  const b=makeBoard();b[sq(4,0)]='wK';b[sq(4,5)]='wR';b[sq(4,6)]='bK';
  assert.equal(validateSetup(b,'krk','b'),null);
  const capture=legalMoves(b,'b').find(m=>m.to===sq(4,5));assert.ok(capture);
  const next=applyMove(b,capture);
  assert.equal(next[sq(4,5)],'bK');
  assert.deepEqual(next.filter(Boolean).sort(),['bK','wK']);
});
test('kings cannot be captured',()=>{
  const b=makeBoard();b[sq(4,0)]='wK';b[sq(4,7)]='bK';b[sq(4,6)]='wR';
  assert.ok(!legalMoves(b,'w').some(m=>m.to===sq(4,7)));
});
test('KRK cannot start a match, even through the game API',()=>{
  const board=initialSetup('krk');
  assert.throws(()=>newGame(board,'w','krk'),/not released/);
  assert.equal(chooseDecision({board,turn:'w',material:'krk'},'w'),null);
  assert.equal(chooseMove({board,turn:'w',material:'krk'},'w'),null);
  assert.match(strategyLabel('krk'),/Unavailable/);
});
test('engine always selects a legal move with correct frozen provenance',()=>{
  for(const mat of ['kk','kbk','knk'])for(const computer of ['w','b']){
    const state=newGame(initialSetup(mat),computer,mat),choice=chooseDecision(state,computer);
    assert.ok(choice);
    assert.equal(choice.origin,'dead-position-choice');
    assert.equal(choice.rule,MATERIAL[mat].theorem);
    assert.deepEqual(choice.move,legalMoves(state.board,computer)[0]);
    assert.deepEqual(chooseMove(state,computer),choice.move);
    assert.equal(chooseDecision(state,computer==='w'?'b':'w'),null);
  }
});
test('a full legal demonstration move updates state and turn',()=>{
  const g=newGame(initialSetup('kbk'),'w','kbk'),m=chooseMove(g,'w'),next=play(g,m);
  assert.equal(next.turn,'b');
  assert.equal(next.log.length,1);
  assert.equal(next.history.length,2);
});
test('75-move / fivefold simulation remains explicit',()=>{
  const board=initialSetup('kk'),key=positionKey(board,'w');
  assert.equal(outcome(board,'w',[],150).kind,'75-move');
  assert.equal(outcome(board,'w',Array(5).fill(key),0).kind,'fivefold');
});
test('rook checkmate geometry can be tested without releasing KRK for play',()=>{
  const b=makeBoard();b[sq(2,6)]='wK';b[sq(0,0)]='wR';b[sq(0,7)]='bK';
  assert.equal(validateSetup(b,'krk','b'),null);
  assert.deepEqual(outcome(b,'b'),{kind:'mate',winner:'w'});
});
test('client has no external engine or unfinished proof-policy in active runtime',()=>{
  for(const file of ['src/chess.js','src/engine.js','src/app.js']){
    const content=readFileSync(file,'utf8');
    assert.doesNotMatch(content,/\bfetch\s*\(|\bWebSocket\s*\(|\bimport\s*\(/,file);
    assert.doesNotMatch(content,/^\s*import\b[^;\n]*\bfrom\s*['"](?!\.)/gm,file);
  }
  const engine=readFileSync('src/engine.js','utf8');
  assert.doesNotMatch(engine,/from\s*['"]\.\/proof-policy|function\s+rookEvaluation|function\s+minimax|Stockfish\s*\(/);
  const app=readFileSync('src/app.js','utf8');
  assert.match(app,/disabled aria-disabled="true"/);
  const pkg=JSON.parse(readFileSync('package.json','utf8'));
  assert.equal(pkg.dependencies,undefined);
  assert.equal(pkg.devDependencies,undefined);
});
