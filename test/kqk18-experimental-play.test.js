import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  makeBoard,squareAt,validateSetup,attacks,legalMoves,outcome,
  newGame,positionKey,MATERIAL,opposite
} from '../src/chess.js';
import {setupVerdict,available,materialOf} from '../src/maths-model.js';
import {KQK_FRAMES,KQK_PROOF_SOURCE_SHA,kqkSourceChoice} from '../src/kqk-source-policy.js';
import {
  mathsPlayMove,chooseMathsOpponent,KQK_EXPERIMENTAL_PLAYABLE
} from '../src/maths-play-policy.js';

const sq=squareAt;
function root(strong,sk=[2,1],q=[4,6],wk=[6,7],turn=strong) {
 const board=makeBoard();
 board[sq(...sk)]=strong+'K';
 board[sq(...q)]=strong+'Q';
 board[sq(...wk)]=opposite(strong)+'K';
 return {board,turn,material:'kqk',halfmove:0,history:[positionKey(board,turn)],log:[]};
}
function start(s) {return newGame(s.board,s.turn,'kqk',{experimentalKQK:true});}
test('KQK outcome is frozen, but the experimental selector is not certified or available without opting in',()=>{
 assert.equal(KQK_PROOF_SOURCE_SHA,'c72365a8ba46f59114a2a77d9d38993f6a52df80');
 assert.equal(KQK_EXPERIMENTAL_PLAYABLE,true);
 assert.equal(MATERIAL.kqk.playable,false);
 const s=root('w'),v=setupVerdict(s.board,s.turn);
 assert.equal(v.material,'kqk');assert.equal(v.source,'EC-T0050');
 assert.equal(v.kind,'win');assert.equal(v.safeQueen,true);
 assert.equal(v.canStart,true);assert.equal(v.experimental,true);
 assert.equal(materialOf(s.board),'kqk');
 assert.throws(()=>newGame(s.board,s.turn,'kqk'),/certified/);
 const g=start(s);assert.deepEqual(g.board,s.board);assert.equal(g.turn,s.turn);
 assert.equal(g.history.length,1);assert.equal(g.log.length,0);
});
test('queen inventory activates only when no extra material is already present; pawns remain unavailable',()=>{
 const b=makeBoard();
 for(const col of ['w','b'])assert.equal(available(b,col+'Q'),true);
 assert.equal(available(b,'wP'),false);
 b[sq(3,3)]='wQ';
 for(const col of ['w','b'])assert.equal(available(b,col+'Q'),false);
 assert.equal(available(b,'bR'),false);
});
test('queen moves and rays obey both rook and bishop geometry, blockers and king safety',()=>{
 const b=makeBoard();b[sq(0,0)]='wK';b[sq(7,7)]='bK';b[sq(3,3)]='wQ';
 assert.equal(validateSetup(b,'kqk','b'),null);
 for(const [x,y] of [[3,6],[6,3],[5,5],[1,1],[1,5],[5,1]])
   assert.equal(attacks(b,'w',sq(x,y)),true);
 assert.equal(attacks(b,'w',sq(5,6)),false);
 const queenMoves=legalMoves(b,'w').filter(m=>m.piece==='wQ');
 assert.ok(queenMoves.some(m=>m.to===sq(3,7)));
 assert.ok(queenMoves.some(m=>m.to===sq(6,6)));
 assert.ok(queenMoves.every(m=>m.to!==sq(7,7)),'cannot capture enemy king');
 b[sq(3,5)]='wK';b[sq(0,0)]=null;
 assert.equal(attacks(b,'w',sq(3,7)),false,'queen line blocked by own king');
});
test('exposed KQK queen can be captured and continues with previously released KK',()=>{
 for(const strong of ['w','b']){
  const s=root(strong,[4,0],[4,5],[4,6],opposite(strong));
  assert.equal(setupVerdict(s.board,s.turn).kind,'draw');
  const take=legalMoves(s.board,s.turn).find(m=>m.capture===strong+'Q');
  assert.ok(take);
  const after=mathsPlayMove(start(s),take);
  assert.equal(after.material,'kk');
  assert.equal(after.board.filter(Boolean).length,2);
  assert.equal(chooseMathsOpponent(after,strong)?.origin,'dead-position-choice');
 }
});
test('frozen edge-corridor mating move is a lawful checkmate for both colours',()=>{
 for(const strong of ['w','b']){
  const s=root(strong,[6,5],[4,6],[7,7]);
  const c=chooseMathsOpponent(start(s),strong);
  assert.equal(c?.origin,'experimental-proof-derived-kqk');
  assert.equal(c?.sourcePhase,'KQK.Edge.corner_prison_bound.protected_mate');
  assert.equal(c?.mathematicallyCertifiedSelector,false);
  assert.equal(c?.fideClockHistoryCertified,false);
  assert.equal(c?.move.to,sq(7,6));
  assert.ok(legalMoves(s.board,s.turn).some(m=>m.to===c.move.to&&m.from===c.move.from));
  const after=mathsPlayMove(start(s),c.move);
  assert.deepEqual(outcome(after.board,after.turn),{kind:'mate',winner:strong});
 }
});
test('EdgeForce corridors progress by source-defined queen shifts, king tempos and escort; replies remain legal',()=>{
 for(const strong of ['w','b']){
  const s=root(strong,[2,1],[0,6],[4,7]);
  let game=start(s),last=null;
  for(let round=0;round<22;round++){
   if(game.turn!==strong)break;
   const choice=chooseMathsOpponent(game,strong,last);
   assert.ok(choice?.move,'missing edge constructive step at round '+round);
   assert.match(choice.sourcePhase,/^KQK\.Edge/);
   assert.ok(legalMoves(game.board,strong).some(m=>m.from===choice.move.from&&m.to===choice.move.to));
   game=mathsPlayMove(game,choice.move);last=choice.continuationToken;
   if(outcome(game.board,game.turn).kind==='mate')break;
   const replies=legalMoves(game.board,opposite(strong));
   assert.ok(replies.length,'edge proof guarantees a weak reply');
   // All actual legal weak replies must have a source continuation.
   for(const reply of replies){
    const child=mathsPlayMove(game,reply);
    const answer=chooseMathsOpponent(child,strong,last);
    assert.ok(answer?.move,'edge proof lacked continuation for '+JSON.stringify(reply));
   }
   game=mathsPlayMove(game,replies[0]);
  }
  assert.equal(outcome(game.board,game.turn).kind,'mate',
    'one complete edge-wall demonstration should actually mate');
 }
});
test('shadow phase copies legal king replies with a bound continuation token and rejects forged tags',()=>{
 for(const strong of ['w','b']){
  const s=root(strong,[0,0],[3,3],[4,5]);
  let game=start(s);
  const first=chooseMathsOpponent(game,strong);
  assert.match(first?.sourcePhase||'',/ShadowForce\.shadow_strong_bound/);
  game=mathsPlayMove(game,first.move);
  const reply=legalMoves(game.board,opposite(strong))[0];
  assert.ok(reply);
  game=mathsPlayMove(game,reply);
  assert.equal(chooseMathsOpponent(game,strong,{kind:'made-up'}),null);
  const choice=chooseMathsOpponent(game,strong,first.continuationToken);
  assert.ok(choice?.move,'actual shadow reply must be translated');
  assert.ok(legalMoves(game.board,strong).some(m=>m.from===choice.move.from&&m.to===choice.move.to));
  assert.equal(choice.origin,'experimental-proof-derived-kqk');
  const fake={...first.continuationToken,queen:12};
  assert.equal(kqkSourceChoice(game,strong,fake),null);
 }
});
test('unknown geometric root fails closed; no external source or arbitrary legal fallback',()=>{
 const s=root('w',[4,0],[0,0],[4,7]); // initial default-like arrangement, outside edge/shadow
 const c=chooseMathsOpponent(start(s),'w');
 assert.equal(c,null);
 const src=readFileSync('src/kqk-source-policy.js','utf8');
 assert.doesNotMatch(src,/Stockfish|Syzygy|tablebase|\bfetch\s*\(|\bminimax\s*\(/i);
 assert.equal(KQK_FRAMES.length,8);
});
