import test from 'node:test';
import assert from 'node:assert/strict';
import {positionKey} from '../src/chess.js';
import {auditS038Widened,kqk38WideLegalRoots}
  from '../scripts/s038-orbit-closure.mjs';

test('S038 deterministic coprime root scan covers both colours and orientations',()=>{
  const sample=[...kqk38WideLegalRoots(400)];
  const replay=[...kqk38WideLegalRoots(400)];
  assert.ok(sample.length>20);
  assert.deepEqual(sample.map(x=>positionKey(x.root.board,x.root.turn)),
    replay.map(x=>positionKey(x.root.board,x.root.turn)));
  assert.deepEqual(new Set(sample.map(x=>x.strong)),new Set(['w','b']));
  assert.ok(new Set(sample.map(x=>x.frame)).size>=4);
  assert.ok(new Set(sample.map(x=>x.seed.k[1])).size>=3);
  assert.ok(new Set(sample.map(x=>x.seed.q[1])).size>=3);
});

test('S038 uses actual source-issued tokens and all immediate defender replies',()=>{
  const r=auditS038Widened({maxTuples:750,maxPrepared:3,
    maxNodes:12,maxPairs:8});
  assert.equal(r.genuineTokensOnly,true);
  assert.equal(r.universalMatingCertified,false);
  assert.equal(r.globalPhaseRankCertified,false);
  assert.equal(r.fideHistoryCertified,false);
  assert.ok(r.sourcePrepared>0,'must locate a real preparation source');
  assert.ok(r.firstReplies>0);
  assert.equal(r.roots.length,r.sourcePrepared);
  assert.equal(r.firstReplies,r.roots.reduce((n,x)=>n+x.replies.length,0));
  assert.equal(r.firstReplies,Object.values(r.originalCases)
    .reduce((a,b)=>a+b,0));
  for(const root of r.roots){
    assert.equal(root.token.kind,'far-file');
    assert.equal(root.token.frame,root.originalFrame);
    for(const w of root.replies){
      assert.ok(Number.isInteger(w.queen));
      assert.match(w.weakReply,/^[0-9]+-[0-9]+$/);
      assert.ok(w.budget0);
      assert.ok(w.budget1);
    }
  }
  for(const o of r.outcomes)assert.equal(o.mateClosed+o.unsupported+
    o.capture+o.nonmate+o.repeat+o.resourceCap,r.firstReplies);
  if(r.firstResourceCap)
    assert.ok(r.firstResourceCap.firstProblem);
});

test('S038 validation rejects impossible or unsafe cap parameters',()=>{
  assert.throws(()=>auditS038Widened({maxNodes:0}),RangeError);
  assert.throws(()=>auditS038Widened({maxTuples:73729}),RangeError);
  assert.throws(()=>[...kqk38WideLegalRoots(0)],RangeError);
});
