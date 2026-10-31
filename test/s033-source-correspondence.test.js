import test from 'node:test';
import assert from 'node:assert/strict';
import {legalMoves,opposite} from '../src/chess.js';
import {kqkSourceChoice} from '../src/kqk-source-policy.js';
import {mathsPlayMove} from '../src/maths-play-policy.js';
import {kqk32FixtureRoots} from '../scripts/kqk32-far-file-audit.mjs';
import {authenticateKQK33Backrank,auditKQK33SourceCorrespondence,
  auditKQK33AlreadyFarCases} from '../scripts/kqk33-source-correspondence.mjs';
import {auditKRK33SecondPhaseEdges} from '../scripts/krk33-second-phase-edges.mjs';

test('S033 original-frame actual FarFilePreparation tokens authenticate independent backrank actions',()=>{
  const report=auditKQK33SourceCorrespondence();
  assert.equal(report.sourceRoots,4);
  assert.equal(report.replies,24);
  assert.equal(report.missing,0);
  assert.equal(report.crossFrame,24);
  assert.equal(report.independentAuthenticated,report.crossFrame);
  assert.equal(report.independentUnverified,0);
  assert.deepEqual(report.cases,{'horizontal-far-wall':24});
  assert.equal(report.universalStrategyCertified,false);
  assert.equal(report.fourCasesReachedByGenuinePreparation,false);
});

test('S033 backrank theorem rejects falsely attributed source action and tampered frame',()=>{
  const {root,strong}=kqk32FixtureRoots().find(({root,strong})=>
    kqkSourceChoice(root,strong)?.continuationPhase?.kind==='far-file');
  const first=kqkSourceChoice(root,strong);
  const after=mathsPlayMove(root,first.move);
  const reply=legalMoves(after.board,opposite(strong))[0];
  const state=mathsPlayMove(after,reply);
  const choice=kqkSourceChoice(state,strong,first.continuationPhase);
  assert.ok(authenticateKQK33Backrank(state,strong,choice).authenticated);
  assert.equal(authenticateKQK33Backrank(state,strong,{
    ...choice,sourcePhase:'KQK.WrongTheorem'
  }).authenticated,false);
  assert.equal(authenticateKQK33Backrank(state,strong,{
    ...choice,frame:'not-a-Lean-symmetry'
  }).authenticated,false);
  assert.equal(authenticateKQK33Backrank(state,strong,{
    ...choice,move:{...choice.move,to:choice.move.from}
  }).authenticated,false);
});

test('S033 all four already-far-file original-frame theorem fixtures remain static, not minted source tokens',()=>{
  const report=auditKQK33AlreadyFarCases();
  assert.equal(report.authenticPreparatoryTokens,false);
  assert.equal(report.allDefenderClosure,false);
  assert.deepEqual(Object.keys(report.cases).sort(),
    ['separating-rank','direct-small-file','horizontal-far-wall','tight-above'].sort());
  for(const section of Object.values(report.cases)){
    assert.equal(section.legal,16);
    assert.equal(section.sourceMoves+section.missing,section.legal);
  }
});

test('S033 KRK two-layer source-phase audit is honest about non-termination certificate and replayable missing branches',()=>{
  const report=auditKRK33SecondPhaseEdges();
  assert.equal(report.roots,24);
  assert.equal(report.firstReplies,168);
  assert.equal(report.sourceGlobalDescendingRank,false);
  assert.equal(report.allDefenderTerminationCertified,false);
  assert.equal(report.missingWitnesses.length,Math.min(report.missing,12));
  assert.ok(report.secondReplies>0);
  assert.ok(report.thirdSourceMoves<=report.secondReplies);
  assert.ok(report.exactRemainingSourceObligation.includes('Classical.choose'));
});
