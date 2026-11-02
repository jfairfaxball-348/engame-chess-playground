import test from 'node:test';
import assert from 'node:assert/strict';
import {auditS038Widened} from '../scripts/s038-orbit-closure.mjs';

test('S038 independently authenticates switched-frame low-wall theorem',()=>{
  // Genuine Q(a1) preparation and legal Ke6 reply in the widened
  // orbit generate a rotate270 low-wall theorem. The original
  // FarFileEntry frame is reflectY: these must NOT be conflated.
  const r=auditS038Widened({maxTuples:1600,maxPrepared:10,
    maxNodes:10,maxPairs:6});
  const switched=r.roots.flatMap(x=>x.replies.filter(y=>
    y.chosenFrame!==x.originalFrame &&
    y.chosenRule==='KQK.EntryGeometry.clear_low_wall_entry.queen_wall'
  ).map(y=>({root:x,reply:y})));
  assert.ok(switched.length>0,'must exercise a real switched low-wall phase');
  for(const {root,reply} of switched){
    assert.equal(root.token.kind,'far-file');
    assert.equal(reply.selectedTheoremIndependentlyAuthenticated,true);
    assert.match(reply.authenticatedTheorem,/clear_low_wall_entry/);
    assert.equal(reply.originalCase,'horizontal-far-wall');
    assert.notEqual(reply.chosenFrame,root.originalFrame);
  }
  assert.equal(r.unverifiedTheorem,0);
  assert.equal(r.missingSource,0);
  assert.equal(r.firstActualGap,null);
  assert.equal(r.firstUnverifiedTheorem,null);
  assert.equal(r.universalMatingCertified,false);
});
