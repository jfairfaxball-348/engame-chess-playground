import test from 'node:test';
import assert from 'node:assert/strict';
import {
  makeBoard,newGame,legalMoves,play,positionKey,squareAt,outcome,
  MATERIAL,opposite
} from '../src/chess.js';
import {setupVerdict} from '../src/maths-model.js';
import {
  KRK_EXPERIMENTAL_PLAYABLE,chooseMathsOpponent,mathsPlayMove
} from '../src/maths-play-policy.js';
import {KRK_GAMEPLAY_RELEASED,KRK_FRAMES,krkTransformSquare}
  from '../src/krk-local-witness.js';

function root(strong,frame='id',sk=[2,1],rs=[0,2],wk=[5,3],turn=strong){
  const board=makeBoard();
  for(const [coords,piece] of [
    [sk,strong+'K'],[rs,strong+'R'],[wk,opposite(strong)+'K']
  ])board[krkTransformSquare(squareAt(...coords),frame)]=piece;
  return {board,turn,material:'krk',halfmove:0,log:[],
    history:[positionKey(board,turn)]};
}

test('KRK16 starts legal user-arranged KRK as explicitly experimental, without lifting certified release flag',()=>{
  const s=root('w');
  assert.equal(KRK_EXPERIMENTAL_PLAYABLE,true);
  assert.equal(MATERIAL.krk.playable,false);
  assert.equal(KRK_GAMEPLAY_RELEASED,false);
  assert.equal(setupVerdict(s.board,s.turn).canStart,true);
  assert.equal(setupVerdict(s.board,s.turn).experimental,true);
  assert.throws(()=>newGame(s.board,s.turn,'krk'),/certified playground/);
  const game=newGame(s.board,s.turn,'krk',{experimentalKRK:true});
  assert.deepEqual(game.board,s.board);
  assert.equal(game.turn,s.turn);
  assert.equal(game.history.length,1);
  assert.equal(game.halfmove,0);
});

test('KRK16 source-derived attacker moves legally, both colours, all four frames, across real weak replies',()=>{
  for(const strong of ['w','b'])for(const frame of KRK_FRAMES){
    const s=root(strong,frame);
    const first=chooseMathsOpponent(s,strong);
    assert.ok(first?.move,JSON.stringify({strong,frame}));
    assert.equal(first.origin,'experimental-proof-derived-krk');
    assert.equal(first.mathematicallyCertifiedSelector,false);
    assert.equal(first.fideClockHistoryCertified,false);
    assert.ok(legalMoves(s.board,s.turn).some(m=>m.from===first.move.from&&m.to===first.move.to));
    const after=mathsPlayMove(s,first.move);
    const replies=legalMoves(after.board,after.turn);
    assert.ok(replies.length);
    for(const weakMove of replies){
      assert.equal(weakMove.capture,null);
      const child=mathsPlayMove(after,weakMove);
      const second=chooseMathsOpponent(child,strong,first.continuationToken);
      assert.ok(second?.move,JSON.stringify({strong,frame,weakMove}));
      assert.ok(legalMoves(child.board,child.turn).some(
        m=>m.from===second.move.from&&m.to===second.move.to));
    }
  }
});

test('KRK16 refuses mismatched turns and invented tags; no substitute move allowed',()=>{
  const s=root('w'),first=chooseMathsOpponent(s,'w');
  assert.equal(chooseMathsOpponent(s,'b'),null);
  const after=play(s,first.move);
  const weak=play(after,legalMoves(after.board,'b')[0]);
  assert.equal(chooseMathsOpponent(weak,'w',{kind:'fabricated'}),null);
});

test('KRK16 rook capture becomes real KK dead-draw play, not a stuck KRK attacker',()=>{
  const s=root('w','id',[4,0],[0,7],[1,7],'b');
  const v=setupVerdict(s.board,s.turn);
  assert.equal(v.canStart,true);
  const game=newGame(s.board,s.turn,'krk',{experimentalKRK:true});
  const take=legalMoves(game.board,'b').find(m=>m.capture==='wR');
  assert.ok(take);
  const after=mathsPlayMove(game,take);
  assert.equal(after.material,'kk');
  assert.equal(after.board.filter(Boolean).length,2);
  assert.equal(outcome(after.board,after.turn,after.history,after.halfmove).kind,'ongoing');
  const reply=chooseMathsOpponent(after,'w');
  assert.ok(reply?.move);
  assert.equal(reply.continuationToken,null);
  assert.equal(reply.origin,'dead-position-choice');
});
