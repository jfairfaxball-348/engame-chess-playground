import test from 'node:test';
import assert from 'node:assert/strict';
import {legalMoves,makeBoard,newGame,opposite,squareAt}
  from '../src/chess.js';
import {mathsPlayMove} from '../src/maths-play-policy.js';
import {kqkSourceChoice} from '../src/kqk-source-policy.js';
import {authenticateS045Action,S045_FORWARD}
  from '../scripts/s045-source-premises.mjs';

test('S047 frozen TightEntry file-six EDGE wall authenticates genuine source token through a real legal weak move',()=>{
  let verified=0;
  // The exact S047 exhaustive first failed-premise witness (white):
  // before: Kc7, Qg5, weak Ka6; source Kc6; defender Ka7.
  // After: Kc6 Qg5 ka7; in the rotate180 theorem frame:
  // strong king (5,2), queen (1,3), weak king (7,1).
  // Frozen TightEntry.lean lines 114-129 selects edge_wall_weak_open_bound,
  // and Q(g5)-b5, which is framed file SIX, not file five.
  for(const strong of ['w','b']){
    const weak=opposite(strong),board=makeBoard();
    board[squareAt(2,6)]=strong+'K'; // c7
    board[squareAt(6,4)]=strong+'Q'; // g5
    board[squareAt(0,5)]=weak+'K';   // a6
    const root=newGame(board,strong,'kqk',{experimentalKQK:true});
    const first=kqkSourceChoice(root,strong,null);
    assert.equal(first?.sourcePhase,
      'KQK.TightEntry.tight_king_step.king_approach');
    assert.equal(first?.frame,'rotate180');
    assert.equal(first?.move.from,squareAt(2,6));
    assert.equal(first?.move.to,squareAt(2,5));
    assert.equal(first?.continuationPhase?.kind,'tight-file');
    const after=mathsPlayMove(root,first.move);
    const weakMove=legalMoves(after.board,weak).find(m=>
      m.from===squareAt(0,5)&&m.to===squareAt(0,6));
    assert.ok(weakMove,'a6-a7 is a lawful actual defensive reply');
    const state=mathsPlayMove(after,weakMove);
    const second=kqkSourceChoice(state,strong,first.continuationPhase);
    assert.equal(second?.sourcePhase,S045_FORWARD);
    assert.equal(second?.move.from,squareAt(6,4));
    assert.equal(second?.move.to,squareAt(1,4));
    const check=authenticateS045Action(state,strong,second,
      first.continuationPhase);
    assert.equal(check.status,'authenticated',JSON.stringify(check));
    assert.equal(check.globalMateCertified,false);
    assert.equal(authenticateS045Action(state,strong,second,
      {...first.continuationPhase,weak:squareAt(0,6)}).status,
      'failed-premise','forged input weak-square remains rejected');
    verified++;
  }
  assert.equal(verified,2);
});
