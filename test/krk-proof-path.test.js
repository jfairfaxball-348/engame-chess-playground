/**
 * Proof-path composition DIAGNOSTIC: the exact wide protected cut followed
 * by the exact guarded king move enters an oriented rook-wall domain after
 * every defensive branch. NO general controller or gameplay enablement.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {makeBoard,squareAt,positionKey,opposite,legalMoves,play,validateSetup}
  from '../src/chess.js';
import {KRK_FRAMES,KRK_GAMEPLAY_RELEASED,krkTransformSquare}
  from '../src/krk-local-witness.js';
import {krkWidePivotChoice} from '../src/krk-wide-pivot.js';
import {krkGuardedEntryChoice} from '../src/krk-guarded-entry.js';
import {krkPrepState} from '../src/krk-prep-controller.js';

function p(c,sk,rs,wk){
 const b=makeBoard();b[squareAt(...sk)]=c+'K';b[squareAt(...rs)]=c+'R';
 b[squareAt(...wk)]=opposite(c)+'K';
 return {board:b,turn:c,material:'krk',halfmove:0,log:[],history:[positionKey(b,c)]};
}
function transform(s,f){
 const b=makeBoard();
 for(let i=0;i<64;i++)if(s.board[i])b[krkTransformSquare(i,f)]=s.board[i];
 return {...s,board:b,history:[positionKey(b,s.turn)]};
}
test('both wide-protected cuts compose with guarded entry against every weak reply',()=>{
 let pivotDefences=0,guardDefences=0,wallHandoffs=0;
 for(const colour of ['w','b'])for(const frame of KRK_FRAMES)
 for(const [sk,rs,wk] of [
   [[3,1],[0,2],[5,3]],
   [[4,1],[7,2],[2,3]]
 ]){
   const s=transform(p(colour,sk,rs,wk),frame);
   assert.equal(validateSetup(s.board,'krk',colour),null);
   const cut=krkWidePivotChoice(s,frame);
   assert.equal(cut?.kind,'step');
   const afterCut=play(s,cut.move);
   for(const weakReply of legalMoves(afterCut.board,afterCut.turn)){
     const s2=play(afterCut,weakReply);
     pivotDefences++;
     const guarded=krkGuardedEntryChoice(s2,frame);
     assert.ok(guarded,JSON.stringify({colour,frame,weakReply,s2:s2.board}));
     const afterGuard=play(s2,guarded.move);
     for(const weakReply2 of legalMoves(afterGuard.board,afterGuard.turn)){
       const s4=play(afterGuard,weakReply2);
       guardDefences++;
       const wall=KRK_FRAMES.map(f=>krkPrepState(s4,f)).find(Boolean);
       assert.ok(wall,JSON.stringify({colour,frame,weakReply,weakReply2,s4:s4.board}));
       wallHandoffs++;
     }
   }
 }
 assert.ok(pivotDefences>10);
 assert.ok(guardDefences>40);
 assert.equal(wallHandoffs,guardDefences);
 assert.equal(KRK_GAMEPLAY_RELEASED,false);
 console.log('KRK02 protected-cut all-reply chain:',{pivotDefences,guardDefences,wallHandoffs});
});
