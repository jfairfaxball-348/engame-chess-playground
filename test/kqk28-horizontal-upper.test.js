import test from 'node:test';
import assert from 'node:assert/strict';
import {
  makeBoard,newGame,legalMoves,opposite,squareAt,validateSetup
} from '../src/chess.js';
import {chooseMathsOpponent,mathsPlayMove} from '../src/maths-play-policy.js';

// OrientedEntry.horizontal_far_wall_entry at frozen c72365a:
// forward sk.file=5, wk.file=7, weak.rank >= king.rank+1,
// |queen.rank-weak.rank|=2, no separating rank wall, no corner exception.
// In the upper branch queen.rank=weak.rank+2; the old JS selector
// restricted the horizontal construction to weak.rank=king.rank+1.
// The source proves the Q(6,queen.rank) transition to reflected EdgeWall.
const frames=[
  ([x,y])=>[x,y],([x,y])=>[7-x,y],([x,y])=>[x,7-y],
  ([x,y])=>[7-x,7-y],([x,y])=>[y,x],([x,y])=>[7-y,7-x],
  ([x,y])=>[7-y,x],([x,y])=>[y,7-x]
];
const source='KQK.OrientedEntry.horizontal_far_wall_entry.narrow_queen_to_six';
const fixtures=[
  {king:[5,1],queen:[0,5],weak:[7,3]},
  {king:[5,2],queen:[1,6],weak:[7,4]}
];

test('S028 frozen narrow horizontal construction reaches EdgeWall in upper-gap cases',()=>{
  const exercised=new Set();
  for(const strong of ['w','b'])for(const transform of frames)for(const f of fixtures){
    const at=([x,y])=>squareAt(...transform([x,y]));
    const board=makeBoard(),weak=opposite(strong);
    board[at(f.king)]=strong+'K';
    board[at(f.queen)]=strong+'Q';
    board[at(f.weak)]=weak+'K';
    assert.equal(validateSetup(board,'kqk',strong),null);
    const root=newGame(board,strong,'kqk',{experimentalKQK:true});
    const chosen=chooseMathsOpponent(root,strong);
    assert.ok(chosen?.move,'legal fixture needs a source-derived first move');
    assert.ok(legalMoves(board,strong).some(
      m=>m.from===chosen.move.from&&m.to===chosen.move.to));
    // Symmetric frames can legitimately dispatch a different earlier Lean
    // theorem. Only attribute this specific edge-wall step where it fires.
    if(chosen.sourcePhase!==source)continue;
    exercised.add(strong);
    const after=mathsPlayMove(root,chosen.move);
    assert.equal(after.board.indexOf(strong+'Q'),chosen.move.to);
    assert.ok(!legalMoves(after.board,weak).some(
      m=>m.capture===strong+'Q'),'the frozen move cannot hang the queen');
    const replies=legalMoves(after.board,weak);
    assert.ok(replies.length>0);
    for(const reply of replies){
      const next=mathsPlayMove(after,reply);
      const follow=chooseMathsOpponent(next,strong,chosen.continuationToken);
      assert.ok(follow?.move,
        'framed EdgeWall must offer a source-defined reply after '+
        reply.from+'-'+reply.to);
      assert.ok(legalMoves(next.board,strong).some(
        m=>m.from===follow.move.from&&m.to===follow.move.to));
    }
  }
  assert.deepEqual([...exercised].sort(),['b','w'],
    'the new high-file source construction must be exercised in both colours');
});

test('S028 wider vertical gap is not silently assumed to be one rank',()=>{
  for(const strong of ['w','b']){
    const board=makeBoard();
    board[squareAt(5,1)]=strong+'K';
    board[squareAt(0,5)]=strong+'Q';
    board[squareAt(7,3)]=opposite(strong)+'K';
    const root=newGame(board,strong,'kqk',{experimentalKQK:true});
    const choice=chooseMathsOpponent(root,strong);
    assert.equal(choice?.sourcePhase,source);
    assert.equal(choice.move.from,squareAt(0,5));
    assert.equal(choice.move.to,squareAt(6,5));
    assert.ok(!choice.continuationToken,'the edge wall is source-ready after Q6');
  }
});
