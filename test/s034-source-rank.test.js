import test from 'node:test';
import assert from 'node:assert/strict';
import {auditKQK34TightObstruction,auditKQK34Reachability}
  from '../scripts/kqk34-reachability.mjs';
import {auditKRK34RankObligations}
  from '../scripts/krk34-rank-obligations.mjs';

test('S034 finite rank arithmetic prohibits a tight-above post-preparation reply',()=>{
  const a=auditKQK34TightObstruction();
  assert.ok(a.premiseRankTuples>0);
  assert.equal(a.tightPostconditions,0);
  assert.equal(a.impossibleAfterGenuinePreparation,true);
});

test('S034 replays genuine S025 prepared roots through every first and second weak reply',()=>{
  // Four source-issued seeds among 16 colour/frame fixtures, not synthetic
  // continuation tokens or a re-preparation move from a free root.
  const a=auditKQK34Reachability({maxLegalRoots:1,maxPreparedRoots:4});
  assert.equal(a.preparedRoots,4);
  assert.equal(a.defenderReplies,24);
  assert.deepEqual(a.originalCases,{
    'separating-rank':0,'direct-small-file':0,
    'horizontal-far-wall':24,'tight-above':0});
  assert.equal(a.repeatedPreparation,0);
  assert.equal(a.unclassified,0);
  assert.equal(a.missingFirstSource,0);
  assert.equal(a.authenticatedBackrank,24);
  assert.equal(a.independentUnverified,0);
  assert.equal(a.crossFrame,24);
  assert.equal(a.sameFrame,0);
  assert.ok(a.secondWeakReplies>=a.secondSourceMoves+a.missingSecondSource);
  assert.equal(a.genuineTokensOnly,true);
  assert.equal(a.allDefenderTerminationCertified,false);
  assert.equal(a.originalCaseCorrespondenceCertified,false);
});

test('S034 bounded canonical legal roots do not silently become a universal proof',()=>{
  const a=auditKQK34Reachability({maxLegalRoots:32,maxPreparedRoots:6});
  assert.ok(a.candidateRoots>=16);
  assert.ok(a.preparedRoots>=4);
  assert.ok(a.preparedRoots<=6);
  assert.equal(a.originalCases['tight-above'],0);
  assert.equal(a.arithmetic.impossibleAfterGenuinePreparation,true);
  assert.equal(a.allDefenderTerminationCertified,false);
});

test('S034 KRK rank obligations preserve exact source edge totals and missing theorem',()=>{
  const a=auditKRK34RankObligations();
  assert.equal(a.roots,24);
  assert.equal(a.firstReplies,168);
  assert.equal(a.secondReplies,980);
  assert.equal(a.sourceMoves,980);
  assert.equal(a.missingSource,0);
  assert.equal(a.rookCaptures,0);
  assert.equal(a.nonmateTerminals,0);
  assert.ok(a.distinctSecondSourceLabels>0);
  assert.ok(a.sourceObligations.every(r=>r.needsSourceRankProof));
  assert.equal(a.transitions,Object.values(a.sourceObligations)
    .reduce((sum,row)=>sum+row.observedReplies,0));
  assert.equal(a.sourceRankTheoremFrozen,false);
  assert.equal(a.allDefenderTerminationCertified,false);
  assert.match(a.firstMissingProofBridge,/Classical\.choose/);
});
