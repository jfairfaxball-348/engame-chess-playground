import test from 'node:test';
import assert from 'node:assert/strict';
import {makeBoard,squareAt,positionKey,opposite,play,legalMoves,outcome,MATERIAL}
  from '../src/chess.js';
import {KRK_FRAMES,KRK_GAMEPLAY_RELEASED,krkTransformSquare}
  from '../src/krk-local-witness.js';
import {krkPreparedWallChoice,krkPreparedWallStaticBound}
  from '../src/krk-prepared-wall.js';

function root(colour,frame,sk=[2,1],rs=[0,2],wk=[5,3]){
  const oriented=makeBoard(),board=makeBoard();
  oriented[squareAt(...sk)]=colour+'K';
  oriented[squareAt(...rs)]=colour+'R';
  oriented[squareAt(...wk)]=opposite(colour)+'K';
  for(let i=0;i<64;i++)if(oriented[i])
    board[krkTransformSquare(i,frame)]=oriented[i];
  return {board,turn:colour,material:'krk',halfmove:0,
    history:[positionKey(board,colour)],log:[]};
}
test('KRK11 computed static prep+central bound is honest and frame-invariant',()=>{
  for(const colour of ['w','b'])for(const frame of KRK_FRAMES){
    const s=root(colour,frame),copy=structuredClone(s);
    const b=krkPreparedWallStaticBound(s,frame);
    assert.equal(b.prepRank,2);
    assert.equal(b.wallRank,2);
    assert.equal(b.plies,87);
    assert.equal(b.coversFIDEClaims,false);
    assert.equal(b.isCompleteWinningPolicy,false);
    assert.equal(b.maxMatePlies,null);
    assert.deepEqual(s,copy);
  }
  assert.equal(MATERIAL.krk.playable,false);
  assert.equal(KRK_GAMEPLAY_RELEASED,false);
});
test('KRK11 every first defending reply decreases prep rank and enters central policy',()=>{
  let replies=0;
  for(const colour of ['w','b'])for(const frame of KRK_FRAMES){
    const s=root(colour,frame),before=structuredClone(s);
    const chosen=krkPreparedWallChoice(s,frame);
    assert.equal(chosen?.kind,'step',colour+' '+frame);
    assert.equal(chosen.sourcePhase,'prep');
    const after=play(s,chosen.move);
    for(const r of legalMoves(after.board,after.turn)){
      assert.equal(r.capture,null);
      const child=play(after,r);
      const next=krkPreparedWallChoice(child,frame,chosen.continuationPhase);
      assert.equal(next?.kind,'step',JSON.stringify({colour,frame,r}));
      assert.equal(next.sourcePhase,'central');
      assert.equal(next.isCompleteWinningPolicy,false);
      replies++;
    }
    assert.deepEqual(s,before);
  }
  assert.ok(replies>=8);
});
test('KRK11 handoff tokens bind exact move, side, history, clock and rank',()=>{
  const s=root('w','id'),c=krkPreparedWallChoice(s);
  const after=play(s,c.move),r=legalMoves(after.board,after.turn)[0];
  const child=play(after,r),tag=c.continuationPhase;
  assert.ok(krkPreparedWallChoice(child,'id',tag));
  assert.equal(krkPreparedWallChoice(child,'id',{...tag,rankBefore:0}),null);
  assert.equal(krkPreparedWallChoice(child,'id',{...tag,halfmove:0}),null);
  assert.equal(krkPreparedWallChoice(child,'id',{...tag,afterStrongKey:'tamper'}),null);
  assert.equal(krkPreparedWallChoice(child,'flip-rank',tag),null);
  assert.equal(krkPreparedWallChoice({...child,history:[]},'id',tag),null);
  assert.equal(krkPreparedWallChoice({...child,turn:'b'},'id',tag),null);
});
test('KRK11 rejects unproved non-wall and weak-to-move roots',()=>{
  const s=root('w','id',[3,0],[0,0],[5,4]);
  assert.equal(krkPreparedWallChoice(s),null);
  assert.equal(krkPreparedWallStaticBound(s),null);
  const weak=root('w','id');
  weak.turn='b';weak.history=[positionKey(weak.board,'b')];
  assert.equal(krkPreparedWallChoice(weak),null);
  assert.equal(krkPreparedWallStaticBound(weak),null);
});
test('KRK11 source-selected preparation followed by central reaches mate on legal trace',()=>{
  let s=root('w','id'),tag=null,preparation=0,central=0,terminal=false;
  for(let ply=0;ply<60;ply+=2){
    const chosen=krkPreparedWallChoice(s,'id',tag);
    assert.equal(chosen?.kind,'step',JSON.stringify({ply,s,tag}));
    if(chosen.sourcePhase==='prep')preparation++;else central++;
    const after=play(s,chosen.move);
    if(outcome(after.board,after.turn,after.history,after.halfmove).kind==='mate'){
      assert.equal(outcome(after.board,after.turn).winner,'w');
      terminal=true;break;
    }
    const replies=legalMoves(after.board,after.turn);
    assert.ok(replies.length);
    s=play(after,replies[0]);
    tag=chosen.continuationPhase;
  }
  assert.ok(terminal,'expected actual mate on the fixed legal defender trace');
  assert.ok(preparation>0&&central>0);
});
