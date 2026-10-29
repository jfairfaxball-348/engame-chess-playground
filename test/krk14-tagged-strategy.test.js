import test from 'node:test';
import assert from 'node:assert/strict';
import {
  makeBoard,opposite,outcome,play,positionKey,legalMoves,squareAt,MATERIAL
} from '../src/chess.js';
import {
  KRK_FRAMES,KRK_GAMEPLAY_RELEASED,krkTransformSquare
} from '../src/krk-local-witness.js';
import {
  krkTaggedStrongChoice,krkTaggedTrace,classifyKRKWeakRoot
} from '../src/krk-tagged-strategy.js';
import {auditKRK14Continuations}
  from '../scripts/krk14-continuation-audit.mjs';

function fixture(colour,frame,sk,rs,wk,turn=colour){
  const local=makeBoard(),board=makeBoard();
  local[squareAt(...sk)]=colour+'K';
  local[squareAt(...rs)]=colour+'R';
  local[squareAt(...wk)]=opposite(colour)+'K';
  for(let i=0;i<64;i++)if(local[i])
    board[krkTransformSquare(i,frame)]=local[i];
  return {board,turn,material:'krk',halfmove:0,log:[],
    history:[positionKey(board,turn)]};
}
const paths=[
  {phase:'prepared-wall',sk:[2,1],rs:[0,2],wk:[5,3]},
  {phase:'direct-entry',sk:[3,3],rs:[7,7],wk:[4,6]},
  {phase:'two-step-setup',sk:[3,1],rs:[5,0],wk:[4,5]}
];

test('KRK14 tagged source-move composition binds all actual first weak replies in both colours and all frames',()=>{
  let replies=0,secondReplies=0;
  for(const strong of ['w','b'])for(const frame of KRK_FRAMES)
    for(const p of paths){
      const root=fixture(strong,frame,p.sk,p.rs,p.wk);
      const untouched=structuredClone(root);
      const first=krkTaggedStrongChoice(root);
      assert.equal(first?.kind,'step',JSON.stringify({strong,frame,p}));
      assert.equal(first.rootPhase,p.phase);
      assert.equal(first.isCompleteWinningPolicy,false);
      assert.equal(first.maxMatePlies,null);
      const after=play(root,first.move);
      for(const r of legalMoves(after.board,after.turn)){
        assert.equal(r.capture,null);
        const child=play(after,r);
        const second=krkTaggedStrongChoice(child,first.continuationPhase);
        assert.equal(second?.kind,'step',JSON.stringify({strong,frame,p,r}));
        replies++;
        const a2=play(child,second.move);
        if(outcome(a2.board,a2.turn,a2.history,a2.halfmove).kind==='mate')
          continue;
        for(const r2 of legalMoves(a2.board,a2.turn)){
          assert.equal(r2.capture,null);
          const leaf=play(a2,r2);
          assert.equal(krkTaggedStrongChoice(
            leaf,second.continuationPhase)?.kind,'step',
            JSON.stringify({strong,frame,p,r,r2}));
          secondReplies++;
        }
      }
      assert.deepEqual(root,untouched);
    }
  assert.ok(replies>20);
  assert.ok(secondReplies>20);
  assert.equal(MATERIAL.krk.playable,false);
  assert.equal(KRK_GAMEPLAY_RELEASED,false);
});

test('KRK14 context validation rejects stale, mismatched and invented continuations',()=>{
  const root=fixture('w','id',[3,1],[5,0],[4,5]);
  const first=krkTaggedStrongChoice(root);
  assert.ok(first);
  const after=play(root,first.move);
  const child=play(after,legalMoves(after.board,after.turn)[0]);
  const tag=first.continuationPhase;
  assert.ok(krkTaggedStrongChoice(child,tag));
  for(const wrong of [
    {...tag,kind:'not-krk14'},
    {...tag,mode:'unproved'},
    {...tag,strong:'b'},
    {...tag,historyLength:1},
    {...tag,halfmove:0},
    {...tag,afterStrongKey:'wrong'},
    {...tag,inner:null}
  ])assert.equal(krkTaggedStrongChoice(child,wrong),null);
  assert.equal(krkTaggedStrongChoice({...child,history:[]},tag),null);
  assert.equal(krkTaggedStrongChoice(after,tag),null); // weak cannot play strong move
  assert.equal(krkTaggedStrongChoice({...root,material:'knk'}),null);
  assert.equal(krkTaggedStrongChoice({...root,halfmove:-1}),null);
});

test('KRK14 preserves the known real checkmate trace without moving the weak side autonomously',()=>{
  const root=fixture('w','id',[2,1],[0,2],[5,3]);
  const trace=krkTaggedTrace(root);
  assert.equal(trace.ok,true,JSON.stringify(trace));
  assert.equal(trace.terminal,'mate');
  assert.equal(trace.winner,'w');
  assert.equal(trace.fideCertified,false);
  assert.equal(krkTaggedTrace(root,[-1]).ok,false);
});

test('KRK14 weak-to-move partition distinguishes an immediate rook-capture draw',()=>{
  const root=fixture('w','id',[4,0],[0,7],[1,7],'b');
  const analysis=classifyKRKWeakRoot(root);
  assert.equal(analysis.kind,'ongoing');
  assert.equal(analysis.hasImmediateKKDraw,true);
  assert.ok(analysis.rookCaptures>=1);
  assert.equal(analysis.fideCertified,false);
  assert.equal(krkTaggedStrongChoice(root),null);
  assert.equal(classifyKRKWeakRoot({...root,history:[]}).kind,'invalid');
});

test('KRK14 sampled falsification returns exact legal-reply counts and does not certify mate',()=>{
  const result=auditKRK14Continuations({maxTriples:192,maxExamples:4});
  assert.equal(result.totals.triples,192);
  assert.ok(result.totals.strongRoots>0);
  assert.equal(result.totals.selectedFirst+
    (result.failures['no-first-step']||0),result.totals.strongRoots);
  assert.ok(result.totals.firstHandoffs<=result.totals.firstLegalReplies);
  assert.ok(result.totals.secondHandoffs<=result.totals.secondLegalReplies);
  assert.equal(result.completeMateProof,false);
  assert.equal(result.fideClockHistoryCertified,false);
});
