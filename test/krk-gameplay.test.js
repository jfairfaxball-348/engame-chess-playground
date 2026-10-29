import test from 'node:test';
import assert from 'node:assert/strict';
import {MATERIAL,makeBoard,initialSetup,squareAt,positionKey,validateSetup,
  newGame,legalMoves,applyMove,opposite,play,outcome,findKing,distance} from '../src/chess.js';
import {chooseDecision} from '../src/engine.js';
import {KRK_GAMEPLAY_RELEASED,KRK_FORMAL_COMPLETE_POLICY} from '../src/krk-local-witness.js';

const s=squareAt;
function position(strong,sk,rook,wk,turn=strong){
 const b=makeBoard();b[s(...sk)]=strong+'K';b[s(...rook)]=strong+'R';
 b[s(...wk)]=opposite(strong)+'K';
 return {board:b,turn,material:'krk',halfmove:0,history:[positionKey(b,turn)],log:[]};
}
test('practical KRK owner scope: all starts play as lone king, even when the rook side is Black',()=>{
 assert.equal(KRK_GAMEPLAY_RELEASED,true);
 assert.equal(KRK_FORMAL_COMPLETE_POLICY,false);
 assert.equal(MATERIAL.krk.playable,true);
 for(const strong of ['w','b'])for(const turn of ['w','b']){
  const b=initialSetup('krk',strong),g=newGame(b,turn,'krk');
  assert.equal(g.board.includes(strong+'R'),true);
  assert.equal(g.turn,turn);
  assert.equal(g.material,'krk');
  assert.notEqual(strong,opposite(strong));
  if(turn===strong){
   const d=chooseDecision(g,strong);
   assert.ok(d?.move);
   assert.equal(d.move.piece[0],strong);
   assert.ok(legalMoves(g.board,strong).some(m=>m.to===d.move.to&&m.from===d.move.from));
  }
 }
});
test('lone king can legally capture unprotected rook and it becomes exactly KK draw',()=>{
 for(const strong of ['w','b']){
  const weak=opposite(strong);
  const g=newGame(position(strong,[0,0],[4,5],[4,6],weak).board,weak,'krk');
  const capture=legalMoves(g.board,weak).find(m=>m.to===s(4,5));
  assert.ok(capture,'weak king must be allowed to capture rook');
  assert.equal(capture.capture,strong+'R');
  const next=play(g,capture);
  assert.equal(next.material,'kk');
  assert.equal(next.krkRookCaptured,true);
  assert.equal(next.board.includes(strong+'R'),false);
  assert.deepEqual(next.board.filter(Boolean).sort(),['bK','wK']);
  assert.equal(chooseDecision(next,strong)?.origin,'dead-position-choice');
 }
});
test('strong side never deliberately offers an immediately capturable rook',()=>{
 let checked=0,setupFallback=0;
 for(const strong of ['w','b'])
 for(const sy of [0,1,2,3,4])
 for(const sx of [0,2,3,4,6])
 for(const rx of [0,3,7])
 for(const ry of [0,1,2,3,5,7])
 for(const wx of [0,2,4,6,7])
 for(const wy of [1,3,4,6,7]){
  const p=position(strong,[sx,sy],[rx,ry],[wx,wy]);
  if(validateSetup(p.board,'krk',strong)||outcome(p.board,strong,p.history,0).kind!=='ongoing')continue;
  const d=chooseDecision(p,strong);
  assert.ok(d?.move,JSON.stringify({strong,sx,sy,rx,ry,wx,wy}));
  if(d.origin==='krk-geometric-setup')setupFallback++;
  const moves=legalMoves(p.board,strong);
  assert.ok(moves.some(m=>m.from===d.move.from&&m.to===d.move.to));
  const b=applyMove(p.board,d.move),reply=legalMoves(b,opposite(strong));
  assert.ok(!reply.some(m=>m.capture===strong+'R'),JSON.stringify({strong,sx,sy,rx,ry,wx,wy,decision:d}));
  assert.ok(reply.length>0||outcome(b,opposite(strong)).kind==='mate');
  checked++;
 }
 assert.ok(checked>1000);
 console.log('Practical KRK safety roots:',{checked,setupFallback});
});
test('constructive KRK game alternates real legal moves and never invokes an external engine',()=>{
 for(const strong of ['w','b']){
  let g=newGame(initialSetup('krk',strong),strong,'krk');
  for(let n=0;n<64;n++){
   const status=outcome(g.board,g.turn,g.history,g.halfmove);
   if(status.kind!=='ongoing'||g.krkRookCaptured)break;
   let m;
   if(g.turn===strong){const d=chooseDecision(g,strong);assert.ok(d?.move);m=d.move;
     g.krkFrame=d.frame||g.krkFrame;g.krkProofContext=d.proofContext||null;
   }else{
     const legal=legalMoves(g.board,g.turn);
     m=legal.slice().sort((a,b)=>distance(b.to,findKing(g.board,strong))-
          distance(a.to,findKing(g.board,strong))||a.to-b.to)[0];
   }
   g=play(g,m);
   assert.ok(g.board.filter(Boolean).length>=2);
   assert.ok(g.log.length===n+1);
  }
  console.log('KRK practical 64-ply adversarial path',strong,
    {plies:g.log.length,material:g.material,last:g.log.slice(-3), trace:g.log.join(' | '), board:g.board});
 }
});
