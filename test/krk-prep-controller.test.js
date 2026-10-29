import test from 'node:test';
import assert from 'node:assert/strict';
import {
  makeBoard,squareAt,positionKey,validateSetup,applyMove,legalMoves,opposite
} from '../src/chess.js';
import {KRK_FRAMES,krkTransformSquare,KRK_GAMEPLAY_RELEASED} from '../src/krk-local-witness.js';
import {krkConstructiveStep,auditKRKConstructiveStep} from '../src/krk-constructive-phases.js';
import {KRK_PREP_PHASE,krkPrepState,krkPrepChoice,auditKRKPrepChoice} from '../src/krk-prep-controller.js';

const sq=squareAt;
function state(color,sk,rs,wk,halfmove=0){
  const b=makeBoard(),weak=opposite(color);
  b[sq(...sk)]=color+'K';b[sq(...rs)]=color+'R';b[sq(...wk)]=weak+'K';
  return {board:b,turn:color,material:'krk',halfmove,
    history:[positionKey(b,color)],log:[]};
}
function transform(s,frame){
 const b=makeBoard();
 for(let i=0;i<64;i++)if(s.board[i])b[krkTransformSquare(i,frame)]=s.board[i];
 return {...s,board:b,history:[positionKey(b,s.turn)]};
}

test('rank zero is exact centered ready-wall geometry',()=>{
 const root=state('w',[3,1],[0,2],[5,3]);
 const info=krkPrepState(root);
 assert.ok(info);
 assert.equal(info.prepDistance,0);
 assert.equal(info.repairNeeded,false);
 assert.equal(info.rank,0);
 const ready=krkPrepChoice(root);
 assert.equal(ready.kind,'ready');
 assert.equal(ready.maxMatePlies,null,'ready is NOT a certified global mate');
 assert.equal(auditKRKPrepChoice(root).ok,true);
});

test('rook-margin repair and prepared king step strictly decrease rank for all weak replies',()=>{
 const roots=[
  state('w',[1,0],[3,2],[4,4]),
  state('w',[1,0],[0,2],[5,5]),
  state('w',[2,1],[0,2],[5,3]),
  state('w',[4,2],[7,3],[5,6]),
  state('w',[0,0],[6,3],[4,5])
 ];
 for(const color of ['w','b'])for(const frame of KRK_FRAMES)for(const orig of roots){
   const b=orig.board.map(p=>p?(color==='w'?p:(p[0]==='w'?'b':'w')+p[1]):null);
   const init=transform({...orig,board:b,turn:color,history:[positionKey(b,color)]},frame);
   if(validateSetup(init.board,'krk',color))continue;
   const info=krkPrepState(init,frame);
   assert.ok(info,'valid strict wall must have a prep rank');
   const choice=krkPrepChoice(init,frame);
   assert.ok(choice);
   assert.equal(choice.isCompleteWinningPolicy,false);
   if(choice.kind==='step'){
     const a=auditKRKPrepChoice(init,frame);
     assert.ok(a.ok,'prep phase not decreasing for '+color+'/'+frame+'/'+JSON.stringify(orig));
     assert.ok(a.replies>0);
     assert.ok(a.rankMaxAfter<a.rankBefore);
     if(info.repairNeeded){
       assert.equal(choice.ruleKey,'wallFarRepair');
       assert.ok(auditKRKConstructiveStep(init,choice.witness).ok);
     }else assert.equal(choice.ruleKey,'prep');
   }
 }
});

test('adversarial complete preparation tree reaches READY without a repeated strong-turn state',()=>{
 // This explores every defender branch of a FIXED theorem-derived controller.
 // It neither chooses moves by search nor computes a WDL/DTM table.
 const root=state('w',[1,1],[0,2],[5,3]);
 let leaves=0,nodes=0;
 function walk(s,seen,limit){
   nodes++;
   const info=krkPrepState(s);
   assert.ok(info);
   assert.ok(info.rank<=limit,'rank cannot increase along actual opponent play');
   const c=krkPrepChoice(s);
   if(c.kind==='ready'){
      leaves++;
      assert.equal(info.rank,0);
      return;
   }
   assert.ok(!seen.has(positionKey(s.board,s.turn)));
   assert.ok(limit>0);
   const after=applyMove(s.board,c.move),weak=opposite(s.turn);
   const replies=legalMoves(after,weak);
   assert.ok(replies.length>0);
   for(const r of replies){
      assert.equal(r.capture,null);
      const b=applyMove(after,r);
      const follow={...s,board:b,history:s.history.concat([
        positionKey(after,weak),positionKey(b,s.turn)
      ]),halfmove:s.halfmove+2};
      const next=krkPrepState(follow);
      assert.ok(next && next.rank<info.rank);
      walk(follow,new Set([...seen,positionKey(s.board,s.turn)]),next.rank);
   }
 }
 walk(root,new Set(),krkPrepState(root).rank);
 assert.ok(leaves>0&&nodes>leaves);
 console.log('KRK01 all-adversary finite prep test:',{nodes,leaves});
});

test('broad independently verified preparation rank descends for every legal defender reply',()=>{
 const triples=[[0,2,4],[0,3,6],[1,2,3],[1,3,6],[2,3,5],[2,4,7]];
 let applicable=0,ready=0,steps=0;
 for(const color of ['w','b'])for(const [sy,ry,wy] of triples)
  for(let sx=0;sx<8;sx++)for(let rx=0;rx<8;rx++)for(let wx=0;wx<8;wx++){
    const st=state(color,[sx,sy],[rx,ry],[wx,wy]);
    if(validateSetup(st.board,'krk',color))continue;
    const info=krkPrepState(st),choice=krkPrepChoice(st);
    assert.ok(info&&choice);
    applicable++;
    if(choice.kind==='ready'){ready++;assert.equal(info.rank,0);continue;}
    const a=auditKRKPrepChoice(st);
    assert.ok(a.ok,'counterexample to rank descent '+JSON.stringify([color,sx,sy,rx,ry,wx,wy,a]));
    if(info.repairNeeded)assert.equal(choice.ruleKey,'wallFarRepair');
    steps++;
  }
 assert.ok(applicable>1000&&steps>1000&&ready>0);
 assert.equal(KRK_GAMEPLAY_RELEASED,false);
 console.log('KRK01 fully controlled prep branch fixtures:',{applicable,ready,steps});
});
