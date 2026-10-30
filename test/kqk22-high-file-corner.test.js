import test from 'node:test';
import assert from 'node:assert/strict';
import {
  makeBoard, newGame, validateSetup, squareAt, opposite, outcome
} from '../src/chess.js';
import {chooseMathsOpponent, mathsPlayMove} from '../src/maths-play-policy.js';

// OrientedEntry.lean high_file_corner_entry: exact K(5,6), weak K(7,7),
// Q(*,5) with the weak king not initially in check, followed by Q(7,5)#.
// Test every legal queen file (file 5 would check the weak king already), both strong colours and all eight
// source isometries. This checks an exact proof action, NOT a tablebase.
const transforms=[
  ([x,y])=>[x,y],([x,y])=>[7-x,y],([x,y])=>[x,7-y],
  ([x,y])=>[7-x,7-y],([x,y])=>[y,x],([x,y])=>[7-y,7-x],
  ([x,y])=>[7-y,x],([x,y])=>[y,7-x]
];

test('S022 high-file corner source move is mate for both colours and eight frames',()=>{
  let checked=0;
  for(const strong of ['w','b'])for(const transform of transforms)
    for(const queenFile of [0,1,2,3,4,6]){
      const board=makeBoard(),at=point=>squareAt(...transform(point));
      board[at([5,6])]=strong+'K';
      board[at([queenFile,5])]=strong+'Q';
      board[at([7,7])]=opposite(strong)+'K';
      assert.equal(validateSetup(board,'kqk',strong),null,
        'frozen Lean source requires a fresh valid KQK root');
      const state=newGame(board,strong,'kqk',{experimentalKQK:true});
      const chosen=chooseMathsOpponent(state,strong);
      assert.ok(chosen?.move,'expected a named source corner move');
      assert.equal(chosen.sourcePhase,
        'KQK.OrientedEntry.high_file_corner_entry.corner_distant_mate');
      assert.equal(chosen.move.from,at([queenFile,5]));
      assert.equal(chosen.move.to,at([7,5]));
      const after=mathsPlayMove(state,chosen.move);
      const result=outcome(after.board,after.turn);
      assert.equal(result.kind,'mate','literal constructed Q(7,5) must mate');
      assert.equal(result.winner,strong);
      checked++;
    }
  assert.equal(checked,96);
});
