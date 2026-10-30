import test from 'node:test';
import assert from 'node:assert/strict';
import {
  makeBoard,newGame,legalMoves,opposite,squareAt,validateSetup
} from '../src/chess.js';
import {chooseMathsOpponent,mathsPlayMove} from '../src/maths-play-policy.js';

const frames=[
  ([x,y])=>[x,y],([x,y])=>[7-x,y],([x,y])=>[x,7-y],
  ([x,y])=>[7-x,7-y],([x,y])=>[y,x],([x,y])=>[7-y,7-x],
  ([x,y])=>[7-y,x],([x,y])=>[y,7-x]
];

test('S026 SameRankEntry backrank all legal weak replies retain the protected continuation',()=>{
  let exercised=0;
  const colours=new Set();
  for(const strong of ['w','b'])for(const frame of frames){
    const at=([x,y])=>squareAt(...frame([x,y]));
    const board=makeBoard(),weak=opposite(strong);
    board[at([4,0])]=strong+'K';
    board[at([2,0])]=strong+'Q';
    board[at([3,3])]=weak+'K';
    assert.equal(validateSetup(board,'kqk',strong),null);
    const start=newGame(board,strong,'kqk',{experimentalKQK:true});
    const first=chooseMathsOpponent(start,strong);
    assert.ok(first?.move,'source move required from backrank source fixture');
    // Frame ordering may select another legitimate source theorem.
    // Only test the exact SameRankEntry branch when it was selected.
    if(first.sourcePhase!=='KQK.SameRankEntry.backrank_entry.king_to_weak_file')
      continue;
    exercised++;colours.add(strong);
    assert.equal(first.move.from,at([4,0]));
    assert.equal(first.move.to,at([3,0]));
    assert.equal(first.continuationToken?.kind,'backrank-protected');
    const moved=mathsPlayMove(start,first.move);
    assert.equal(chooseMathsOpponent(moved,strong,first.continuationToken),null,
      'one-reply continuation must reject a state before weak moves');
    const replies=legalMoves(moved.board,weak);
    assert.ok(replies.length>0);
    for(const reply of replies){
      const next=mathsPlayMove(moved,reply);
      const choice=chooseMathsOpponent(next,strong,first.continuationToken);
      assert.ok(choice?.move,'every actual weak reply needs its source continuation');
      assert.equal(choice.sourcePhase,
        'KQK.SameRankEntry.protected_backrank_entry.queen_up');
      assert.equal(choice.move.from,at([2,0]));
      assert.equal(choice.move.to,at([2,1]));
      assert.equal(choice.continuationToken,null);
      const tampered={...first.continuationToken,weak:reply.to};
      assert.equal(chooseMathsOpponent(next,strong,tampered),null,
        'exact original weak-square binding must reject forgery');
    }
  }
  assert.ok(exercised>=2,'both strong colours must exercise the backrank branch');
  assert.deepEqual([...colours].sort(),['b','w']);
});
