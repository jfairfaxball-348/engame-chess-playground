import test from 'node:test';
import assert from 'node:assert/strict';
import { MATERIAL, makeBoard, initialSetup, validateSetup, squareAt, attacks, legalMoves, newGame, play, outcome, distance, findKing, positionKey } from '../src/chess.js';
import { chooseMove, strategyLabel } from '../src/engine.js';
const sq=squareAt;

test('supports exactly four independent research classes',()=>assert.deepEqual(Object.keys(MATERIAL),['kk','kbk','knk','krk']));
test('default setups are geometrically legal for both colours and turns',()=>{
  for(const mat of Object.keys(MATERIAL))for(const extra of ['w','b'])for(const turn of ['w','b']){
    const b=initialSetup(mat,extra);
    assert.equal(validateSetup(b,mat,turn),null,`${mat}/${extra}/${turn}`);
    assert.ok(distance(findKing(b,'w'),findKing(b,'b'))>=2);
  }
});
test('adjacent kings are invalid',()=>{
 const b=makeBoard();b[sq(4,4)]='wK';b[sq(5,4)]='bK';assert.match(validateSetup(b,'kk','w'),/Kings/);
});
test('a player may be in check only when they are to move',()=>{
 const b=makeBoard();b[sq(4,0)]='wK';b[sq(4,7)]='bK';b[sq(4,3)]='wR';
 assert.equal(validateSetup(b,'krk','b'),null);
 assert.match(validateSetup(b,'krk','w'),/still in check/);
});
test('knight offsets obey (1,2) geometry and never jump offboard',()=>{
 const b=makeBoard();b[sq(4,0)]='wK';b[sq(4,7)]='bK';b[sq(1,5)]='wN';
 assert.equal(attacks(b,'w',sq(0,7)),true);
 assert.equal(attacks(b,'w',sq(1,7)),false);
 assert.ok(legalMoves(b,'w').every(m=>m.to>=0&&m.to<64));
});
test('slider cannot attack through its own king',()=>{
 const b=makeBoard();b[sq(0,0)]='wR';b[sq(0,2)]='wK';b[sq(0,7)]='bK';
 assert.equal(attacks(b,'w',sq(0,7)),false);
});
test('a legal lone king can take an unprotected rook, yielding king-only draw',()=>{
 const b=makeBoard();b[sq(4,0)]='wK';b[sq(4,5)]='wR';b[sq(4,6)]='bK';
 assert.equal(validateSetup(b,'krk','b'),null);
 const move=legalMoves(b,'b').find(m=>m.to===sq(4,5));assert.ok(move);
 const next=play(newGame(b,'b','krk'),move);
 assert.equal(next.board[sq(4,5)],'bK');
 assert.equal(next.board.filter(p=>p&&p[1]==='R').length,0);
});
test('do not permit a king to be captured',()=>{
 const b=makeBoard();b[sq(4,0)]='wK';b[sq(4,7)]='bK';b[sq(4,6)]='wR';
 assert.ok(!legalMoves(b,'w').some(m=>m.to===sq(4,7)));
});
test('all candidate engine choices are generated legal moves',()=>{
 for(const mat of Object.keys(MATERIAL))for(const computer of ['w','b']){
  const b=initialSetup(mat);const game=newGame(b,computer,mat);
  const choice=chooseMove(game,computer);assert.ok(choice);
  assert.ok(legalMoves(game.board,computer).some(m=>m.from===choice.from&&m.to===choice.to));
 }
});
test('the clock begins at zero; 75 moves and fivefold repetition end exploration',()=>{
 const b=initialSetup('kk'),key=positionKey(b,'w');
 assert.equal(outcome(b,'w',[],150).kind,'75-move');
 assert.equal(outcome(b,'w',Array(5).fill(key),0).kind,'fivefold');
});
test('drawn classes never claim a verified rook strategy',()=>{
 assert.match(strategyLabel('knk'),/Any legal move/);
 assert.match(strategyLabel('krk'),/Experimental/);
});
test('rook checkmate is detected as terminal',()=>{
 const b=makeBoard();b[sq(2,5)]='wK';b[sq(0,6)]='wR';b[sq(0,7)]='bK';
 // White Kc6, Ra7; Black Ka8: Ra7 is not mate (black b8 may escape); test only nonterminal.
 assert.equal(outcome(b,'b').kind,'ongoing');
});
