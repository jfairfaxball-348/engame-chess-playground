import test from 'node:test';
import assert from 'node:assert/strict';
import {
  makeBoard,newGame,validateSetup,legalMoves,opposite,outcome,squareAt
} from '../src/chess.js';
import {chooseMathsOpponent,mathsPlayMove} from '../src/maths-play-policy.js';

// All eight literal isometries from frozen KQK.FramedFinish/Symmetry.
const frames=[
  ([x,y])=>[x,y],([x,y])=>[7-x,y],([x,y])=>[x,7-y],
  ([x,y])=>[7-x,7-y],([x,y])=>[y,x],([x,y])=>[7-y,7-x],
  ([x,y])=>[7-y,x],([x,y])=>[y,7-x]
];
const at=(frame,pos)=>squareAt(...frame(pos));
function setup(strong,frame,sk,q,wk){
  const board=makeBoard();
  board[at(frame,sk)]=strong+'K';
  board[at(frame,q)]=strong+'Q';
  board[at(frame,wk)]=opposite(strong)+'K';
  assert.equal(validateSetup(board,'kqk',strong),null);
  return newGame(board,strong,'kqk',{experimentalKQK:true});
}
function playSource(state,strong,token=null){
  const c=chooseMathsOpponent(state,strong,token);
  assert.ok(c?.move,'source continuation unavailable at '+state.history.at(-1));
  const after=mathsPlayMove(state,c.move);
  assert.equal(after.material,'kqk','source must not lose its queen');
  return {c,after};
}
test('S024 frozen corner_knight_low_five_rescue covers blocking K and ordinary Q in both colours/frames',()=>{
  for(const strong of ['w','b'])for(const frame of frames)
    for(const blocked of [false,true]) {
      // Both configurations are literally covered by SetupCorners:
      // Q(6,5), weak K(7,7), strong K rank five.
      const sk=blocked?[5,5]:[3,5];
      const state=setup(strong,frame,sk,[6,5],[7,7]);
      const {c,after}=playSource(state,strong);
      assert.match(c.sourcePhase,blocked
        ? /SetupCorners\\.king_blocks_target_bound\\.queen_to_seven/
        : /SetupCorners\\.corner_knight_low_five_rescue\\.queen_to_five/);
      assert.equal(c.move.to,at(frame,blocked?[7,5]:[5,5]));
      const replies=legalMoves(after.board,opposite(strong));
      assert.ok(replies.length>0,'the proof explicitly constructs a weak reply');
      for(const reply of replies) {
        const next=mathsPlayMove(after,reply);
        const second=playSource(next,strong,c.continuationToken);
        if(blocked){
          assert.match(second.c.sourcePhase,/SetupCorners\\.king_blocks_target_bound\\.finish/);
          assert.equal(second.c.move.to,at(frame,[6,6]));
          assert.equal(outcome(second.after.board,second.after.turn).kind,'mate');
        } else {
          // KnightPrison.low_five first lowers K to rank four;
          // Q(4,6) at rank five would NOT match its Lean premises.
          assert.match(second.c.sourcePhase,/knight_prison_low_five_bound\\.king_down/);
          assert.equal(second.c.move.to,at(frame,[sk[0],4]));
          assert.equal(second.c.continuationToken?.kind,'knight-low-five');
          for(const r of legalMoves(second.after.board,opposite(strong))){
            const third=mathsPlayMove(second.after,r);
            playSource(third,strong,second.c.continuationToken);
          }
        }
      }
    }
});

test('S024 rank-five knight prison handles both starting weak knight squares without premature queen step',()=>{
  for(const strong of ['w','b'])for(const frame of frames)
    for(const weak of [[6,7],[7,6]]) {
      const state=setup(strong,frame,[3,5],[5,5],weak);
      const {c,after}=playSource(state,strong);
      assert.equal(c.move.to,at(frame,[3,4]));
      assert.match(c.sourcePhase,/knight_prison_low_five_bound\\.king_down/);
      assert.equal(c.continuationToken?.kind,'knight-low-five');
      const replies=legalMoves(after.board,opposite(strong));
      assert.ok(replies.length>0);
      for(const r of replies) {
        const afterReply=mathsPlayMove(after,r);
        const next=playSource(afterReply,strong,c.continuationToken);
        assert.match(next.c.sourcePhase,/KQK\\.KnightPrison\\./);
      }
    }
});
