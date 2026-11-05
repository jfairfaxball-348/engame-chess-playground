/**
 * S048: read the validated S047 full-root merge artifact and report the
 * exact finite evidence / outstanding theorem boundary. Diagnostic ONLY.
 * Does not select a chess move, complete an all-reply game tree, or certify
 * an upstream Lean theorem; no network/engine/tablebase access.
 */
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';

const SOURCE_SHA='c72365a8ba46f59114a2a77d9d38993f6a52df80';
const ROOTS_PER_GROUP=64**3;
const GROUPS=['w-strong,w-turn','w-strong,b-turn',
  'b-strong,b-turn','b-strong,w-turn'];
function demand(test,message){if(!test)throw Error('S048 audit refused: '+message);}
function natural(n){return Number.isSafeInteger(n)&&n>=0;}
function countTree(node,path){
  demand(node!==null&&typeof node==='object'&&!Array.isArray(node),path+' object');
  for(const [key,value] of Object.entries(node)){
    if(typeof value==='number')demand(natural(value),path+'.'+key);
    else countTree(value,path+'.'+key);
  }
}
function sumCount(target,addition){
  for(const [key,value] of Object.entries(addition))target[key]=(target[key]??0)+value;
}
const emptyPremises=()=>({authenticated:0,unchecked:0,'failed-premise':0,missing:0});
/**
 * Accepts the result of mergeS047RootShards (NOT arbitrary individual shards).
 * Never upgrades immediate checks into global termination or rule/clock parity.
 */
export function reportS048FiniteGates(merged){
  demand(merged?.sourceSha===SOURCE_SHA,'wrong frozen source SHA');
  demand(merged.allRootBoardsEnumerated===true&&
    merged.allImmediateWeakRepliesEnumerated===true&&
    merged.scope?.full===true&&merged.scope.shardsMerged===16&&
    merged.scope.inspectReplies===true&&
    merged.scope.allFourColourTurnGroups===true&&
    merged.scope.squareAssignmentsPerMaterialSide===ROOTS_PER_GROUP,
  'complete 16-shard root + immediate-reply artifact required');
  for(const flag of ['allDefenderTerminationCertified',
    'universalKQKMatingCertified','fideHistoryCertified'])
    demand(merged[flag]===false,'unexpected certificate '+flag);
  demand(merged.sourceIssuedTokensOnly===true,'untrusted non-source token');
  demand(merged.groups&&Object.keys(merged.groups).length===4&&
    GROUPS.every(key=>Object.hasOwn(merged.groups,key)),
    'missing or extra colour/turn stratum');
  demand(Array.isArray(merged.perShard)&&merged.perShard.length===16&&
    merged.perShard.every((s,i)=>s.index===i),
    'merger lacks 16 ordered shard fingerprints');
  const totals={candidateAssignments:0,legalRoots:0,ongoing:0,
    terminal:{mate:0,stalemate:0,other:0},
    firstSourceSelected:0,missingFirstSource:0,illegalSourceMove:0,
    firstPremises:emptyPremises(),
    directWeakQueenCaptureMoves:0,postStrongQueenCaptureMoves:0,
    immediateLegalWeakReplies:0,continuationSourceSelected:0,
    missingContinuationSource:0,illegalContinuationSource:0,
    continuationPremises:emptyPremises()};
  const groups={};
  for(const name of GROUPS){
    const g=merged.groups[name],strongTurn=name.split(',')[0][0]===
      name.split(',')[1][0];
    demand(g&&g.candidateAssignments===ROOTS_PER_GROUP,
      name+' missing square assignments');
    countTree(g,name);
    demand(g.terminal.mate+g.terminal.stalemate+g.terminal.other+
      g.ongoing===g.legalRoots&&g.legalRoots<=ROOTS_PER_GROUP,
      name+' bad legal/terminal partition');
    demand(g.sourceSelected+g.missingFirstSource+g.illegalSourceMove===
      (strongTurn?g.ongoing:0),name+' incorrect first-source partition');
    demand(g.sourceSelected===Object.values(g.selectedRules).reduce((s,v)=>s+v,0)&&
      g.sourceSelected===Object.values(g.selectedFrames).reduce((s,v)=>s+v,0),
      name+' missing selected source rule/frame');
    demand(g.sourceSelected===Object.values(g.localPremises).reduce((s,v)=>s+v,0),
      name+' first-premise accounting');
    demand(g.weakReplies===g.weakNonCaptureReplies+
      g.directWeakQueenCaptures,name+' first weak-reply partition');
    demand(g.directWeakQueenCaptures<=g.weakReplies&&
      g.afterFirstStrongCaptures<=g.afterFirstStrongWeakReplies,
      name+' impossible capture count');
    const selected=g.followingSourceSelected+g.afterFirstStrongSourceSelected;
    const missing=g.followingSourceMissing+g.afterFirstStrongSourceMissing;
    const illegal=g.followingIllegalSourceMove;
    demand(selected===Object.values(g.followingPremises).reduce((s,v)=>s+v,0),
      name+' continuation premise partition');
    const immediateReplies=g.weakReplies+g.afterFirstStrongWeakReplies;
    groups[name]={rawAssignments:g.candidateAssignments,
      legalRoots:g.legalRoots,ongoing:g.ongoing,
      terminal:{...g.terminal},firstSourceSelected:g.sourceSelected,
      missingFirstSource:g.missingFirstSource,
      firstPremises:{...g.localPremises},
      selectedSourceRules:{...g.selectedRules},
      selectedSourceFrames:{...g.selectedFrames},
      immediateLegalWeakReplies:immediateReplies,
      directWeakQueenCaptureMoves:g.directWeakQueenCaptures,
      postStrongQueenCaptureMoves:g.afterFirstStrongCaptures,
      continuationSourceSelected:selected,missingContinuationSource:missing,
      continuationPremises:{...g.followingPremises}};
    totals.candidateAssignments+=g.candidateAssignments;
    totals.legalRoots+=g.legalRoots;
    totals.ongoing+=g.ongoing;
    sumCount(totals.terminal,g.terminal);
    totals.firstSourceSelected+=g.sourceSelected;
    totals.missingFirstSource+=g.missingFirstSource;
    totals.illegalSourceMove+=g.illegalSourceMove;
    sumCount(totals.firstPremises,g.localPremises);
    totals.directWeakQueenCaptureMoves+=g.directWeakQueenCaptures;
    totals.postStrongQueenCaptureMoves+=g.afterFirstStrongCaptures;
    totals.immediateLegalWeakReplies+=immediateReplies;
    totals.continuationSourceSelected+=selected;
    totals.missingContinuationSource+=missing;
    totals.illegalContinuationSource+=illegal;
    sumCount(totals.continuationPremises,g.followingPremises);
  }
  demand(totals.candidateAssignments===4*ROOTS_PER_GROUP,
    'global finite square universe incomplete');
  const gaps={missingFirstSource:totals.missingFirstSource,
    illegalFirstSource:totals.illegalSourceMove,
    missingImmediateContinuation:totals.missingContinuationSource,
    illegalImmediateContinuation:totals.illegalContinuationSource,
    failedFirstPremises:totals.firstPremises['failed-premise'],
    failedContinuationPremises:totals.continuationPremises['failed-premise']};
  return {sourceSha:SOURCE_SHA,scope:{shards:16,fullFiniteRoots:true,
    allImmediateLegalWeakReplies:true,allDepthGameTrees:false,
    workerProductionVerified:false},totals,groups,gaps,
    firstIssues:merged.firstIssues??{},
    obligations:{firstUncheckedPremises:totals.firstPremises.unchecked,
      continuationUncheckedPremises:totals.continuationPremises.unchecked,
      allDepthPolicyProof:'OPEN: exact board + turn + full source continuation token, all weak replies',
      krkCrossPhaseRank:'OPEN: PREP -> central -> restoration -> re-entry with nested token',
      fideClockAndHistory:'DEFERRED; not certified',
      runtimeKQKRelease:'EXPERIMENTAL',runtimeKRKRelease:'EXPERIMENTAL'},
    certification:{finiteRootCensus:true,immediateReplyCensus:true,
      fullSourceDerivedWinningController:false,
      globalMateTermination:false,fideRuleClockParity:false,
      verifiedWorkerDeployment:false}};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  demand(process.argv.length===3,'usage: node scripts/s048-census-gate-report.mjs <S047-merged-artifact.json>');
  console.log(JSON.stringify(reportS048FiniteGates(
    JSON.parse(readFileSync(process.argv[2],'utf8'))),null,2));
}
