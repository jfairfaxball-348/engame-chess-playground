import test from 'node:test';
import assert from 'node:assert/strict';
import {
  makeBoard,opposite,play,positionKey,squareAt
} from '../src/chess.js';
import {
  KRK_FRAMES,KRK_GAMEPLAY_RELEASED,krkTransformSquare
} from '../src/krk-local-witness.js';
import {
  KRK_CENTRAL_UPPER_RULE,KRK_CENTRAL_UPPER_RESTORATION,
  krkCentralUpperPhaseChoice,krkCentralUpperRestorationNext,
  auditKRKCentralUpperPhase
} from '../src/krk-central-upper-phase.js';

function root(strong,king,rook,weak){
  const board=makeBoard();
  board[squareAt(...king)]=strong+'K';
  board[squareAt(...rook)]=strong+'R';
  board[squareAt(...weak)]=opposite(strong)+'K';
  return {board,turn:strong,material:'krk',halfmove:0,
    history:[positionKey(board,strong)],log:[]};
}
function transform(s,frame){
  const board=makeBoard();
  for(let i=0;i<64;i++)if(s.board[i])
    board[krkTransformSquare(i,frame)]=s.board[i];
  return {...s,board,history:[positionKey(board,s.turn)]};
}

test('KRK07 upper central rank advance composes through every restoration reply',()=>{
  let roots=0,defences=0,leaves=0,restoration=0;
  for(const strong of ['w','b'])
    for(const frame of KRK_FRAMES)
      for(const setup of [
        {sk:[3,1],rs:[0,2],wk:[4,4]},
        {sk:[4,1],rs:[7,2],wk:[3,4]},
        {sk:[3,2],rs:[0,3],wk:[4,5]}
      ]){
        const state=transform(root(strong,setup.sk,setup.rs,setup.wk),frame);
        const start=krkCentralUpperPhaseChoice(state,frame);
        assert.equal(start?.rule,KRK_CENTRAL_UPPER_RULE,
          JSON.stringify({strong,frame,setup}));
        assert.equal(start?.restorationRule,KRK_CENTRAL_UPPER_RESTORATION);
        assert.equal(start.nextWallRank,start.originalWallRank+1);
        assert.equal(start.isCompleteWinningPolicy,false);
        const a=auditKRKCentralUpperPhase(state,frame);
        assert.equal(a.ok,true,JSON.stringify({strong,frame,setup,a}));
        assert.ok(a.firstReplies>0&&a.centralLeaves>=a.firstReplies);
        assert.ok(a.maxPhasePlies>=2&&a.maxPhasePlies<=8);
        assert.equal(a.nextWallRank,start.nextWallRank);
        assert.match(a.terminal,/NOT mate/);
        const advanced=play(state,start.move);
        assert.equal(advanced.history.length,state.history.length+1);
        roots++;
        defences+=a.firstReplies;
        leaves+=a.centralLeaves;
        restoration+=a.restorationReplies;
      }
  assert.equal(roots,24);
  assert.ok(defences>=roots&&leaves>=defences&&restoration>=leaves);
  assert.equal(KRK_GAMEPLAY_RELEASED,false);
  console.log('KRK07 entire upper-wall phases',{roots,defences,leaves,restoration});
});

test('KRK07 explicitly fails closed on unsupported central geometry and claims',()=>{
  const state=root('w',[3,1],[0,2],[4,4]);
  assert.equal(krkCentralUpperPhaseChoice({...state,history:[]}),null);
  assert.equal(krkCentralUpperPhaseChoice({...state,history:['fake']}),null);
  assert.equal(krkCentralUpperPhaseChoice({...state,halfmove:92}),null);
  assert.equal(krkCentralUpperPhaseChoice({...state,history:
    Array(3).fill(positionKey(state.board,state.turn))}),null);
  const lower=root('w',[3,1],[0,2],[4,3]);
  assert.equal(krkCentralUpperPhaseChoice(lower),null);
  const narrow=root('w',[3,1],[3,2],[4,4]);
  assert.equal(krkCentralUpperPhaseChoice(narrow),null);
  assert.equal(krkCentralUpperRestorationNext({...state,halfmove:100}),null);
  assert.equal(krkCentralUpperPhaseChoice({...state,material:'knk'}),null);
  assert.equal(auditKRKCentralUpperPhase(lower).ok,false);
  assert.equal(KRK_GAMEPLAY_RELEASED,false);
});
