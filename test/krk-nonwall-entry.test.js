import test from 'node:test';
import assert from 'node:assert/strict';
import {
  makeBoard,opposite,outcome,play,positionKey,legalMoves,squareAt,MATERIAL
} from '../src/chess.js';
import {KRK_FRAMES,KRK_GAMEPLAY_RELEASED,krkTransformSquare}
  from '../src/krk-local-witness.js';
import {
  KRK_NONWALL_SOURCE_SHA,krkNonWallEntryChoice,krkNonWallEntryContinue,
  krkPartialRootChoice,auditKRKNonWallEntry
} from '../src/krk-nonwall-entry.js';
import {krkPreparedWallChoice} from '../src/krk-prepared-wall.js';
import {krkPrepState} from '../src/krk-prep-controller.js';

function fixture(colour,frame,sk,rs,wk){
  const original=makeBoard(),board=makeBoard();
  original[squareAt(...sk)]=colour+'K';
  original[squareAt(...rs)]=colour+'R';
  original[squareAt(...wk)]=opposite(colour)+'K';
  for(let i=0;i<64;i++)if(original[i])
    board[krkTransformSquare(i,frame)]=original[i];
  return {board,turn:colour,material:'krk',halfmove:0,log:[],
    history:[positionKey(board,colour)]};
}
const examples=[
  {rule:'entry',sk:[3,3],rs:[7,7],wk:[4,6]},
  {rule:'retreat',sk:[3,2],rs:[4,2],wk:[6,5]},
  {rule:'backrank',sk:[3,0],rs:[4,0],wk:[6,4]}
];

test('KRK12 three frozen nonwall actions enter prepared wall after every legal weak reply',()=>{
  let replies=0;
  for(const colour of ['w','b'])for(const frame of KRK_FRAMES)
    for(const e of examples){
      const s=fixture(colour,frame,e.sk,e.rs,e.wk);
      const before=structuredClone(s);
      const choice=krkNonWallEntryChoice(s,frame);
      assert.equal(choice?.kind,'step',JSON.stringify({colour,frame,e}));
      assert.equal(choice.ruleKey,e.rule);
      assert.equal(choice.isCompleteWinningPolicy,false);
      assert.equal(choice.maxMatePlies,null);
      assert.equal(choice.sourceCommit,KRK_NONWALL_SOURCE_SHA);
      const audit=auditKRKNonWallEntry(s,frame);
      assert.equal(audit.ok,true,JSON.stringify({colour,frame,e,audit}));
      assert.ok(audit.entersStrictWall);
      const after=play(s,choice.move);
      for(const reply of legalMoves(after.board,after.turn)){
        const child=play(after,reply);
        const rank=krkPrepState(child,frame);
        assert.ok(rank,'every reply must give strict oriented wall');
        const next=krkNonWallEntryContinue(child,choice.continuationPhase);
        assert.equal(next?.kind,'step','expected next proof-derived action');
        replies++;
      }
      assert.deepEqual(s,before);
    }
  assert.ok(replies>=24);
  assert.equal(MATERIAL.krk.playable,false);
  assert.equal(KRK_GAMEPLAY_RELEASED,false);
});

test('KRK12 entry continuation is bound to original move, turn, frame and history',()=>{
  const s=fixture('w','id',...Object.values(examples[0]).slice(1));
  const c=krkNonWallEntryChoice(s),a=play(s,c.move);
  const child=play(a,legalMoves(a.board,a.turn)[0]),t=c.continuationPhase;
  assert.ok(krkNonWallEntryContinue(child,t));
  assert.equal(krkNonWallEntryContinue(child,{...t,afterStrongKey:'tamper'}),null);
  assert.equal(krkNonWallEntryContinue(child,{...t,historyLength:2}),null);
  assert.equal(krkNonWallEntryContinue(child,{...t,halfmove:0}),null);
  assert.equal(krkNonWallEntryContinue(child,{...t,frame:'flip-rank'}),null);
  assert.equal(krkNonWallEntryContinue(child,{...t,strong:'b'}),null);
  assert.equal(krkNonWallEntryContinue({...child,history:[]},t),null);
});

test('KRK12 partial root policy selects only certified premises, never a fallback',()=>{
  const wall=fixture('w','id',[2,1],[0,2],[5,3]);
  assert.equal(krkPartialRootChoice(wall)?.rootPhase,'prepared-wall');
  const entry=fixture('w','id',[3,3],[7,7],[4,6]);
  assert.equal(krkPartialRootChoice(entry)?.rootPhase,'direct-entry');
  assert.equal(krkPartialRootChoice({...entry,material:'kk'}),null);
  assert.equal(krkPartialRootChoice({...entry,history:[]}),null);
  assert.equal(krkPartialRootChoice({...entry,halfmove:-1}),null);
  const weak={...entry,turn:'b',history:[positionKey(entry.board,'b')]};
  assert.equal(krkPartialRootChoice(weak),null);
  assert.equal(krkNonWallEntryChoice(wall,'not-a-frame'),null);
});

test('KRK12 a real nonwall entry can continue through prepared policy to actual mate',()=>{
  const e=examples[0];
  let s=fixture('w','id',e.sk,e.rs,e.wk),first=krkNonWallEntryChoice(s);
  assert.ok(first);
  let a=play(s,first.move),terminal=false,prepared=0;
  s=play(a,legalMoves(a.board,a.turn)[0]);
  let choice=krkNonWallEntryContinue(s,first.continuationPhase);
  let tag=null;
  for(let ply=0;ply<85;ply+=2){
    assert.equal(choice?.kind,'step','missing prepared action at ply '+ply);
    prepared++;
    a=play(s,choice.move);
    if(outcome(a.board,a.turn,a.history,a.halfmove).kind==='mate'){
      assert.equal(outcome(a.board,a.turn).winner,'w');
      terminal=true;break;
    }
    const responses=legalMoves(a.board,a.turn);
    assert.ok(responses.length);
    s=play(a,responses[0]);
    tag=choice.continuationPhase;
    choice=krkPreparedWallChoice(s,'id',tag);
  }
  assert.ok(terminal,'expected a legal source-selected first-reply mate trace');
  assert.ok(prepared>0);
});
