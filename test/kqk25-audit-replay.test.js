import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {
  makeBoard,newGame,opposite,legalMoves,positionKey
} from '../src/chess.js';
import {chooseMathsOpponent,mathsPlayMove} from '../src/maths-play-policy.js';

const args=['scripts/kqk21-adversarial.mjs',
  '--attempts=256','--per-family=1','--nodes=120','--rounds=12'];
const run=cache=>JSON.parse(execFileSync(process.execPath,
  [...args,'--cache='+cache],{encoding:'utf8',timeout:30000,
    maxBuffer:4*1024*1024}));

test('S025 diagnostic closure reuse is explicit, reproducible and never claims certification',()=>{
  const exact=run('exact'),monotone=run('monotone'),again=run('monotone');
  assert.deepEqual(monotone,again,'same seed, same result');
  assert.equal(exact.cacheMode,'exact');
  assert.equal(monotone.cacheMode,'monotone');
  assert.equal(exact.crossDepthClosedReuses,0);
  assert.ok(Number.isSafeInteger(monotone.crossDepthClosedReuses));
  assert.ok(monotone.crossDepthClosedReuses>=0);
  assert.equal(exact.roots,monotone.roots);
  assert.equal(exact.clockHistoryCertified,false);
  assert.equal(monotone.clockHistoryCertified,false);
  assert.equal(monotone.allRepliesMate+monotone.falsified+
    monotone.inconclusive,monotone.roots);
  assert.ok(monotone.visitedNodes>0);
  // The finite diagnostic cannot certify all legal KQK games even if
  // all of these sample roots happen to be mate-closed.
});

test('S025 first cap reports the actual source-token and board after replaying every real move',()=>{
  const summary=run('exact');
  assert.ok(summary.firstInconclusive.length>0,
    'small deliberate node cap must produce replayable witnesses');
  for(const root of summary.firstInconclusive.slice(0,4)){
    const strong=root.strong,board=makeBoard();
    board[root.king]=strong+'K';board[root.queen]=strong+'Q';
    board[root.weak]=opposite(strong)+'K';
    let state=newGame(board,root.turn,'kqk',{experimentalKQK:true});
    let token=null;
    const {path,at}=root.firstCap;
    assert.ok(Array.isArray(path));
    for(const [index,step] of path.entries()){
      const [actor,part1,part2]=step.split(':');
      const phase=actor==='source'?part1:null;
      const indices=actor==='source'?part2:part1;
      const [from,to]=indices.split('-').map(Number);
      let move;
      if(actor==='source'){
        const choice=chooseMathsOpponent(state,strong,token);
        assert.ok(choice?.move,'missing source at trace step '+index);
        assert.equal(choice.sourcePhase,phase);
        move=choice.move;
        token=choice.continuationToken;
      }else{
        assert.equal(actor,'defender');
        move=legalMoves(state.board,opposite(strong))
          .find(m=>m.from===from&&m.to===to);
      }
      assert.ok(move,'illegal replay at '+index+': '+step);
      assert.equal(move.from,from);
      assert.equal(move.to,to);
      state=mathsPlayMove(state,move);
    }
    assert.equal(at.strong,strong);
    assert.equal(at.turn,state.turn);
    assert.equal(at.king,state.board.indexOf(strong+'K'));
    assert.equal(at.queen,state.board.indexOf(strong+'Q'));
    assert.equal(at.weak,state.board.indexOf(opposite(strong)+'K'));
    assert.equal(at.positionKey,positionKey(state.board,state.turn));
    assert.equal(at.moveCount,state.log.length);
    assert.deepEqual(at.token,token?{
      kind:token.kind,frame:token.frame,queen:token.queen,
      king:token.king,weak:token.weak,moveCount:token.moveCount
    }:null);
  }
});
