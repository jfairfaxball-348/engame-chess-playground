import test from 'node:test';
import assert from 'node:assert/strict';
import {
  KRK30_REPLY_POLICIES,traceKRK30Spine,auditKRK30Spines
} from '../scripts/krk30-spine-audit.mjs';
import {krk15StratifiedRoots} from '../scripts/krk15-stratified-mate-audit.mjs';
import {krkTaggedStrongChoice} from '../src/krk-tagged-strategy.js';
import {squareName} from '../src/chess.js';

const uci=m=>squareName(m.from)+squareName(m.to);

test('S030 spines preserve exact source first action for all 24 frames and colours',()=>{
  const roots=krk15StratifiedRoots();
  assert.equal(roots.length,24);
  for(const {state} of roots){
    const first=krkTaggedStrongChoice(state);
    assert.ok(first?.move);
    for(const replyPolicy of KRK30_REPLY_POLICIES){
      const r=traceKRK30Spine(state,{replyPolicy,maxPairs:2});
      assert.ok(r.trace.length>=1);
      assert.equal(r.trace[0].sourceMove,uci(first.move));
      assert.equal(r.trace[0].rule,first.rule);
      assert.equal(r.completeGlobalMateProof,false);
      assert.equal(r.fideClockHistoryCertified,false);
      assert.ok(r.sourceTurns<=2);
      if(r.repeat){
        assert.equal(r.repeat.identicalHistory,false,
          'same board/controller reached later is NOT an identical FIDE history');
        assert.ok(r.repeat.previousSourceTurn<r.repeat.currentSourceTurn);
      }
    }
  }
});

test('S030 does not mislabel shallow paths as all-defender mate proofs',()=>{
  const result=auditKRK30Spines({maxPairs:1});
  assert.equal(result.paths,24*KRK30_REPLY_POLICIES.length);
  assert.equal(Object.values(result.tally).reduce((a,b)=>a+b,0),result.paths);
  assert.equal(result.completeGlobalMateProof,false);
  assert.equal(result.allDefenderCertified,false);
  assert.equal(result.fideClockHistoryCertified,false);
  assert.ok(result.reports.every(x=>x.sourceTurns<=1));
});

test('S030 refuses invalid policy and pair cap rather than guessing a reply',()=>{
  const root=krk15StratifiedRoots()[0].state;
  assert.throws(()=>traceKRK30Spine(root,{replyPolicy:'engine'}),RangeError);
  assert.throws(()=>traceKRK30Spine(root,{maxPairs:0}),RangeError);
  assert.throws(()=>auditKRK30Spines({maxPairs:0}),RangeError);
  assert.equal(traceKRK30Spine({...root,material:'kqk'}).status,'invalid-root');
});
