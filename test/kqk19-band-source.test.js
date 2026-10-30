import test from 'node:test';
import assert from 'node:assert/strict';
import {makeBoard,squareAt,opposite,positionKey,newGame,legalMoves,outcome,validateSetup} from '../src/chess.js';
import {chooseMathsOpponent,mathsPlayMove} from '../src/maths-play-policy.js';
import {KQK_FRAMES,kqkSourceChoice} from '../src/kqk-source-policy.js';

const sq=(p)=>squareAt(...p);
function start(strong,sk,qs,wk) {
  const b=makeBoard();b[sq(sk)]=strong+'K';b[sq(qs)]=strong+'Q';b[sq(wk)]=opposite(strong)+'K';
  assert.equal(validateSetup(b,'kqk',strong),null,'fresh strong-turn root');
  return newGame(b,strong,'kqk',{experimentalKQK:true});
}
function step(state,strong,token=null) {
  const c=chooseMathsOpponent(state,strong,token);
  assert.ok(c?.move,'expected constructive choice from '+JSON.stringify(state.board));
  assert.match(c.sourcePhase,/^KQK\./);
  assert.ok(legalMoves(state.board,strong).some(m=>m.from===c.move.from&&m.to===c.move.to));
  return c;
}
test('fixed separating wall: vertical king preparation from an exact user setup',()=>{
  for(const strong of ['w','b']) {
    const s=start(strong,[1,0],[2,2],[6,7]);
    const c=step(s,strong);
    assert.equal(c.sourcePhase,'KQK.BandEntry.wall_prepare_bound.vertical');
    assert.equal(c.move.from,sq([1,0]));assert.equal(c.move.to,sq([1,1]));
    const post=mathsPlayMove(s,c.move);
    assert.ok(legalMoves(post.board,opposite(strong)).length>0);
    for(const r of legalMoves(post.board,opposite(strong))){
      const reply=mathsPlayMove(post,r);
      assert.ok(chooseMathsOpponent(reply,strong,c.continuationToken)?.move,
        'Every legal weak reply retains a constructive continuation');
    }
  }
});
test('prepared band king step advances the file without resetting it',()=>{
  for(const strong of ['w','b']){
    const s=start(strong,[2,1],[2,2],[6,7]);
    const c=step(s,strong);
    assert.equal(c.sourcePhase,'KQK.BandProgress.prepared_king_step');
    assert.equal(c.move.to,sq([3,1]));
    const after=mathsPlayMove(s,c.move);
    for(const r of legalMoves(after.board,opposite(strong))){
      const reply=mathsPlayMove(after,r);
      const next=step(reply,strong);
      assert.ok(next.move.from===sq([3,1])||next.move.from===sq([2,2]));
      assert.notEqual(next.move.to,sq([2,1]),'do not walk back to the queen file');
    }
  }
});
test('prepared band queen step shifts exactly to the proved weak-adjacent file',()=>{
  const s=start('w',[4,2],[2,3],[5,7]);
  const c=step(s,'w');
  assert.equal(c.sourcePhase,'KQK.BandProgress.prepared_queen_step');
  assert.equal(c.move.from,sq([2,3]));assert.equal(c.move.to,sq([4,3]));
});
test('king cross is followed by the source-mandated queen rank rise for every legal weak reply',()=>{
  for(const strong of ['w','b']){
    const s=start(strong,[4,1],[4,2],[5,5]);
    const c=step(s,strong);
    assert.equal(c.sourcePhase,'KQK.BandRaise.king_cross');
    assert.equal(c.move.to,sq([5,2]));
    assert.equal(c.continuationToken?.kind,'band-raise');
    const after=mathsPlayMove(s,c.move);
    const replies=legalMoves(after.board,opposite(strong));
    assert.ok(replies.length);
    for(const r of replies) {
      const reply=mathsPlayMove(after,r);
      const response=step(reply,strong,c.continuationToken);
      assert.equal(response.sourcePhase,'KQK.BandRaise.prepared_raise_bound.queen_rise');
      assert.equal(response.move.to,sq([4,3]));
      assert.equal(chooseMathsOpponent(reply,strong,{...c.continuationToken,weak:8}),null,
        'forged continuation must fail closed');
    }
  }
});
test('rank-five knight prison steps work from either player colour',()=>{
  for(const strong of ['w','b']){
    const s=start(strong,[2,2],[5,5],[6,7]);
    const c=step(s,strong);
    assert.equal(c.sourcePhase,'KQK.KnightPrison.knight_top_bound');
    assert.equal(c.move.to,sq([4,6]));
    assert.notEqual(outcome(mathsPlayMove(s,c.move).board,opposite(strong)).kind,'stalemate');
  }
});
test('uncovered fresh positions still refuse; all eight proof frames remain present',()=>{
  assert.equal(KQK_FRAMES.length,8);
  const s=start('w',[4,0],[0,0],[4,7]);
  assert.equal(kqkSourceChoice(s,'w'),null);
});
