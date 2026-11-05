import test from 'node:test';
import assert from 'node:assert/strict';
import {reportS048FiniteGates}
  from '../scripts/s048-census-gate-report.mjs';

const SHA='c72365a8ba46f59114a2a77d9d38993f6a52df80';
const groups=['w-strong,w-turn','w-strong,b-turn',
  'b-strong,b-turn','b-strong,w-turn'];
const emptyPremises=()=>({authenticated:0,unchecked:0,
  'failed-premise':0,missing:0});
function fixture(){
  const reports={};
  for(const name of groups){
    const strongTurn=name.split(',')[0][0]===name.split(',')[1][0];
    reports[name]={candidateAssignments:262144,legalRoots:1,
      sumPerShardD4OrbitCounts:1,ongoing:1,
      terminal:{mate:0,stalemate:0,other:0},
      sourceSelected:strongTurn?1:0,missingFirstSource:0,
      illegalSourceMove:0,localPremises:{...emptyPremises(),
        authenticated:strongTurn?1:0},
      selectedRules:strongTurn?{'KQK.Fixture.source':1}:{},
      selectedFrames:strongTurn?{id:1}:{},
      farFileOriginalFrameCases:{},
      directWeakQueenCaptures:strongTurn?0:1,
      weakReplies:strongTurn?0:1,weakNonCaptureReplies:0,
      followingSourceSelected:0,followingSourceMissing:0,
      followingIllegalSourceMove:0,
      followingPremises:emptyPremises(),
      afterFirstStrongWeakReplies:0,afterFirstStrongCaptures:0,
      afterFirstStrongSourceSelected:0,afterFirstStrongSourceMissing:0,
      terminalAfterStrong:{mate:0,stalemate:0,other:0},
      terminalAfterReply:{mate:0,stalemate:0,other:0}};
  }
  return {sourceSha:SHA,scope:{full:true,shardsMerged:16,
    inspectReplies:true,allFourColourTurnGroups:true,
    squareAssignmentsPerMaterialSide:262144},
    groups:reports,perShard:Array.from({length:16},(_,i)=>({index:i})),
    firstIssues:{'legal-weak-root-queen-capture':{shardIndex:1}},
    allRootBoardsEnumerated:true,allImmediateWeakRepliesEnumerated:true,
    sourceIssuedTokensOnly:true,allDefenderTerminationCertified:false,
    universalKQKMatingCertified:false,fideHistoryCertified:false};
}
test('S048 reports only finite roots and immediate choices, never universal mate',()=>{
  const r=reportS048FiniteGates(fixture());
  assert.equal(r.totals.candidateAssignments,1048576);
  assert.equal(r.totals.legalRoots,4);
  assert.equal(r.totals.firstSourceSelected,2);
  assert.equal(r.totals.immediateLegalWeakReplies,2);
  assert.equal(r.totals.directWeakQueenCaptureMoves,2);
  assert.equal(r.obligations.firstUncheckedPremises,0);
  assert.equal(r.certification.finiteRootCensus,true);
  assert.equal(r.certification.globalMateTermination,false);
  assert.equal(r.certification.verifiedWorkerDeployment,false);
  assert.equal(r.groups['w-strong,b-turn'].selectedSourceRules['KQK.Fixture.source'],undefined);
});
test('S048 refuses partial/sham exhaustive input or inflated proof claims',()=>{
  for(const edit of [
    x=>x.scope.shardsMerged=15,
    x=>x.allImmediateWeakRepliesEnumerated=false,
    x=>x.universalKQKMatingCertified=true,
    x=>x.perShard.pop(),
    x=>x.groups['w-strong,w-turn'].candidateAssignments--,
    x=>x.groups['w-strong,w-turn'].selectedRules={},
    x=>x.groups['w-strong,b-turn'].weakNonCaptureReplies=1,
    x=>x.groups['w-strong,w-turn'].localPremises.unchecked=2,
  ]){
    const x=fixture();edit(x);
    assert.throws(()=>reportS048FiniteGates(x),/S048 audit refused/);
  }
});
test('S048 keeps failed/unchecked diagnostics without silently granting a certificate',()=>{
  const x=fixture();
  x.groups['w-strong,w-turn'].localPremises.authenticated=0;
  x.groups['w-strong,w-turn'].localPremises['failed-premise']=1;
  x.groups['b-strong,b-turn'].localPremises.authenticated=0;
  x.groups['b-strong,b-turn'].localPremises.unchecked=1;
  const r=reportS048FiniteGates(x);
  assert.equal(r.gaps.failedFirstPremises,1);
  assert.equal(r.obligations.firstUncheckedPremises,1);
  assert.equal(r.certification.fullSourceDerivedWinningController,false);
});
