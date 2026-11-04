import test from 'node:test';
import assert from 'node:assert/strict';
import {legalMoves,makeBoard,newGame,opposite,outcome,squareAt}
  from '../src/chess.js';
import {mathsPlayMove} from '../src/maths-play-policy.js';
import {KQK32_FRAMES} from '../scripts/kqk32-far-file-audit.mjs';
import {auditS046KQKRoots} from '../scripts/s046-root-census.mjs';

test('S046 real legal weak-to-move KQK has an immediate KK draw in every D4 frame and colour',()=>{
  let checked=0;
  for(const strong of ['w','b']){
    const weak=opposite(strong);
    for(const [frame,transform] of Object.entries(KQK32_FRAMES)){
      const at=(p)=>squareAt(...transform(p));
      // K(a1), Q(d4), k(e5): the weak king may legally capture
      // the checking but unprotected queen, reducing to drawn K/K.
      const board=makeBoard();
      board[at([0,0])]=strong+'K';
      board[at([3,3])]=strong+'Q';
      board[at([4,4])]=weak+'K';
      const root=newGame(board,weak,'kqk',{experimentalKQK:true});
      const capture=legalMoves(root.board,weak).find(
        m=>m.from===at([4,4])&&m.to===at([3,3])&&
          m.capture===strong+'Q');
      assert.ok(capture,frame+' '+strong+' must have a lawful queen capture');
      const child=mathsPlayMove(root,capture);
      assert.equal(child.material,'kk');
      assert.equal(child.board.includes(strong+'Q'),false);
      assert.equal(outcome(child.board,child.turn).kind,'ongoing');
      checked++;
    }
  }
  assert.equal(checked,16);
});

test('S046 census independently samples both turns/colours, distinguishes root coverage from termination',()=>{
  const r=auditS046KQKRoots({maxLegalPerGroup:8,maxExamples:2});
  const groups=Object.values(r.groups);
  assert.equal(groups.length,4);
  for(const group of groups){
    assert.equal(group.legalRoots,8);
    assert.equal(group.sampledLegalRootsOnly,true);
    assert.equal(group.exhaustedShard,false);
    assert.ok(group.distinctObservedD4Orbits>0);
    assert.equal(group.terminal.mate+group.terminal.stalemate+
      group.terminal.other+group.ongoing,group.legalRoots);
    assert.equal(group.illegalSourceMove,0);
    assert.equal(group.followingIllegalSourceMove,0);
  }
  assert.equal(r.scope.shardCount,1);
  assert.equal(r.allRootBoardsEnumerated,false);
  assert.equal(r.sourceIssuedTokensOnly,true);
  assert.equal(r.allDefenderTerminationCertified,false);
  assert.equal(r.universalKQKMatingCertified,false);
});

test('S046 sharding maintains independent root accounting without implying universal closure',()=>{
  const r=auditS046KQKRoots({
    maxLegalPerGroup:4,shardIndex:1,shardCount:4,inspectReplies:false
  });
  assert.equal(Object.keys(r.groups).length,4);
  assert.ok(Object.values(r.groups).every(g=>g.legalRoots===4));
  assert.equal(r.allRootBoardsEnumerated,false);
  assert.equal(r.universalKQKMatingCertified,false);
  assert.throws(()=>auditS046KQKRoots({shardIndex:2,shardCount:2}),
    RangeError);
});
