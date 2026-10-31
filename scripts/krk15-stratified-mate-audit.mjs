/**
 * KRK15: full-game, ALL-defender falsification from a reproducible
 * STRATIFIED SET of the three frozen source entry families.
 *
 * This is a test harness, never a selector. Exactly one source-derived
 * strong move is chosen by krkTaggedStrongChoice at every strong turn.
 * The audit explores all weak replies up to explicit node/ply caps.
 * No single-root or sampled result is a global Lean termination theorem.
 */
import {pathToFileURL} from 'node:url';
import {makeBoard,opposite,positionKey,squareAt} from '../src/chess.js';
import {KRK_FRAMES,krkTransformSquare} from '../src/krk-local-witness.js';
import {krkTaggedStrongChoice} from '../src/krk-tagged-strategy.js';
import {auditKRK14MateTree} from './krk14-mate-tree.mjs';

/** Fixed source geometries; board isomorphisms and colour are varied.
 * These are regression witnesses, NOT hard-coded gameplay decisions.
 */
export const KRK15_SOURCE_FIXTURES=Object.freeze([
  Object.freeze({phase:'prepared-wall',strongKing:[2,1],rook:[0,2],weakKing:[5,3]}),
  Object.freeze({phase:'direct-entry',strongKing:[3,3],rook:[7,7],weakKing:[4,6]}),
  Object.freeze({phase:'two-step-setup',strongKing:[3,1],rook:[5,0],weakKing:[4,5]})
]);

export function krk15StratifiedRoots(){
  const cases=[];
  for(const fixture of KRK15_SOURCE_FIXTURES)
    for(const strong of ['w','b'])
      for(const frame of KRK_FRAMES){
        const board=makeBoard();
        const put=(coords,piece)=>{
          board[krkTransformSquare(squareAt(...coords),frame)]=piece;
        };
        put(fixture.strongKing,strong+'K');
        put(fixture.rook,strong+'R');
        put(fixture.weakKing,opposite(strong)+'K');
        cases.push({
          phase:fixture.phase,strong,frame,
          state:{board,turn:strong,material:'krk',
            halfmove:0,log:[],history:[positionKey(board,strong)]}
        });
      }
  return cases;
}

/** Exhausts each selected root OR returns the first actual counterexample.
 * Every cap is reported as inconclusive; never call it a mate certificate.
 */
export function auditKRK15StratifiedMateTrees({
  maxNodes=200,maxPlies=160,maxExamples=24,memoization='history-counts'
}={}){
  if(!Number.isSafeInteger(maxNodes)||maxNodes<1||
     !Number.isSafeInteger(maxPlies)||maxPlies<1||
     !Number.isSafeInteger(maxExamples)||maxExamples<0)
    throw new RangeError('positive integer node/ply caps and nonnegative example cap required');
  const summary={roots:0,preparedWall:0,directEntry:0,twoStepSetup:0,
    rootPhaseMismatches:0,completedAllDefenderTrees:0,
    resourceCaps:0,genuineFailures:0,
    nodesVisited:0,matingLeavesObserved:0,maximumPliesObserved:0,
    closedSubtrees:0,closedSubtreeReuses:0,
    structuralRevisits:0,distinctHistoryRevisits:0,
    distinctStructuralStates:0,defenderRepliesExamined:0,
    sourceChoicesExamined:0,maximumDefenderBranching:0};
  const reports=[],failures=[];
  for(const {phase,strong,frame,state} of krk15StratifiedRoots()){
    summary.roots++;
    const label={phase,strong,frame};
    const choice=krkTaggedStrongChoice(state);
    if(choice?.kind!=='step'||choice.rootPhase!==phase){
      summary.rootPhaseMismatches++;
      if(failures.length<maxExamples)failures.push({
        ...label,reason:'source root phase mismatch',
        actualPhase:choice?.rootPhase??null,move:choice?.move??null
      });
      reports.push({...label,status:'source-root-mismatch'});
      continue;
    }
    if(phase==='prepared-wall')summary.preparedWall++;
    else if(phase==='direct-entry')summary.directEntry++;
    else summary.twoStepSetup++;

    const result=auditKRK14MateTree(state,{maxNodes,maxPlies,memoization});
    summary.nodesVisited+=result.nodes;
    summary.closedSubtrees+=result.closedSubtrees;
    summary.closedSubtreeReuses+=result.closedSubtreeReuses;
    summary.matingLeavesObserved+=result.terminalMates;
    summary.structuralRevisits+=result.structuralRevisits;
    summary.distinctHistoryRevisits+=result.distinctHistoryRevisits;
    summary.distinctStructuralStates+=result.distinctStructuralStates;
    summary.defenderRepliesExamined+=result.defenderRepliesExamined;
    summary.sourceChoicesExamined+=result.sourceChoicesExamined;
    summary.maximumDefenderBranching=Math.max(summary.maximumDefenderBranching,
      result.maximumDefenderBranching);
    summary.maximumPliesObserved=Math.max(
      summary.maximumPliesObserved,result.maximumPlies);
    const reason=result.firstCounterexample?.reason??null;
    const capped=reason==='node cap'||reason==='ply cap';
    const status=result.ok?'all-defender-tree-closed':capped?'resource-cap':'counterexample';
    if(result.ok)summary.completedAllDefenderTrees++;
    else if(capped)summary.resourceCaps++;
    else summary.genuineFailures++;
    reports.push({...label,status,nodes:result.nodes,
      closedSubtrees:result.closedSubtrees,
      closedSubtreeReuses:result.closedSubtreeReuses,
      terminalMates:result.terminalMates,maximumPlies:result.maximumPlies,
      structuralRevisits:result.structuralRevisits,
      distinctHistoryRevisits:result.distinctHistoryRevisits,
      defenderRepliesExamined:result.defenderRepliesExamined,
      firstReason:reason,firstAtFEN:result.firstCounterexample?.atFEN??null});
    if(!result.ok&&failures.length<maxExamples)
      failures.push({...label,status,...result.firstCounterexample});
  }
  return {scope:'24 deterministic source-family/colour/frame root trees',
    memoization,summary,reports,failures,
    completeGlobalMateProof:false,sourceSelectorFormalised:false,
    fideClockHistoryCertified:false,
    note:'Resource-capped finite samples are falsification only; no global Lean mate or clock/history certificate'};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const option=(prefix,fallback)=>{
    const arg=process.argv.find(v=>v.startsWith(prefix));
    return arg?Number(arg.slice(prefix.length)):fallback;
  };
  const report=auditKRK15StratifiedMateTrees({
    maxNodes:option('--nodes=',200),
    maxPlies:option('--plies=',160),
    maxExamples:option('--examples=',24),
    memoization:process.argv.find(v=>v.startsWith('--memo='))?.slice(7)??'history-counts'
  });
  console.log(JSON.stringify(report,null,2));
  if(process.argv.includes('--strict')&&
      (report.summary.rootPhaseMismatches||report.summary.genuineFailures))
    process.exitCode=1;
}
