import test from 'node:test';
import assert from 'node:assert/strict';
import {makeBoard,squareAt,positionKey,validateSetup,
  legalMoves,applyMove,opposite} from '../src/chess.js';
import {KRK_FRAMES,krkTransformSquare,KRK_GAMEPLAY_RELEASED} from '../src/krk-local-witness.js';
import {KRK_WALL_CLIMB_PHASE,krkWallClimbState,krkWallClimbChoice,
  auditKRKWallClimbChoice} from '../src/krk-wall-climb.js';

function state(colour,sk,rs,wk){
 const b=makeBoard(),other=opposite(colour);
 b[squareAt(...sk)]=colour+'K';
 b[squareAt(...rs)]=colour+'R';
 b[squareAt(...wk)]=other+'K';
 return {board:b,turn:colour,material:'krk',history:[positionKey(b,colour)],halfmove:0,log:[]};
}
function transform(s,frame){
 const b=makeBoard();
 for(let i=0;i<64;i++)if(s.board[i])b[krkTransformSquare(i,frame)]=s.board[i];
 return {...s,board:b,history:[positionKey(b,s.turn)]};
}

test('a READY upper gap produces the exact frozen RankTwo rook lift, all replies fall in potential',()=>{
 const st=state('w',[3,1],[0,2],[5,5]);
 const p=krkWallClimbState(st),c=krkWallClimbChoice(st);
 assert.ok(p&&c);
 assert.equal(p.rank,0);
 assert.equal(c.ruleKey,'rankTwo');
 assert.equal(c.move.from,squareAt(0,2));
 assert.equal(c.move.to,squareAt(0,3));
 const a=auditKRKWallClimbChoice(st);
 assert.ok(a.ok,JSON.stringify(a));
 assert.ok(a.maxNextPotential<a.potentialBefore);
});

test('READY lower band is an explicit non-mating handoff, not silent autoplay',()=>{
 const st=state('w',[3,1],[0,2],[5,3]);
 const c=krkWallClimbChoice(st);
 assert.equal(c.kind,'handoff');
 assert.equal(c.phase,KRK_WALL_CLIMB_PHASE);
 assert.equal(c.isCompleteWinningPolicy,false);
 assert.equal(c.maxMatePlies,null);
 assert.equal(auditKRKWallClimbChoice(st).handoff,true);
});

test('four coordinate frames and both strong colours strictly decrease potential for every defender move',()=>{
 const cases=[
  [[1,0],[3,2],[4,4]], // rook margin repair
  [[1,0],[0,2],[5,5]], // king preparation
  [[3,1],[0,2],[5,5]], // ready to raise rook
  [[4,1],[7,2],[2,6]],
  [[2,1],[0,3],[5,7]],
  [[3,3],[0,4],[5,6]]
 ];
 let verified=0;
 for(const colour of ['w','b'])for(const frame of KRK_FRAMES)
  for(const [sk,rs,wk] of cases){
    const s=transform(state(colour,sk,rs,wk),frame);
    if(validateSetup(s.board,'krk',colour))continue;
    const p=krkWallClimbState(s,frame),c=krkWallClimbChoice(s,frame);
    assert.ok(p&&c);
    const a=auditKRKWallClimbChoice(s,frame);
    assert.ok(a.ok,JSON.stringify({frame,colour,sk,rs,wk,a}));
    if(c.kind==='step'){
      assert.ok(a.maxNextPotential<a.potentialBefore);
      verified++;
    }
  }
 assert.ok(verified>20);
});

test('complete all-adversary rook-climb/repair/centralisation trees reach a lower-band handoff',()=>{
 const roots=[
  state('w',[3,3],[0,4],[5,7]),
  state('w',[1,3],[0,5],[5,7])
 ];
 let branches=0,leaves=0;
 for(const root of roots){
  function walk(s,seen,limit){
    const c=krkWallClimbChoice(s),p=krkWallClimbState(s);
    assert.ok(c&&p);
    assert.ok(p.potential<=limit);
    if(c.kind==='handoff'){
      assert.equal(p.rank,0);
      assert.equal(p.weakRank,p.rookRank+1);
      leaves++;return;
    }
    const key=positionKey(s.board,s.turn);
    assert.equal(seen.has(key),false);
    const after=applyMove(s.board,c.move),weak=opposite(s.turn);
    const replies=legalMoves(after,weak);
    assert.ok(replies.length>0);
    for(const m of replies){
      assert.equal(m.capture,null);
      const b=applyMove(after,m);
      const follow={...s,board:b,history:s.history.concat([
        positionKey(after,weak),positionKey(b,s.turn)
      ]),halfmove:s.halfmove+2};
      const next=krkWallClimbState(follow);
      assert.ok(next && next.potential<p.potential,
        JSON.stringify({c,after:m,next:next?.potential}));
      walk(follow,new Set([...seen,key]),next.potential);
      branches++;
    }
  }
  walk(root,new Set(),krkWallClimbState(root).potential);
 }
 assert.ok(branches>leaves&&leaves>0);
 assert.equal(KRK_GAMEPLAY_RELEASED,false);
 console.log('KRK01 finite all-adversary wall-climb handoffs:',{branches,leaves});
});

test('broad deterministic wall-climb choices have strict all-reply potential descent',()=>{
 let tried=0,steps=0,handoffs=0;
 for(const colour of ['w','b'])
 for(const [sy,ry,wy] of [[0,2,4],[0,3,6],[1,2,3],[1,3,6],[2,3,5],[2,4,7],[3,4,6]])
 for(let sx=0;sx<8;sx++)for(let rx=0;rx<8;rx++)for(let wx=0;wx<8;wx++){
   const s=state(colour,[sx,sy],[rx,ry],[wx,wy]);
   if(validateSetup(s.board,'krk',colour))continue;
   const p=krkWallClimbState(s),c=krkWallClimbChoice(s);
   assert.ok(p&&c);
   const result=auditKRKWallClimbChoice(s);
   assert.ok(result.ok,'wall-climb counterexample '+JSON.stringify({colour,sx,sy,rx,ry,wx,wy,result}));
   tried++;
   if(c.kind==='handoff')handoffs++;else steps++;
 }
 assert.ok(tried>6000 && steps>1000 && handoffs>0);
 console.log('KRK01 wall-climb all-reply fixtures:',{tried,steps,handoffs});
});
