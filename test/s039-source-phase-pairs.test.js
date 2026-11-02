import test from 'node:test';
import assert from 'node:assert/strict';
import {auditS039SourcePairs} from '../scripts/s039-source-phase-pairs.mjs';

test('S039 every second defender reply preserves genuine source history and token',()=>{
  const r=auditS039SourcePairs({
    maxTuples:750,maxPrepared:3,maxNodes:24,maxPairs:10,maxKrkRoots:4});
  assert.ok(r.genuinePreparedRoots>0);
  assert.ok(r.firstWeakReplies>0);
  assert.ok(r.secondWeakReplies>0);
  assert.equal(r.globalMateCertified,false);
  assert.equal(r.krkGlobalPhaseCompositionCertified,false);
  assert.equal(r.fideHistoryCertified,false);
  assert.equal(r.firstSourceMoves,
    r.firstSourceAuthenticated+r.firstSourceFailedPremise+
    r.firstSourceUnchecked);
  assert.equal(r.thirdSourceMoves,
    r.thirdSourceAuthenticated+r.thirdSourceFailedPremise+
    r.thirdSourceUnchecked);
  assert.equal(r.roots.length,r.genuinePreparedRoots);
  assert.equal(r.firstWeakReplies,
    r.roots.reduce((n,x)=>n+x.firstReplies.length,0));
  assert.equal(r.secondWeakReplies,r.roots.reduce((n,x)=>n+
    x.firstReplies.reduce((a,b)=>a+b.secondReplies.length,0),0));
  assert.equal(r.firstSourceFailedPremise,0,
    'the real low-wall first source action must satisfy its own premises');
  for(const root of r.roots){
    assert.equal(root.token.kind,'far-file');
    for(const first of root.firstReplies){
      assert.equal(first.moveHistory.length,2,
        'first replay must contain the actual preparation and defender move');
      assert.equal(first.budgets.length,2);
      for(const second of first.secondReplies){
        assert.equal(second.moveHistory.length,4,
          'no synthetic two-reply state; retain each actual ply');
        assert.match(second.weakReply,/^[0-9]+-[0-9]+$/);
        if(second.result==='source')assert.ok(second.selectedRule);
        if(second.continuationToken)
          assert.equal(second.continuationToken.strong,root.strong);
      }
    }
  }
  for(const b of r.outcomes)
    assert.equal(b.mateClosed+b.unsupported+b.capture+b.nonmate+
      b.potentialCycle+b.resourceCap,r.firstWeakReplies);
  assert.ok(r.firstKRKCrossPhase,
    'retain real KRK central/restoration phase handoff');
});

test('S039 exact repeated scan has identical root, move and cap identities',()=>{
  const options={maxTuples:400,maxPrepared:1,maxNodes:12,
    maxPairs:8,maxKrkRoots:4};
  const a=auditS039SourcePairs(options),b=auditS039SourcePairs(options);
  assert.deepEqual(a,b);
});

test('S039 strictly rejects invalid budgets and candidate limits',()=>{
  assert.throws(()=>auditS039SourcePairs({maxPairs:0}),RangeError);
  assert.throws(()=>auditS039SourcePairs({maxTuples:73729}),RangeError);
  assert.throws(()=>auditS039SourcePairs({maxKrkRoots:0}),RangeError);
});
