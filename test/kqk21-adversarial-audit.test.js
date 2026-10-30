import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

// Contract test for a DIAGNOSTIC, not a release proof. This deliberately
// checks complete adversarial defender fanout and honest failure categories.
test('KQK21 bounded all-defender audit is reproducible and reports uncertainty',()=>{
  const args=['scripts/kqk21-adversarial.mjs','--attempts=128',
    '--per-family=1','--nodes=80','--rounds=6'];
  const run=()=>JSON.parse(execFileSync(process.execPath,args,{
    encoding:'utf8',timeout:25000,maxBuffer:1024*1024
  }));
  const a=run(),b=run();
  assert.deepEqual(a,b,'fixed seed audit must reproduce the same verdicts');
  assert.equal(a.diagnosticOnly,true);
  assert.equal(a.clockHistoryCertified,false);
  assert.ok(a.roots>0);
  assert.equal(a.allRepliesMate+a.falsified+a.inconclusive,a.roots);
  assert.ok(a.legalDefenderRepliesVisited>0,'must visit actual weak replies');
  assert.ok(a.visitedNodes>0);
  assert.ok(a.roots<=a.legalCandidates);
  assert.ok(a.inconclusive>=0,'caps must not be silently counted as mate');
  for(const f of Object.values(a.families))
    assert.equal(f.allRepliesMate+f.falsified+f.inconclusive,f.roots);
});


test('S021 frozen SameRankEntry repairs real adversarial audit unsupported root',async()=>{
  const {makeBoard,opposite,newGame,validateSetup,legalMoves,squareAt}=await import('../src/chess.js');
  const {chooseMathsOpponent,mathsPlayMove}=await import('../src/maths-play-policy.js');
  const transforms=[
    ([x,y])=>[x,y],([x,y])=>[7-x,y],([x,y])=>[x,7-y],
    ([x,y])=>[7-x,7-y],([x,y])=>[y,x],([x,y])=>[7-y,7-x],
    ([x,y])=>[7-y,x],([x,y])=>[y,7-x]
  ];
  for(const strong of ['w','b'])for(const transform of transforms){
    const board=makeBoard(),at=pos=>squareAt(...transform(pos));
    board[at([0,7])]=strong+'K';
    board[at([0,5])]=strong+'Q';
    board[at([2,6])]=opposite(strong)+'K';
    assert.equal(validateSetup(board,'kqk',strong),null);
    const s=newGame(board,strong,'kqk',{experimentalKQK:true});
    const c=chooseMathsOpponent(s,strong);
    assert.ok(c?.move,'frozen missing backrank case must be playable in all frames');
    assert.match(c.sourcePhase,/^KQK\./);
    const after=mathsPlayMove(s,c.move);
    for(const move of legalMoves(after.board,opposite(strong))){
      const child=mathsPlayMove(after,move);
      assert.equal(child.material,'kqk','immediate KxQ would falsify the proof step');
      assert.ok(chooseMathsOpponent(child,strong,c.continuationToken)?.move,
        'every immediate reply must enter the source policy');
    }
  }
});
