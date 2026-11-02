import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame} from '../src/chess.js';
import {
  S040_RULES,authenticateS040LaterAction,auditS040Premises
} from '../scripts/s040-source-premises.mjs';

const options={maxTuples:750,maxPrepared:3,maxNodes:24,maxPairs:10,maxKrkRoots:4};

test('S040 replays real roots, nested source tokens and every second defender',()=>{
  const r=auditS040Premises(options);
  assert.ok(r.checkedRoots>0);
  assert.ok(r.secondWeakReplies>0);
  assert.equal(r.thirdMoves,r.independentlyAuthenticated+
    r.failedPremises+r.uncheckedRules);
  assert.equal(r.failedPremises,0,
    'each authentic selected theorem must meet its full hypotheses');
  assert.equal(r.uncheckedRules,0,'four known source families have complete checkers');
  assert.equal(r.independentlyAuthenticated,r.thirdMoves);
  assert.ok(r.firstAuthentication);
  assert.ok(r.firstQueenExample,'check the first actual prepared_queen_step case');
  assert.equal(r.firstQueenExample.moveHistory.length,4);
  assert.equal(r.firstQueenExample.sourceRule,
    'KQK.BandProgress.prepared_queen_step');
  assert.equal(r.globalMateCertified,false);
  assert.equal(r.krkGlobalPhaseCompositionCertified,false);
  assert.equal(r.fideHistoryCertified,false);
  for(const [rule,count] of Object.entries(r.rules)){
    assert.ok(S040_RULES.includes(rule),'only pinned source families');
    assert.equal(count.authenticated,count.total);
    assert.equal(count.failedPremise+count.unchecked,0);
  }
});

test('S040 verifier rejects a forged target and a mismatched source token',()=>{
  const r=auditS040Premises({
    maxTuples:400,maxPrepared:1,maxNodes:12,maxPairs:8,maxKrkRoots:4});
  const ex=r.firstAuthentication;
  assert.ok(ex);
  const [p,t]=ex.state.split(':');
  const board=p.match(/.{2}/g).map(x=>x==='--'?null:x);
  const state={...newGame(board,t,'kqk',{experimentalKQK:true}),
    log:ex.moveHistory.slice()};
  const [from,to]=ex.action.split('-').map(Number);
  const choice={sourcePhase:ex.sourceRule,frame:ex.selectedFrame,
    move:{from,to}};
  assert.equal(authenticateS040LaterAction(state,ex.strong,choice,
    ex.continuationToken).status,'authenticated');
  assert.equal(authenticateS040LaterAction(state,ex.strong,
    {...choice,move:{from,to:to===63?62:to+1}},
    ex.continuationToken).status,'failed-premise');
  assert.equal(authenticateS040LaterAction(state,ex.strong,choice,
    {...ex.continuationToken,frame:'wrong'}).status,'failed-premise');
});

test('S040 distinguishes an unknown theorem from a false hypothesis',()=>{
  assert.equal(authenticateS040LaterAction(null,'w',
    {sourcePhase:'nonexistent'}).status,'not-independently-checked');
});
