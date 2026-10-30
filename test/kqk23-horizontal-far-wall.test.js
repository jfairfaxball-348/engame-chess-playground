import test from 'node:test';
import assert from 'node:assert/strict';
import {
  makeBoard,newGame,validateSetup,squareAt,opposite,legalMoves
} from '../src/chess.js';
import {chooseMathsOpponent,mathsPlayMove} from '../src/maths-play-policy.js';

// Exact one-rank-gap / high-file narrow case inside frozen
// OrientedEntry.horizontal_far_wall_entry: K(5,4), Q(0,7), k(7,5)
// has absDiff(q.rank,k.rank)=2 and the theorem explicitly plays Q(6,7).
// This is a geometric source witness, not a tablebase/engine choice.
test('S023 frozen horizontal far-wall narrow action is source-tagged and legal',()=>{
  for(const strong of ['w','b']){
    const board=makeBoard();
    board[squareAt(5,4)]=strong+'K';
    board[squareAt(0,7)]=strong+'Q';
    board[squareAt(7,5)]=opposite(strong)+'K';
    assert.equal(validateSetup(board,'kqk',strong),null);
    const state=newGame(board,strong,'kqk',{experimentalKQK:true});
    const choice=chooseMathsOpponent(state,strong);
    assert.equal(choice?.sourcePhase,
      'KQK.OrientedEntry.horizontal_far_wall_entry.narrow_queen_to_six',
      JSON.stringify(choice));
    assert.equal(choice.move.from,squareAt(0,7));
    assert.equal(choice.move.to,squareAt(6,7));
    assert.equal(choice.mathematicallyCertifiedSelector,false);
    assert.equal(choice.fideClockHistoryCertified,false);
    assert.ok(legalMoves(board,strong).some(
      m=>m.from===choice.move.from&&m.to===choice.move.to));
    const after=mathsPlayMove(state,choice.move);
    assert.equal(after.board[squareAt(6,7)],strong+'Q');
    assert.ok(!legalMoves(after.board,opposite(strong))
      .some(m=>m.capture===strong+'Q'));
  }
});
