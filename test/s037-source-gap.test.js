import test from 'node:test';
import assert from 'node:assert/strict';
import {
  auditS037Prepared,auditS037KRKBridge,compareS037KQKCaches
} from '../scripts/s037-source-gap.mjs';

test('S037 uses source-issued preparation tokens and reports every sampled reply',()=>{
  const r=auditS037Prepared({maxLegalRoots:50,maxPrepared:1,
    maxNodes:8,maxPairs:6,maxExamples:3});
  assert.equal(r.genuineTokensOnly,true);
  assert.equal(r.universalMatingCertified,false);
  assert.equal(r.fideHistoryCertified,false);
  assert.ok(r.preparedRoots>0);
  assert.ok(r.legalDefenderReplies>0);
  assert.equal(r.legalDefenderReplies,
    Object.values(r.originalCases).reduce((a,b)=>a+b,0));
  assert.ok(r.originalFrameAuthenticated+r.switchedFrameAuthenticated+
    r.unverifiedSource+r.missingSource>0);
  assert.equal(r.mateClosedRoots<=r.continuationsProbed,true);
  assert.ok(r.examples.length);
  const first=r.examples[0];
  assert.equal(typeof first.at,'string');
  assert.equal(typeof first.originalFrame,'string');
  assert.ok(first.token);
  assert.ok(Number.isInteger(first.pieces.strongQueen));
});

test('S037 isolates exact KRK cross-phase source obligation without inventing rank',()=>{
  const r=auditS037KRKBridge({maxRoots:2,maxNodes:24,maxPairs:8});
  assert.equal(r.sampledRoots,2);
  assert.equal(r.globalRankTheoremLocated,false);
  assert.equal(r.globalTerminationCertified,false);
  assert.ok(r.nodes>0);
  assert.match(r.preciseOutstandingObligation,/nested continuation token/);
});

test('S037 seeded KQK exact and monotone audits use the same sampled root set',()=>{
  const r=compareS037KQKCaches({attempts:120,perFamily:1,
    maxNodes:45,maxRounds:10});
  assert.equal(r.sameSampling,true);
  assert.equal(r.exact.roots,r.monotone.roots);
  assert.deepEqual(r.lostExactClosedFamilies,[]);
  assert.equal(r.universalMatingCertified,false);
});

test('S037 refuses invalid bounds',()=>{
  assert.throws(()=>auditS037Prepared({maxNodes:0}),RangeError);
  assert.throws(()=>auditS037KRKBridge({maxRoots:0}),RangeError);
  assert.throws(()=>compareS037KQKCaches({maxRounds:0}),RangeError);
});

test('S037 node budgets record skipped legal replies rather than silent caps',()=>{
  // This real preparation orbit historically exhausted exactly the node
  // budget and skipped siblings without marking cappedNodes/firstProblem.
  const r=auditS037Prepared({maxLegalRoots:150,maxPrepared:1,
    maxNodes:100,maxPairs:24});
  assert.ok(r.continuationsProbed>0);
  assert.ok(r.resourceCapped>0);
  for(const witness of r.examples.filter(e=>e.verdict==='resource-cap')){
    assert.ok(witness.firstProblem,'a resource cap needs a replayable witness');
    assert.match(witness.firstProblem.kind,/cap/);
  }
});
