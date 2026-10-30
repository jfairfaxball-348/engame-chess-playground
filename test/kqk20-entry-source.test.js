import test from 'node:test';
import assert from 'node:assert/strict';
import {makeBoard,squareAt,opposite,newGame,validateSetup,legalMoves,outcome} from '../src/chess.js';
import {kqkSourceChoice,KQK_FRAMES} from '../src/kqk-source-policy.js';
import {mathsPlayMove,chooseMathsOpponent} from '../src/maths-play-policy.js';

function start(strong,sk,q,wk) {
  const b=makeBoard(),at=([x,y])=>squareAt(x,y);
  b[at(sk)]=strong+'K';b[at(q)]=strong+'Q';b[at(wk)]=opposite(strong)+'K';
  assert.equal(validateSetup(b,'kqk',strong),null,'legal fresh root');
  return newGame(b,strong,'kqk',{experimentalKQK:true});
}
function step(s,strong,token=null) {
  const c=chooseMathsOpponent(s,strong,token);
  assert.ok(c?.move,'missing proof-tagged KQK choice');
  assert.match(c.sourcePhase,/^KQK\./);
  assert.ok(legalMoves(s.board,strong).some(m=>m.from===c.move.from&&m.to===c.move.to));
  return c;
}
test('SameRankEntry: positive king descent is source-derived for both sides',()=>{
  for(const strong of ['w','b']){
    const s=start(strong,[2,2],[0,2],[6,7]),c=step(s,strong);
    assert.equal(c.sourcePhase,'KQK.SameRankEntry.positive_right_entry.king_down');
    assert.equal(c.move.to,squareAt(2,1));
    const after=mathsPlayMove(s,c.move);
    assert.equal(outcome(after.board,after.turn).kind,'ongoing');
    for(const reply of legalMoves(after.board,opposite(strong))) {
      assert.ok(step(mathsPlayMove(after,reply),strong).move);
    }
  }
});
test('SameRankEntry: protected backrank raises queen without stalemate',()=>{
  for(const strong of ['w','b']){
    const s=start(strong,[2,0],[3,0],[6,7]),c=step(s,strong);
    assert.match(c.sourcePhase,/^KQK.SameRankEntry\./);
    assert.equal(c.move.to,squareAt(3,1));
    assert.equal(outcome(mathsPlayMove(s,c.move).board,opposite(strong)).kind,'ongoing');
  }
});
test('TightEntry king-approach token preserves source-pair continuation against every reply',()=>{
  for(const strong of ['w','b']){
    const s=start(strong,[1,1],[0,3],[5,2]),c=step(s,strong);
    assert.equal(c.sourcePhase,'KQK.TightEntry.tight_king_step.king_approach');
    assert.equal(c.continuationToken?.kind,'tight-file');
    const after=mathsPlayMove(s,c.move),replies=legalMoves(after.board,opposite(strong));
    assert.ok(replies.length>0);
    for(const reply of replies) {
      const responseState=mathsPlayMove(after,reply);
      const next=step(responseState,strong,c.continuationToken);
      assert.match(next.sourcePhase,/^KQK.TightEntry.protected_file_entry\./);
      assert.equal(kqkSourceChoice(responseState,strong,
        {...c.continuationToken,queen:17}),null,'forged token fails');
    }
  }
});
test('new entry paths never enable the certified selector or change the eight source frames',()=>{
  assert.equal(KQK_FRAMES.length,8);
  for(const strong of ['w','b']){
    const s=start(strong,[1,1],[0,3],[5,2]);
    assert.equal(step(s,strong).mathematicallyCertifiedSelector,false);
  }
});
