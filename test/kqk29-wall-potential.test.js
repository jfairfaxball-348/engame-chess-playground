import test from 'node:test';
import assert from 'node:assert/strict';
import {
  makeBoard,newGame,legalMoves,opposite,squareAt,validateSetup
} from '../src/chess.js';
import {chooseMathsOpponent,mathsPlayMove} from '../src/maths-play-policy.js';

// The S029 source obligation is BandEntry.wall_prepare_bound's induction
// (preparation_step) on the FIXED original Wall and its natural potential.
// The defender enumeration below is a local falsification test, never a
// live move selector. No assumptions about FIDE 50/75-move certification.
const frames=[
  ([x,y])=>[x,y],([x,y])=>[7-x,y],([x,y])=>[x,7-y],
  ([x,y])=>[7-x,7-y],([x,y])=>[y,x],([x,y])=>[7-y,7-x],
  ([x,y])=>[7-y,x],([x,y])=>[y,7-x]
];

test('S029 wall preparation stays in its Lean frame and decreases potential for every weak reply',()=>{
  let cases=0,replies=0;
  const byColour={w:0,b:0};
  for(const strong of ['w','b'])for(const transform of frames){
    const at=(x,y)=>squareAt(...transform([x,y]));
    const weak=opposite(strong),board=makeBoard();
    board[at(3,1)]=strong+'K';
    board[at(2,4)]=strong+'Q';
    board[at(6,6)]=weak+'K';
    assert.equal(validateSetup(board,'kqk',strong),null);
    const root=newGame(board,strong,'kqk',{experimentalKQK:true});
    const first=chooseMathsOpponent(root,strong);
    assert.ok(first?.move,'a frozen wall-preparation action is available');
    // Other proven orientations may take priority in the global selector.
    if(!/KQK\.BandEntry\.wall_prepare_bound\./.test(first.sourcePhase))
      continue;
    cases++;byColour[strong]++;
    const token=first.continuationToken;
    assert.equal(token?.kind,'band-wall-prepare');
    assert.ok(Number.isInteger(token.rankBefore));
    assert.ok(token.rankBefore>0);
    const after=mathsPlayMove(root,first.move);
    const legal=legalMoves(after.board,weak);
    assert.ok(legal.length>0);
    for(const reply of legal){
      const child=mathsPlayMove(after,reply);
      const second=chooseMathsOpponent(child,strong,token);
      assert.ok(second?.move,
        JSON.stringify({strong,transform:transform.toString(),reply,token}));
      assert.match(second.sourcePhase,/KQK\.BandEntry\.wall_prepare_bound\./);
      assert.equal(second.continuationToken?.kind,'band-wall-prepare');
      assert.equal(second.continuationToken.rankBefore,token.rankBefore-1);
      assert.equal(chooseMathsOpponent(child,strong,
        {...token,rankBefore:token.rankBefore+2}),null,
        'forged non-decreasing proof potential must fail closed');
      replies++;
    }
  }
  assert.ok(byColour.w>0&&byColour.b>0,JSON.stringify(byColour));
  assert.ok(cases>=2);
  assert.ok(replies>=4);
});
