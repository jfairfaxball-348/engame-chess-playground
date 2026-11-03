import test from 'node:test';
import assert from 'node:assert/strict';
import {auditS042FreshFamilies,kqk42FreshRoots}
  from '../scripts/s042-fresh-families.mjs';
import {kqk32CaseFromState} from '../scripts/kqk32-far-file-audit.mjs';
import {validateSetup} from '../src/chess.js';

test('S042 original-frame roots are legal, strong-to-move and token-free',()=>{
  const seen=new Set(),cases=new Set();
  for(const {root,strong,frame,originalCase} of kqk42FreshRoots({maxCandidates:24})){
    assert.equal(validateSetup(root.board,'kqk',strong),null);
    assert.equal(root.log.length,0);
    assert.equal(root.turn,strong);
    assert.equal(kqk32CaseFromState(root,strong,frame),originalCase);
    cases.add(originalCase);
    seen.add(originalCase+':'+frame+':'+strong);
  }
  assert.deepEqual([...cases].sort(),['separating-rank','tight-above']);
  assert.ok(seen.size>=4);
});

test('S042 checks every legal defender reply from both fresh case families',()=>{
  const r=auditS042FreshFamilies({
    maxPerFamily:2,maxCandidates:24,maxNodes:12,maxPairs:3,
    maxExamples:4,full:true});
  for(const family of ['separating-rank','tight-above']){
    const f=r.families[family];
    assert.equal(f.roots,2);
    assert.ok(f.firstReplies>0);
    assert.ok(f.firstReplies>=f.missingFollow);
    assert.equal(Object.values(f.trees).reduce((a,b)=>a+b,0),f.roots);
    assert.equal(f.firstFailedPremise,0);
    assert.equal(f.followFailedPremise,0);
    assert.equal(f.thirdFailedPremise,0);
    assert.equal(f.firstAuthenticated+f.firstUnchecked+f.firstFailedPremise,
      f.roots-f.missingFirst);
    assert.ok(f.thirdAuthenticated+f.thirdUnchecked>0,
      'the third source actions must be independently classified');
    if(family==='separating-rank')
      assert.ok(f.firstAuthenticated>0,
        'fresh separating-rank must now check S040 BandProgress premises');
  }
  for(const example of r.examples){
    assert.equal(example.inputToken,null);
    assert.equal(example.originalCase,
      example.originalCase==='tight-above'?'tight-above':'separating-rank');
    assert.ok(example.firstSource);
    for(const reply of example.defenderReplies){
      assert.equal(reply.moveHistory.length,2);
      assert.deepEqual(reply.issuedToken,example.firstToken);
      for(const second of reply.secondReplies??[]){
        assert.equal(second.history.length,4);
        assert.ok(second.premise?.status);
        assert.deepEqual(second.thirdToken,
          second.thirdToken===null?null:second.thirdToken);
      }
    }
  }
  assert.equal(r.preparedTokensInvented,false);
  assert.equal(r.globalKQKMateCertified,false);
  assert.equal(r.krkCrossPhaseCertified,false);
  assert.equal(r.fideHistoryCertified,false);
});

test('S042 input validation fails closed on unsafe audit budgets',()=>{
  assert.throws(()=>auditS042FreshFamilies({maxPerFamily:0}),RangeError);
  assert.throws(()=>auditS042FreshFamilies({maxNodes:-1}),RangeError);
  assert.throws(()=>kqk42FreshRoots({maxCandidates:0}).next(),RangeError);
});
