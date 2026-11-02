/**
 * S041: exact-root 1x/2x/4x all-defender resource-cap escalation.
 *
 * S039 supplies frozen-source chosen moves, genuine nested continuation
 * tokens and the same legal first defender replies at 1x and 2x.
 * 4x replays THOSE states instead of reseeding or fabricating history.
 * This is finite diagnostic evidence, not global mating certification.
 */
import {pathToFileURL} from 'node:url';
import {legalMoves,newGame,positionKey} from '../src/chess.js';
import {mathsPlayMove} from '../src/maths-play-policy.js';
import {kqkSourceChoice} from '../src/kqk-source-policy.js';
import {auditS039SourcePairs} from './s039-source-phase-pairs.mjs';
import {probeS036Tree} from './s036-cross-phase-audit.mjs';

const cap=(value,name,max=100000)=>{
  if(!Number.isSafeInteger(value)||value<1||value>max)
    throw RangeError(name+' must be an integer from 1 to '+max);
};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const emptyCounts=()=>({'mate-closed':0,'resource-cap':0,
  'potential-cycle':0,counterexample:0});
const recordCount=(counts,verdict)=>{
  if(!Object.hasOwn(counts,verdict))
    throw Error('S041 unknown source-tree verdict: '+verdict);
  counts[verdict]++;
};
const moveId=move=>move?.from+'-'+move?.to;
function parseRoot(key){
  const [encoded,turn]=key.split(':');
  if(encoded?.length!==128||!['w','b'].includes(turn))
    throw Error('S041 invalid S039 original board identity');
  const board=encoded.match(/.{2}/g).map(x=>x==='--'?null:x);
  return newGame(board,turn,'kqk',{experimentalKQK:true});
}
function legalSourceReplay(state,id){
  const [from,to]=id.split('-').map(Number);
  const move=legalMoves(state.board,state.turn).find(
    x=>x.from===from&&x.to===to);
  if(!move)throw Error('S041 replay found nonlegal source/reply '+id);
  return mathsPlayMove(state,move);
}
function classify(tree){
  if(tree.closedAllReplies)return 'mate-closed';
  if(tree.unsupported||tree.captured||tree.nonmateTerminal)
    return 'counterexample';
  if(tree.structuralRepeats)return 'potential-cycle';
  if(tree.cappedNodes||tree.cappedPairs)return 'resource-cap';
  throw Error('S041 source tree has unaccounted non-closure');
}

/**
 * Does not choose any attacker move or change runtime Maths behaviour.
 * A mate-closed small-cap tree must stay closed under larger caps;
 * closed trees are never counted from partial or memoized subtrees.
 */
export function auditS041CapSweep({
  maxTuples=1600,maxPrepared=10,baseNodes=160,basePairs=28,
  maxKrkRoots=4,maxExamples=6,full=false
}={}){
  for(const [key,val] of Object.entries({maxTuples,maxPrepared,
    baseNodes,basePairs,maxKrkRoots,maxExamples}))
    cap(val,key,key==='maxTuples'?73728:100000);
  if(baseNodes*4>100000||basePairs*4>100000)
    throw RangeError('S041 4x budget exceeds the source-tree safety cap');
  const prior=auditS039SourcePairs({maxTuples,maxPrepared,
    maxNodes:2*baseNodes,maxPairs:2*basePairs,maxKrkRoots});
  const budgets=[1,2,4].map(factor=>({factor,
    nodes:baseNodes*factor,pairs:basePairs*factor}));
  const r={sourceSha:prior.sourceSha,
    scope:{maxTuples,maxPrepared,maxKrkRoots,budgets},
    preparedRoots:prior.genuinePreparedRoots,
    legalFirstReplies:prior.firstWeakReplies,
    legalSecondReplies:prior.secondWeakReplies,
    thirdSourceFamilies:prior.thirdRules,
    s039FirstSourceAuthenticated:prior.firstSourceAuthenticated,
    s039FirstSourceFailedPremise:prior.firstSourceFailedPremise,
    counts:budgets.map(b=>({...b,...emptyCounts()})),
    escalations:{capToClosedAt2x:0,capToClosedAt4x:0,
      stillCappedAt4x:0,newCounterexamplesAt4x:0,
      newPotentialCyclesAt4x:0},
    exactHistoryAndTokenReplay:true,monotoneClosedTrees:true,
    firstActualGap:prior.firstActualGap,
    firstFalsifiedPremise:prior.firstUnverifiedTheorem,
    firstUncheckedLaterTheorem:prior.firstUncheckedLaterTheorem,
    firstPotentialCycle:prior.firstPotentialCycle,
    firstResourceCap:prior.firstResourceCap,
    first4xCounterexample:null,first4xPotentialCycle:null,
    first4xResourceCap:null,firstEscalatedClosure:null,
    firstKRKCrossPhase:prior.firstKRKCrossPhase,
    firstKRKRestoration:prior.firstKRKRestoration,
    krkGlobalRankObligation:'Frozen global strict-decrease theorem over the complete board PLUS nested continuation token, for every legal weak reply across PREP, central and restoration edges, or an equivalent source-backed well-founded termination argument.',
    globalKQKMateCertified:false,
    krkGlobalPhaseCompositionCertified:false,
    fideHistoryCertified:false,examples:[]};
  for(const entry of prior.roots){
    const root=parseRoot(entry.root);
    const original=kqkSourceChoice(root,entry.strong);
    if(!original?.move||moveId(original.move)!==entry.firstAction||
       !same(original.continuationPhase,entry.token))
      throw Error('S041 authentic preparation action/token drift');
    const afterPrep=legalSourceReplay(root,entry.firstAction);
    for(const first of entry.firstReplies){
      const state=legalSourceReplay(afterPrep,first.weakReply);
      if(positionKey(state.board,state.turn)!==first.state||
         !same(state.log,first.moveHistory))
        throw Error('S041 exact board/two-ply legal history drift');
      const selected=kqkSourceChoice(state,entry.strong,entry.token);
      if(moveId(selected?.move)!==first.selectedAction||
         selected?.sourcePhase!==first.selectedRule||
         selected?.frame!==first.selectedFrame)
        throw Error('S041 source-selected first continuation drift');
      const saved=first.budgets;
      if(saved.length!==2||saved[0].budget.nodes!==budgets[0].nodes||
         saved[1].budget.nodes!==budgets[1].nodes||
         saved[0].budget.pairs!==budgets[0].pairs||
         saved[1].budget.pairs!==budgets[1].pairs)
        throw Error('S041 paired S039 root-budget identity drift');
      const large=probeS036Tree('kqk',state,entry.strong,entry.token,{
        maxNodes:budgets[2].nodes,maxPairs:budgets[2].pairs});
      const kinds=[saved[0].verdict,saved[1].verdict,classify(large)];
      for(let i=0;i<3;i++)recordCount(r.counts[i],kinds[i]);
      if((kinds[0]==='mate-closed'&&kinds[1]!=='mate-closed')||
         (kinds[1]==='mate-closed'&&kinds[2]!=='mate-closed'))
        throw Error('S041 previously all-reply closed tree lost closure at larger budget');
      const witness={root:entry.root,strong:entry.strong,
        seed:entry.seed,originalFrame:entry.frame,
        token:entry.token,firstAction:entry.firstAction,
        firstWeakReply:first.weakReply,state:first.state,
        moveHistory:state.log,sourceRule:first.selectedRule,
        selectedFrame:first.selectedFrame,
        selectedMove:first.selectedAction,
        verdicts:kinds,large:{
          nodes:large.nodes,defenderReplies:large.defenderReplies,
          sourceMoves:large.sourceMoves,mates:large.mates,
          cappedNodes:large.cappedNodes,cappedPairs:large.cappedPairs,
          unsupported:large.unsupported,captured:large.captured,
          nonmateTerminal:large.nonmateTerminal,
          structuralRepeats:large.structuralRepeats,
          firstProblem:large.firstProblem,firstIssues:large.firstIssues}};
      if(kinds[0]==='resource-cap'&&kinds[1]==='mate-closed')
        r.escalations.capToClosedAt2x++;
      if(kinds[1]==='resource-cap'&&kinds[2]==='mate-closed'){
        r.escalations.capToClosedAt4x++;
        if(!r.firstEscalatedClosure)r.firstEscalatedClosure=witness;
      }
      if(kinds[2]==='resource-cap'){
        r.escalations.stillCappedAt4x++;
        if(!r.first4xResourceCap)r.first4xResourceCap=witness;
      }
      if(kinds[2]==='counterexample'){
        if(kinds[1]!=='counterexample')
          r.escalations.newCounterexamplesAt4x++;
        if(!r.first4xCounterexample)r.first4xCounterexample=witness;
      }
      if(kinds[2]==='potential-cycle'){
        if(kinds[1]!=='potential-cycle')
          r.escalations.newPotentialCyclesAt4x++;
        if(!r.first4xPotentialCycle)r.first4xPotentialCycle=witness;
      }
      if(full||r.examples.length<maxExamples)r.examples.push(witness);
    }
  }
  for(const counts of r.counts)
    if(Object.entries(emptyCounts()).reduce((n,[key])=>n+counts[key],0)!==
       r.legalFirstReplies)
      throw Error('S041 budget classified an incomplete legal-defender set');
  return r;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const option=(key,fallback)=>{
    const arg=process.argv.find(a=>a.startsWith('--'+key+'='));
    return arg?Number(arg.slice(key.length+3)):fallback;
  };
  const r=auditS041CapSweep({
    maxTuples:option('tuples',1600),maxPrepared:option('prepared',10),
    baseNodes:option('nodes',160),basePairs:option('pairs',28),
    maxKrkRoots:option('krk-roots',4),
    maxExamples:option('examples',6),full:process.argv.includes('--full')});
  console.log(JSON.stringify(r,null,2));
  if(process.argv.includes('--strict')&&
     (!r.preparedRoots||!r.legalFirstReplies||
      r.s039FirstSourceFailedPremise||!r.firstKRKCrossPhase))
    process.exitCode=1;
}
