import test from 'node:test';
import assert from 'node:assert/strict';
import {initialSetup,newGame,outcome,legalMoves,distance,findKing,opposite,play,coords} from '../src/chess.js';
import {chooseDecision} from '../src/engine.js';

/** Not a mate-distance proof. Ordinary deterministic defensive opponents
 * uncover geometry-policy loops, draw by repetition, hanging rook and stalls.
 */
const defensiveModes=[
  {name:'distance',score:(m,b,strong)=>distance(m.to,findKing(b,strong))*8},
  {name:'king-hunt',score:(m,b,strong)=>-distance(m.to,b.indexOf(strong+'R'))*8},
  {name:'central',score:(m,b,strong)=>{
    const [x,y]=coords(m.to);return -(Math.abs(3.5-x)+Math.abs(3.5-y))*8;
  }},
  {name:'corner',score:(m,b,strong)=>{
    const [x,y]=coords(m.to);return (Math.abs(3.5-x)+Math.abs(3.5-y))*8;
  }}
];
function defend(g,strong,mode){
 return legalMoves(g.board,g.turn).slice().sort((a,b)=>
   mode.score(b,g.board,strong)-mode.score(a,g.board,strong)||a.to-b.to)[0];
}
test('both strong colours mate varied legal king-defence behaviours in a practical finite session',()=>{
 let mates=0;
 for(const strong of ['w','b'])for(const turn of ['w','b'])
 for(const mode of defensiveModes){
  let g=newGame(initialSetup('krk',strong),turn,'krk'),ply=0;
  for(;ply<120;ply++){
   const result=outcome(g.board,g.turn,g.history,g.halfmove);
   if(result.kind!=='ongoing')break;
   let m;
   if(g.turn===strong){
    const d=chooseDecision(g,strong);
    assert.ok(d?.move,JSON.stringify({strong,turn,mode:mode.name,ply}));
    g.krkFrame=d.frame||g.krkFrame;
    g.krkProofContext=d.proofContext||null;
    m=d.move;
   }else m=defend(g,strong,mode);
   assert.ok(m);
   g=play(g,m);
   assert.equal(g.krkRookCaptured??false,false,
     'rook loss from a safe-root game is not permitted by practical policy');
  }
  const result=outcome(g.board,g.turn,g.history,g.halfmove);
  assert.equal(result.kind,'mate',
    JSON.stringify({strong,turn,mode:mode.name,ply,status:result,
      line:g.log.slice(-24)}));
  assert.equal(result.winner,strong);
  mates++;
 }
 assert.equal(mates,16);
 console.log('KRK practical multi-defender finished mates:',mates);
});
