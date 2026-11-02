import test from 'node:test';
import assert from 'node:assert/strict';
import {auditS041CapSweep} from '../scripts/s041-cap-sweep.mjs';

const options={maxTuples:400,maxPrepared:1,baseNodes:8,
  basePairs:4,maxKrkRoots:4,maxExamples:2};

test('S041 replays the SAME genuine prepared roots and tokens at 1x/2x/4x',()=>{
  const r=auditS041CapSweep(options);
  assert.ok(r.preparedRoots>0);
  assert.ok(r.legalFirstReplies>0);
  assert.equal(r.counts.length,3);
  assert.deepEqual(r.counts.map(x=>x.factor),[1,2,4]);
  assert.equal(r.exactHistoryAndTokenReplay,true);
  assert.equal(r.monotoneClosedTrees,true);
  assert.equal(r.s039FirstSourceFailedPremise,0);
  assert.ok(r.firstKRKCrossPhase);
  for(const budget of r.counts){
    assert.equal(budget['mate-closed']+budget['resource-cap']+
      budget['potential-cycle']+budget.counterexample,r.legalFirstReplies);
  }
  for(const example of r.examples){
    assert.equal(example.moveHistory.length,2);
    assert.equal(example.token.kind,'far-file');
    assert.equal(example.verdicts.length,3);
    if(example.verdicts[0]==='mate-closed')
      assert.equal(example.verdicts[1],'mate-closed');
    if(example.verdicts[1]==='mate-closed')
      assert.equal(example.verdicts[2],'mate-closed');
  }
  assert.equal(r.globalKQKMateCertified,false);
  assert.equal(r.krkGlobalPhaseCompositionCertified,false);
  assert.equal(r.fideHistoryCertified,false);
});

test('S041 preserves a category-specific cap witness independent of firstProblem',()=>{
  const r=auditS041CapSweep({...options,baseNodes:4,basePairs:2});
  assert.ok(r.first4xResourceCap||r.first4xCounterexample||
    r.first4xPotentialCycle||r.counts[2]['mate-closed']>0);
  if(r.first4xResourceCap){
    const issue=r.first4xResourceCap.large.firstIssues.cap;
    assert.ok(issue);
    assert.match(issue.kind,/cap/);
    assert.equal(r.first4xResourceCap.moveHistory.length,2);
  }
});

test('S041 rejects invalid and unsafe resource budgets',()=>{
  assert.throws(()=>auditS041CapSweep({...options,baseNodes:0}),RangeError);
  assert.throws(()=>auditS041CapSweep({...options,basePairs:25001}),RangeError);
  assert.throws(()=>auditS041CapSweep({...options,maxTuples:73729}),RangeError);
});
