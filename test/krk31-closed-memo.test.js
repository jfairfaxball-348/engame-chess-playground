import test from 'node:test';
import assert from 'node:assert/strict';
import {
  auditKRK14MateTree,krk31ClosedSubtreeKey
} from '../scripts/krk14-mate-tree.mjs';
import {krk15StratifiedRoots} from '../scripts/krk15-stratified-mate-audit.mjs';
import {positionKey} from '../src/chess.js';

test('S031 memo merges only same complete repetition multiset and source context',()=>{
  const root=krk15StratifiedRoots()[0].state;
  const k=positionKey(root.board,root.turn);
  const make=(history,halfmove=14,token={mode:'prepared',inner:{stage:'wall',rankBefore:5}})=>
    krk31ClosedSubtreeKey({...root,history,halfmove,log:Array(history.length-1).fill('move')},token);
  // These histories have the SAME FIDE repetition counts but a different
  // chronology. They also share first/penultimate/last positions.
  const a=[k,'a','b','a','last',k];
  const b=[k,'b','a','a','last',k];
  assert.equal(make(a),make(b));
  // By contrast, none of these can safely share a successful subtree.
  assert.notEqual(make(a),make([k,'a','b','b','last',k]));
  assert.notEqual(make(a),make(a,15));
  assert.notEqual(make(a),make(a,14,{mode:'prepared',inner:{stage:'wall',rankBefore:4}}));
  assert.notEqual(make(a),make(['changed','a','b','a','last',k]));
  assert.notEqual(make(a),make([k,'a','b','a','other',k]));
  assert.notEqual(make(a),krk31ClosedSubtreeKey({
    ...root,history:a,halfmove:14,log:[]
  },{mode:'prepared',inner:{stage:'wall',rankBefore:5}}));
});

test('S031 closed-only audit never promotes bounded checks into universal certificates',()=>{
  for(const {state} of krk15StratifiedRoots().slice(0,3)){
    const baseline=auditKRK14MateTree(state,{
      maxNodes:120,maxPlies:160,memoization:'off'
    });
    const memo=auditKRK14MateTree(state,{
      maxNodes:120,maxPlies:160,memoization:'history-counts'
    });
    assert.ok(memo.nodes<=baseline.nodes);
    assert.ok(memo.closedSubtrees>=0);
    assert.ok(memo.closedSubtreeReuses>=0);
    assert.equal(baseline.completeGlobalMateProof,false);
    assert.equal(memo.completeGlobalMateProof,false);
    assert.equal(memo.fideClockHistoryCertified,false);
    assert.ok(['node cap','ply cap',null].includes(
      memo.firstCounterexample?.reason??null),
      JSON.stringify(memo.firstCounterexample));
    // A previously completed finite tree must remain completed with an
    // equivalent closed-only memo at the identical node and ply budgets.
    if(baseline.ok)assert.equal(memo.ok,true);
  }
  assert.throws(()=>auditKRK14MateTree(
    krk15StratifiedRoots()[0].state,{memoization:'board-only'}),RangeError);
});
