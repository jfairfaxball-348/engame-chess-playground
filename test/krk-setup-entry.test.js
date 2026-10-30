import test from 'node:test';
import assert from 'node:assert/strict';
import {
  makeBoard,opposite,play,positionKey,legalMoves,squareAt,MATERIAL
} from '../src/chess.js';
import {KRK_FRAMES,KRK_GAMEPLAY_RELEASED,krkTransformSquare}
  from '../src/krk-local-witness.js';
import {
  KRK_TWO_STEP_SETUP_RULES,krkSetupEntryChoice,krkSetupEntryContinue,
  krkPartialRootChoice,krkNonWallEntryContinue,auditKRKSetupEntry
} from '../src/krk-nonwall-entry.js';
import {krkPreparedWallChoice} from '../src/krk-prepared-wall.js';

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
const cases=[
  {rule:'offrankRepair',sk:[3,1],rs:[5,0],wk:[4,5]},
  {rule:'backrankSetup',sk:[2,0],rs:[4,0],wk:[3,4]}
];

test('KRK13 frozen two-step proof action handles every weak reply and enters existing winning phases',()=>{
  let firstReplies=0,secondReplies=0;
  for(const colour of ['w','b'])for(const frame of KRK_FRAMES)for(const c of cases){
    const state=fixture(colour,frame,c.sk,c.rs,c.wk);
    const untouched=structuredClone(state);
    const choice=krkSetupEntryChoice(state,frame);
    assert.equal(choice?.ruleKey,c.rule,JSON.stringify({colour,frame,c}));
    assert.equal(choice.sourcePhase,'two-step-setup');
    assert.equal(choice.isCompleteWinningPolicy,false);
    assert.equal(choice.maxMatePlies,null);
    const audit=auditKRKSetupEntry(state,frame);
    assert.equal(audit.ok,true,JSON.stringify({colour,frame,c,audit}));
    firstReplies+=audit.replies;
    secondReplies+=audit.secondReplies;
    const selected=krkPartialRootChoice(state);
    assert.equal(selected?.rootPhase,'two-step-setup');
    const after=play(state,choice.move);
    for(const reply of legalMoves(after.board,after.turn)){
      const secondState=play(after,reply);
      const next=krkSetupEntryContinue(secondState,choice.continuationPhase);
      assert.equal(next?.kind,'step','source second action absent');
      if(next.sourcePhase==='nonwall-entry'){
        const afterSecond=play(secondState,next.move);
        for(const weakReply of legalMoves(afterSecond.board,afterSecond.turn)){
          const readyState=play(afterSecond,weakReply);
          assert.equal(krkNonWallEntryContinue(
            readyState,next.continuationPhase)?.kind,'step');
        }
      }else{
        assert.ok(krkPreparedWallChoice(secondState,next.frame));
      }
    }
    assert.deepEqual(state,untouched);
  }
  assert.ok(firstReplies>=16);
  assert.ok(secondReplies>=16);
  assert.deepEqual(KRK_TWO_STEP_SETUP_RULES,['backrankSetup','offrankRepair']);
  assert.equal(MATERIAL.krk.playable,false);
  assert.equal(KRK_GAMEPLAY_RELEASED,false);
});

test('KRK13 context is tied to actual move, turn, frame, history and rank',()=>{
  const c=cases[0],state=fixture('w','id',c.sk,c.rs,c.wk);
  const choice=krkSetupEntryChoice(state);
  assert.ok(choice);
  const after=play(state,choice.move);
  const child=play(after,legalMoves(after.board,after.turn)[0]),t=choice.continuationPhase;
  assert.ok(krkSetupEntryContinue(child,t));
  assert.equal(krkSetupEntryContinue(child,{...t,afterStrongKey:'bad'}),null);
  assert.equal(krkSetupEntryContinue(child,{...t,halfmove:0}),null);
  assert.equal(krkSetupEntryContinue(child,{...t,historyLength:1}),null);
  assert.equal(krkSetupEntryContinue(child,{...t,strong:'b'}),null);
  assert.equal(krkSetupEntryContinue(child,{...t,frame:'bad'}),null);
  assert.equal(krkSetupEntryContinue(child,{...t,targetFile:4}),null);
  assert.equal(krkSetupEntryContinue({...child,history:[]},t),null);
  assert.equal(krkSetupEntryChoice(state,'bad'),null);
  assert.equal(krkSetupEntryChoice({...state,material:'knk'}),null);
  assert.equal(krkSetupEntryChoice({...state,halfmove:-1}),null);
});
