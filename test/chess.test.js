import test from 'node:test';
import assert from 'node:assert/strict';
import { MATERIAL, makeBoard, initialSetup, validateSetup, squareAt, attacks, legalMoves, newGame, play, applyMove, opposite, outcome, distance, findKing, positionKey } from '../src/chess.js';
import { chooseMove, chooseDecision, strategyLabel } from '../src/engine.js';
import { PROOF_SOURCE } from '../src/proof-policy.js';
import { readFileSync } from 'node:fs';
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
 const b=makeBoard();b[sq(2,6)]='wK';b[sq(0,0)]='wR';b[sq(0,7)]='bK';
 // White Kc7 and Ra1 versus Black Ka8: rook gives check along a-file; king guards b8.
 assert.equal(validateSetup(b,'krk','b'),null);
 assert.deepEqual(outcome(b,'b'),{kind:'mate',winner:'w'});
});

test('proof source is pinned to the frozen KRK verification commit',()=>{
 assert.equal(PROOF_SOURCE.theorem,'EC-T0019');
 assert.equal(PROOF_SOURCE.commit,'4acc3e8638a916f329788d4c2b5f0db6f2c9bf67');
});
function three(whiteKing,rook,blackKing,turn='w'){
 const b=makeBoard();
 b[sq(...whiteKing)]='wK'; b[sq(...rook)]='wR'; b[sq(...blackKing)]='bK';
 assert.equal(validateSetup(b,'krk',turn),null);
 return newGame(b,turn,'krk');
}
test('clear-entry witness follows the frozen geometry, not numerical scoring',()=>{
 const d=chooseDecision(three([4,0],[0,0],[4,7]),'w');
 assert.equal(d.origin,'proof-pattern');
 assert.match(d.rule,/krk_clear_vertical_entry_force/);
 assert.deepEqual([d.move.from,d.move.to],[sq(0,0),sq(0,1)]);
});
test('rook-wall far-file move follows the frozen construction',()=>{
 const d=chooseDecision(three([4,0],[1,2],[2,7]),'w');
 assert.equal(d.origin,'proof-pattern');
 assert.match(d.rule,/krk_wall_rook_move/);
 assert.deepEqual([d.move.from,d.move.to],[sq(1,2),sq(7,2)]);
});
test('wall rank advance comes from the rescue lemma with its two-file premise',()=>{
 const d=chooseDecision(three([4,0],[0,2],[4,6]),'w');
 assert.equal(d.origin,'proof-pattern');
 assert.match(d.rule,/krk_rank_advance_rescue/);
 assert.deepEqual([d.move.from,d.move.to],[sq(0,2),sq(0,3)]);
});
test('same-rank positive setup selects proven backwards king witness',()=>{
 const d=chooseDecision(three([4,3],[0,3],[4,7]),'w');
 assert.equal(d.origin,'proof-pattern');
 assert.match(d.rule,/krk_same_rank_retreat_force/);
 assert.deepEqual([d.move.from,d.move.to],[sq(4,3),sq(4,2)]);
});
test('lone king takes free rook instead of conceding a phantom forced mate',()=>{
 const d=chooseDecision(three([7,7],[1,1],[1,0],'b'),'b');
 assert.equal(d.origin,'proof-pattern');
 assert.match(d.rule,/capture obstruction/);
 assert.deepEqual([d.move.from,d.move.to],[sq(1,0),sq(1,1)]);
 assert.deepEqual(play(three([7,7],[1,1],[1,0],'b'),d.move).board.filter(Boolean).sort(),['bK','wK']);
});
test('immediate checkmate is chosen as explicit finite-rank terminal base case',()=>{
 const d=chooseDecision(three([2,6],[1,0],[0,7]),'w');
 assert.equal(d.origin,'proof-pattern');
 assert.match(d.rule,/actual-mate base case/);
 assert.equal(outcome(play(three([2,6],[1,0],[0,7]),d.move).board,'b').kind,'mate');
});
test('unimplemented rook branches are marked experimental, not proof-certified',()=>{
 const d=chooseDecision(three([4,0],[0,1],[4,2]),'w');
 assert.equal(d.origin,'experimental-heuristic');
 assert.match(d.reason,/Not certified/);
});
test('dead classes genuinely use an arbitrary legal move rather than an engine evaluation',()=>{
 for(const mat of ['kk','kbk','knk']){
  const state=newGame(initialSetup(mat),'w',mat);
  const d=chooseDecision(state,'w');
  assert.equal(d.origin,'dead-position-choice');
  assert.deepEqual([d.move.from,d.move.to],
    [legalMoves(state.board,'w')[0].from,legalMoves(state.board,'w')[0].to]);
 }
});
test('runtime has no external engine, package dependency or network search path',()=>{
 const files=['src/chess.js','src/proof-policy.js','src/engine.js','src/app.js'];
 for(const p of files){
  const contents=readFileSync(p,'utf8');
  assert.doesNotMatch(contents,/\bfetch\s*\(|\bWebSocket\s*\(|\bimport\s*\(/,p);
  assert.doesNotMatch(contents,/from\s*['"](?!\.)/,p);
 }
 const pkg=JSON.parse(readFileSync('package.json','utf8'));
 assert.equal(pkg.dependencies,undefined);
 assert.equal(pkg.devDependencies,undefined);
});

test('deterministic property sample: proof-pattern moves are legal and never hang the rook immediately',()=>{
 let seed=987654321;
 const rand=n=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n;};
 let verified=0;
 for(let i=0;i<1600;i++){
  const [s,r,w]=[rand(64),rand(64),rand(64)];
  if(new Set([s,r,w]).size!==3)continue;
  const strong=i%2?'w':'b',weak=opposite(strong),board=makeBoard();
  board[s]=strong+'K';board[r]=strong+'R';board[w]=weak+'K';
  if(validateSetup(board,'krk',strong))continue;
  const state=newGame(board,strong,'krk'),d=chooseDecision(state,strong);
  assert.ok(d?.move);
  assert.ok(legalMoves(board,strong).some(m=>m.from===d.move.from&&m.to===d.move.to));
  if(d.origin==='proof-pattern'){
   verified++;
   const next=applyMove(board,d.move);
   assert.notEqual(outcome(next,weak).kind,'stalemate');
   assert.ok(!legalMoves(next,weak).some(m=>m.capture===strong+'R'));
  }
 }
 assert.ok(verified>500,'The sample must exercise many mathematical construction branches');
});
