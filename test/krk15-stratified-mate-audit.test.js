import test from 'node:test';
import assert from 'node:assert/strict';
import {
  krk14ControlStateKey,auditKRK14MateTree
} from '../scripts/krk14-mate-tree.mjs';
import {
  KRK15_SOURCE_FIXTURES,krk15StratifiedRoots,
  auditKRK15StratifiedMateTrees
} from '../scripts/krk15-stratified-mate-audit.mjs';
import {KRK_FRAMES} from '../src/krk-local-witness.js';
import {krkTaggedStrongChoice} from '../src/krk-tagged-strategy.js';

test('KRK15 cycle key includes every nested source-control parameter',()=>{
  const control={mode:'prepared',frame:'id',historyLength:7,halfmove:6,
    afterStrongKey:'a',inner:{
      stage:'central',rankBefore:8,frame:'id',historyLength:7,
      inner:{stage:'centre',orientation:'positive-x',
        targetFile:4,halfmove:6,afterStrongKey:'b'}}};
  const key=krk14ControlStateKey(control);
  assert.equal(key,krk14ControlStateKey({
    ...control,historyLength:100,halfmove:99,
    inner:{...control.inner,historyLength:100,
      inner:{...control.inner.inner,halfmove:99}}
  }));
  for(const changed of [
    {...control,mode:'direct'},
    {...control,frame:'mirror-x'},
    {...control,inner:{...control.inner,rankBefore:7}},
    {...control,inner:{...control.inner,inner:{
      ...control.inner.inner,stage:'lower'}}},
    {...control,inner:{...control.inner,inner:{
      ...control.inner.inner,orientation:'negative-x'}}},
    {...control,inner:{...control.inner,inner:{
      ...control.inner.inner,targetFile:5}}}
  ])assert.notEqual(key,krk14ControlStateKey(changed));
  assert.notEqual(key,krk14ControlStateKey({
    ...control,inner:{...control.inner,inner:{
      ...control.inner.inner,afterStrongKey:'changed'}}
  }));
});

test('KRK15 samples all three source phases, both strong colours and all frames',()=>{
  const roots=krk15StratifiedRoots();
  assert.equal(roots.length,KRK15_SOURCE_FIXTURES.length*2*KRK_FRAMES.length);
  assert.equal(roots.length,24);
  for(const {phase,state} of roots){
    const chosen=krkTaggedStrongChoice(state);
    assert.equal(chosen?.rootPhase,phase);
    assert.equal(chosen.isCompleteWinningPolicy,false);
    assert.equal(chosen.maxMatePlies,null);
  }
});

test('KRK15 falsifies whole games, reporting caps rather than certifying a root',()=>{
  const result=auditKRK15StratifiedMateTrees({
    maxNodes:60,maxPlies:160,maxExamples:24
  });
  assert.equal(result.summary.roots,24);
  assert.equal(result.summary.preparedWall,8);
  assert.equal(result.summary.directEntry,8);
  assert.equal(result.summary.twoStepSetup,8);
  assert.equal(result.summary.rootPhaseMismatches,0);
  assert.equal(result.summary.genuineFailures,0,
    JSON.stringify(result.failures));
  assert.equal(result.reports.length,24);
  assert.equal(result.completeGlobalMateProof,false);
  assert.equal(result.sourceSelectorFormalised,false);
  assert.equal(result.fideClockHistoryCertified,false);
  assert.equal(result.summary.resourceCaps+
    result.summary.completedAllDefenderTrees,24);
  for(const report of result.reports)
    assert.ok(['resource-cap','all-defender-tree-closed'].includes(report.status));
});

test('KRK15 cap validation rejects misleading diagnostic parameters',()=>{
  assert.throws(()=>auditKRK15StratifiedMateTrees({maxNodes:0}),RangeError);
  assert.throws(()=>auditKRK15StratifiedMateTrees({maxPlies:0}),RangeError);
  assert.throws(()=>auditKRK15StratifiedMateTrees({maxExamples:-1}),RangeError);
});

test('KRK15 source controller and diagnostic do not certify mate from small cap',()=>{
  const root=krk15StratifiedRoots()[0].state;
  const result=auditKRK14MateTree(root,{maxNodes:1});
  assert.equal(result.completeGlobalMateProof,false);
  assert.equal(result.fideClockHistoryCertified,false);
  assert.equal(result.firstCounterexample?.reason,'node cap');
});
