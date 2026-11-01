import test from 'node:test';
import assert from 'node:assert/strict';
import {auditS036KQK,auditS036KRK,probeS036Tree}
  from '../scripts/s036-cross-phase-audit.mjs';

test('S036 uses real far-file continuation tokens and separate legal tight roots',()=>{
  const result=auditS036KQK({maxPrepared:2,maxTight:1,maxNodes:12,maxPairs:8});
  assert.ok(result.sampledRoots>=2);
  assert.ok(result.reports.some(r=>r.origin==='prepared'));
  assert.ok(result.reports.some(r=>r.origin==='already-far-tight'));
  assert.equal(result.genuinePreparationTokensOnly,true);
  assert.equal(result.universalMatingCertified,false);
  for(const r of result.reports) {
    assert.ok(r.nodes>0);
    assert.equal(r.completeGlobalMateProof,false);
    assert.equal(r.fideHistoryCertified,false);
    assert.ok(['mate-closed','resource-cap','potential-cycle','counterexample']
      .includes(r.verdict));
  }
});

test('S036 KRK continuation probes retain proof gaps rather than declaring total mate',()=>{
  const r=auditS036KRK({maxRoots:2,maxNodes:12,maxPairs:8});
  assert.equal(r.reports.length,2);
  assert.equal(r.frozenGlobalRankTheoremAvailable,false);
  assert.equal(r.universalMatingCertified,false);
  for(const report of r.reports){
    assert.ok(report.nodes>0);
    assert.equal(report.completeGlobalMateProof,false);
    assert.ok(report.sourceMoves>0);
  }
});

test('S036 rejects fake materials and invalid audit resource caps',()=>{
  assert.throws(()=>probeS036Tree('kpk',{},'w'),RangeError);
  assert.throws(()=>auditS036KQK({maxNodes:0}),RangeError);
  assert.throws(()=>auditS036KRK({maxRoots:0}),RangeError);
});
