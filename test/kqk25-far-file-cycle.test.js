import test from 'node:test';
import assert from 'node:assert/strict';
import {
  makeBoard,newGame,legalMoves,opposite,positionKey,squareAt,
  validateSetup
} from '../src/chess.js';
import {chooseMathsOpponent,mathsPlayMove} from '../src/maths-play-policy.js';

// Literal S025 all-defender counterexample from exact S025 PR-head
// expanded diagnostic: weak e2-e3, Q(g7-a7), weak e3-d3,
// previously Q(a7-h7), weak d3-e3, Q(h7-a7) -> source-control cycle.
// The upstream far_file_preparation proof requires its follow-on
// far_file_stage_bound AFTER the actual first weak reply, not another
// preparation on the other side of the board.
const frames=[
  ([x,y])=>[x,y],([x,y])=>[7-x,y],([x,y])=>[x,7-y],
  ([x,y])=>[7-x,7-y],([x,y])=>[y,x],([x,y])=>[7-y,7-x],
  ([x,y])=>[7-y,x],([x,y])=>[y,7-x]
];

test('S025 FarFilePreparation cannot re-prepare the opposite file after actual weak reply',()=>{
  let exercised=0;
  for(const strong of ['w','b'])for(const frame of frames){
    const at=([x,y])=>squareAt(...frame([x,y]));
    const board=makeBoard(),weak=opposite(strong);
    board[at([0,4])]=strong+'K';
    board[at([6,6])]=strong+'Q';
    board[at([4,1])]=weak+'K';
    assert.equal(validateSetup(board,'kqk',weak),null);
    let s=newGame(board,weak,'kqk',{experimentalKQK:true});
    const firstWeak=legalMoves(s.board,weak).find(
      m=>m.from===at([4,1])&&m.to===at([4,2]));
    assert.ok(firstWeak);
    s=mathsPlayMove(s,firstWeak);
    const first=chooseMathsOpponent(s,strong);
    assert.ok(first?.move);
    if(!/FarFilePreparation\.far_file_preparation/.test(first.sourcePhase))
      continue; // Other source-equivalent orientations have their own action.
    exercised++;
    const after=mathsPlayMove(s,first.move);
    assert.equal(after.board[at([0,6])],strong+'Q');
    assert.equal(first.continuationToken?.kind,'far-file');
    const reply=legalMoves(after.board,weak).find(
      m=>m.from===at([4,2])&&m.to===at([3,2]));
    assert.ok(reply,'the actual weak reply from the former counterexample');
    const next=mathsPlayMove(after,reply);
    const second=chooseMathsOpponent(next,strong,first.continuationToken);
    assert.ok(second?.move,'frozen far_file_stage_bound reply must exist');
    assert.doesNotMatch(second.sourcePhase,/FarFilePreparation\.far_file_preparation/);
    assert.equal(second.move.to,at([1,6]),
      'frozen framed clear-low-wall/same-rank continuation moves Q to b7');
    assert.notEqual(second.move.to,at([7,6]),'previous bounce-to-h7');
    assert.equal(next.history.at(-1),positionKey(next.board,next.turn));
  }
  assert.ok(exercised>=2,'both strong colours must exercise the source token');
});
