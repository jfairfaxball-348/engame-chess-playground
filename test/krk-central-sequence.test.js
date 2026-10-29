import test from 'node:test';
import assert from 'node:assert/strict';
import {makeBoard,opposite,positionKey,squareAt,legalMoves,play,findKing,coords} from '../src/chess.js';
import {KRK_FRAMES,KRK_GAMEPLAY_RELEASED,krkTransformSquare}
  from '../src/krk-local-witness.js';
import {krkCentralSequenceChoice,auditKRKCentralSequence}
  from '../src/krk-central-sequence.js';

function root(strong,sk,rs,wk,frame){
  const original=makeBoard();
  original[squareAt(...sk)]=strong+'K';
  original[squareAt(...rs)]=strong+'R';
  original[squareAt(...wk)]=opposite(strong)+'K';
  const board=makeBoard();
  for(let i=0;i<64;i++)if(original[i])
    board[krkTransformSquare(i,frame)]=original[i];
  return {board,turn:strong,material:'krk',halfmove:0,
    history:[positionKey(board,strong)],log:[]};
}
test('KRK08 full central edge root reaches actual checkmate in all 8 colour/frame cases',()=>{
  let mates=0;
  for(const strong of ['w','b'])for(const frame of KRK_FRAMES){
    const s=root(strong,[3,5],[0,6],[3,7],frame);
    const choice=krkCentralSequenceChoice(s,frame);
    assert.equal(choice?.kind,'step');
    const a=auditKRKCentralSequence(s,frame,1000);
    assert.equal(a.ok,true,JSON.stringify({strong,frame,a}));
    assert.ok(a.terminalMates>0);
    mates+=a.terminalMates;
  }
  assert.ok(mates>=8);
  assert.equal(KRK_GAMEPLAY_RELEASED,false);
});
test('KRK09 penultimate-rank all-reply games reach real mate in all colours/frames',()=>{
  let nodes=0,mates=0;
  for(const strong of ['w','b'])for(const frame of KRK_FRAMES){
    const s=root(strong,[3,4],[0,5],[3,6],frame);
    const a=auditKRKCentralSequence(s,frame,40000);
    assert.equal(a.ok,true,JSON.stringify({strong,frame,a}));
    assert.equal(a.maximumPlies,15);
    assert.equal(a.isCompleteWinningPolicy,false);
    assert.equal(a.maxMatePlies,null);
    nodes+=a.nodes;mates+=a.terminalMates;
  }
  assert.equal(nodes,416);assert.equal(mates,184);
});
test('KRK09 lower-height all-reply games include off-centre exit and restoration',()=>{
  let nodes=0,mates=0;
  for(const strong of ['w','b'])for(const frame of KRK_FRAMES){
    const s=root(strong,[3,3],[0,4],[3,5],frame);
    const a=auditKRKCentralSequence(s,frame,40000);
    assert.equal(a.ok,true,JSON.stringify({strong,frame,a}));
    assert.equal(a.maximumPlies,29);
    nodes+=a.nodes;mates+=a.terminalMates;
  }
  assert.equal(nodes,42160);assert.equal(mates,17632);
});
test('KRK09 control tags retain pursuit and bind continuation to exact history',()=>{
  let s=root('w',[3,3],[0,4],[3,5],'id'),context=null;
  // All coordinates below are legal defending choices from the regression
  // trace, not a move-selection lookup. Strong moves come from the selector.
  const replies=[[4,6],[5,6],[6,6],[7,6],[7,7],[6,7],[7,7],[6,7],[7,7]];
  let earlierBoard=null;
  for(let i=0;i<replies.length;i++){
    const choice=krkCentralSequenceChoice(s,'id',context);
    assert.equal(choice?.kind,'step');
    assert.equal(choice.inputHalfmove??s.halfmove,s.halfmove);
    if(i===3)assert.equal(choice.phase,'king-pursuit');
    if(i===5){
      assert.equal(choice.phase,'exit-upper-lift');
      assert.equal(coords(findKing(s.board,'w'))[0],6);
    }
    if(i===7){
      assert.equal(context.stage,'centre');
      assert.equal(choice.phase,'restoration-centre-align');
      earlierBoard=s.board.slice();
    }
    const after=play(s,choice.move);
    const reply=legalMoves(after.board,after.turn).find(m=>m.to===squareAt(...replies[i]));
    assert.ok(reply);
    s=play(after,reply);context=choice.continuationPhase;
    assert.equal(s.halfmove,2*(i+1));
    assert.equal(s.history.length,1+2*(i+1));
    assert.equal(krkCentralSequenceChoice(s,'id',{...context,halfmove:0}),null);
  }
  // Same board as restoration, but now the phase correctly continues chase.
  assert.deepEqual(s.board,earlierBoard);
  assert.equal(context.stage,'lower');
  assert.equal(krkCentralSequenceChoice(s,'id',context)?.phase,'king-pursuit');
  assert.equal(krkCentralSequenceChoice(s,'id'),null);
  assert.equal(krkCentralSequenceChoice({...s,history:[...s.history,s.history.at(-1)]},'id',context),null);
});
test('KRK09 terminal claim windows and unsupported roots remain closed',()=>{
  const s=root('w',[3,4],[0,5],[3,6],'id');
  assert.equal(krkCentralSequenceChoice({...s,halfmove:88}),null);
  assert.equal(krkCentralSequenceChoice({...s,history:Array(3).fill(s.history[0])}),null);
  const chosen=krkCentralSequenceChoice(s);
  const after=play(s,chosen.move),key=positionKey(after.board,after.turn);
  assert.equal(krkCentralSequenceChoice({...s,halfmove:4,
    history:[key,key,s.history[0]]}),null);
  assert.equal(auditKRKCentralSequence({...s,history:[key,s.history[0]]}).ok,false);
  assert.equal(krkCentralSequenceChoice(s,'unknown'),null);
  assert.equal(krkCentralSequenceChoice(root('w',[2,4],[0,5],[4,6],'id')),null);
  assert.equal(KRK_GAMEPLAY_RELEASED,false);
});
test('KRK09 central rescue and rook-tempo branches also reach real mate',()=>{
  for(const [sk,rs,wk,expectedMates] of [
    [[3,4],[4,5],[5,6],514],
    [[4,4],[7,5],[1,6],256],
    [[3,4],[2,5],[3,6],379]
  ]){
    const a=auditKRKCentralSequence(root('w',sk,rs,wk,'id'),'id',40000);
    assert.equal(a.ok,true,JSON.stringify({sk,rs,wk,a}));
    assert.equal(a.terminalMates,expectedMates);
  }
});
