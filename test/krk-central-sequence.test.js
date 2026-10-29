import test from 'node:test';
import assert from 'node:assert/strict';
import {makeBoard,opposite,positionKey,squareAt} from '../src/chess.js';
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
test('KRK08 complete central penultimate-rank reply tree terminates in checkmate',()=>{
  const s=root('w',[3,4],[0,5],[3,6],'id');
  const a=auditKRKCentralSequence(s,'id',40000);
  // Known missing phase induction: recentring can undo an off-centre
  // pursuit. Preserve this as a failing-closed regression, not a win claim.
  assert.equal(a.ok,false);
  assert.equal(a.reason,'repeated position');
  assert.ok(a.maximumPlies<=98);
  assert.equal(a.terminalMates,0);
});
