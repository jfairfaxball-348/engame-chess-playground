import test from 'node:test';
import assert from 'node:assert/strict';
import {makeBoard,newGame,squareAt}
  from '../src/chess.js';
import {kqkSourceChoice} from '../src/kqk-source-policy.js';
import {
  authenticateKQK35LowWall,authenticateKQK35TightKing,
  auditKQK35SourceBridges,auditKQK35AlreadyFarTight,
  auditKRK35PrepTransfer
} from '../scripts/s035-source-bridges.mjs';

test('S035 KQK literal low-wall action: real token, same frame and frozen target',()=>{
  const a=auditKQK35SourceBridges({maxLegalRoots:1200,maxPreparedRoots:32});
  assert.equal(a.preparedRoots,32);
  assert.equal(a.firstWeakReplies,200);
  assert.equal(a.lowWallAuthenticated,140);
  assert.equal(a.backrankAuthenticated,60);
  assert.equal(a.missingFirst,0);
  assert.equal(a.unverifiedFirst,0);
  assert.equal(a.secondWeakReplies,1254);
  assert.equal(a.secondSourceMoves,1254);
  assert.equal(a.missingSecond,0);
  assert.equal(a.genuineSourceTokensOnly,true);
  assert.equal(a.globalMateCertified,false);
});

test('S035 tight-above legal non-token roots authenticate exact frozen king move',()=>{
  const a=auditKQK35AlreadyFarTight();
  assert.equal(a.legalRoots,16);
  assert.equal(a.correctOriginalCase,16);
  assert.equal(a.sourceFirst,16);
  assert.equal(a.missingFirst,0);
  assert.ok(a.tightKingActions>0);
  assert.equal(a.tightKingActions,a.tightKingAuthenticated);
  assert.ok(a.firstWeakReplies>0);
  assert.equal(a.preparatoryTokensFabricated,false);
  assert.equal(a.completeGamesCertified,false);
});

test('S035 exact tight king authentication rejects unrelated source actions',()=>{
  const b=makeBoard();
  b[squareAt(1,1)]='wK';b[squareAt(0,3)]='wQ';b[squareAt(4,2)]='bK';
  const s=newGame(b,'w','kqk',{experimentalKQK:true});
  const choice=kqkSourceChoice(s,'w');
  // Even a legal named alternative is not a licence to call it TightEntry.
  const falseClaim={...choice,sourcePhase:'KQK.TightEntry.tight_king_step.king_approach',
    move:{from:squareAt(1,1),to:squareAt(2,1)}};
  assert.equal(authenticateKQK35TightKing(s,'w',falseClaim).authenticated,false);
  assert.equal(authenticateKQK35LowWall(s,'w',falseClaim,'id').authenticated,false);
});

test('S035 KRK incoming source prep handoff descends on every real next weak reply',()=>{
  const a=auditKRK35PrepTransfer();
  assert.equal(a.roots,24);
  assert.equal(a.firstReplies,168);
  assert.equal(a.secondReplies,980);
  assert.ok(a.actualThirdPrepChoices>0);
  assert.ok(a.prepReplies>0);
  assert.equal(a.strictDescent,a.prepReplies);
  assert.equal(a.invalidRankOrTransfer,0,JSON.stringify(a.failures));
  assert.equal(a.missingNext,0,JSON.stringify(a.failures));
  assert.equal(a.sourceNextChoices,a.prepReplies);
  assert.equal(a.globalPhaseCompositionCertified,false);
});
