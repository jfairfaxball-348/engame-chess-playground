/**
 * S037: source-gap triage using real KQK preparation tokens and KRK phase
 * transitions. Audit-only; NEVER used to select a Maths move.
 *
 * Unlike a "first legal move" rescue, an unauthenticated theorem action or
 * an unsupported continuation remains a visible obligation. Each defender
 * move is legal and each attacking action comes from the tagged JS policy.
 */
import {execFileSync} from 'node:child_process';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {legalMoves,opposite,positionKey} from '../src/chess.js';
import {kqkSourceChoice,KQK_PROOF_SOURCE_SHA}
  from '../src/kqk-source-policy.js';
import {mathsPlayMove} from '../src/maths-play-policy.js';
import {kqk32CaseFromState,kqk32FixtureRoots}
  from './kqk32-far-file-audit.mjs';
import {kqk34CandidateRoots} from './kqk34-reachability.mjs';
import {authenticateKQK35LowWall}
  from './s035-source-bridges.mjs';
import {authenticateKQK33Backrank}
  from './kqk33-source-correspondence.mjs';
import {auditS036KRK,probeS036Tree}
  from './s036-cross-phase-audit.mjs';

const positive=(n,label,max=100000)=>{
  if(!Number.isSafeInteger(n)||n<1||n>max)
    throw new RangeError(label+' must be an integer 1..'+max);
};
const uci=m=>m.from+'-'+m.to;
const pieces=(state,strong)=>({
  strongKing:state.board.indexOf(strong+'K'),
  strongQueen:state.board.indexOf(strong+'Q'),
  weakKing:state.board.indexOf(opposite(strong)+'K')
});
const genuineSources=function*(legalRoots){
  yield* kqk32FixtureRoots();
  yield* kqk34CandidateRoots(legalRoots);
};
const problemKind=r=>r.unsupported?'unsupported':
  r.captured?'capture':r.nonmateTerminal?'nonmate-terminal':
  r.structuralRepeats?'structural-repeat':null;

/** Prepare genuine source-issued far-file tokens, then test ALL the
 * immediate weak replies and a capped all-reply continuation tree.
 * Preserve original-frame and selected-frame theorem distinctions.
 */
export function auditS037Prepared({
  maxLegalRoots=1500,maxPrepared=8,maxNodes=200,maxPairs=36,
  maxExamples=8
}={}){
  for(const [k,n] of Object.entries({maxLegalRoots,maxPrepared,
    maxNodes,maxPairs,maxExamples}))positive(n,k);
  const r={sourceSha:KQK_PROOF_SOURCE_SHA,legalRootsExamined:0,
    preparedRoots:0,legalDefenderReplies:0,continuationsProbed:0,
    originalCases:{},selectedTheorems:{},
    originalFrameAuthenticated:0,switchedFrameAuthenticated:0,
    missingSource:0,unverifiedSource:0,
    sourceUnsupported:0,sourceCaptured:0,sourceNonmate:0,
    sourceRepeats:0,resourceCapped:0,mateClosedRoots:0,
    firstActualGap:null,firstUnverifiedTheorem:null,
    firstResourceCap:null,examples:[],
    genuineTokensOnly:true,universalMatingCertified:false,
    originalFrameGlobalProofCertified:false,fideHistoryCertified:false};
  const seenRoots=new Set(),seenChildren=new Set();
  for(const {root,strong,frame} of genuineSources(maxLegalRoots)){
    if(r.preparedRoots>=maxPrepared)break;
    const rootKey=positionKey(root.board,root.turn);
    if(seenRoots.has(rootKey))continue;
    seenRoots.add(rootKey);r.legalRootsExamined++;
    const prep=kqkSourceChoice(root,strong);
    if(prep?.continuationPhase?.kind!=='far-file'||
       !prep.sourcePhase?.includes('FarFilePreparation.far_file_preparation'))
      continue;
    r.preparedRoots++;
    const originalToken=prep.continuationPhase;
    const after=mathsPlayMove(root,prep.move);
    for(const reply of legalMoves(after.board,opposite(strong))){
      r.legalDefenderReplies++;
      const state=mathsPlayMove(after,reply);
      const source=kqkSourceChoice(state,strong,originalToken);
      const originalCase=kqk32CaseFromState(state,strong,originalToken.frame);
      r.originalCases[String(originalCase)]=(r.originalCases[String(originalCase)]??0)+1;
      const witness={
        strong,fixtureFrame:frame??'canonical',originalFrame:originalToken.frame,
        originalCase,root:rootKey,at:positionKey(state.board,state.turn),
        pieces:pieces(state,strong),preparationMove:uci(prep.move),
        weakReply:uci(reply),sourceRule:source?.sourcePhase??null,
        selectedFrame:source?.frame??null,sourceMove:source?.move?uci(source.move):null,
        token:originalToken
      };
      if(!source?.move){
        r.missingSource++;
        if(!r.firstActualGap)r.firstActualGap={reason:'missing source at real prepared reply',...witness};
        if(r.examples.length<maxExamples)r.examples.push({kind:'missing',...witness});
        continue;
      }
      r.selectedTheorems[source.sourcePhase??'unnamed']=
        (r.selectedTheorems[source.sourcePhase??'unnamed']??0)+1;
      // A changed frame is a SEPARATE theorem instance, never proof of
      // original-frame FarFileEntry. Authenticate independently.
      const inOriginal=source.frame===originalToken.frame;
      const auth=inOriginal
        ?authenticateKQK35LowWall(state,strong,source,originalToken.frame)
        :authenticateKQK33Backrank(state,strong,source);
      if(auth.authenticated){
        if(inOriginal)r.originalFrameAuthenticated++;
        else r.switchedFrameAuthenticated++;
      }else{
        r.unverifiedSource++;
        if(!r.firstUnverifiedTheorem)
          r.firstUnverifiedTheorem={...witness,reason:auth.reason??'unverified',
            theorem:auth.theorem??null};
      }
      const childKey=witness.at+'|'+JSON.stringify(originalToken);
      if(seenChildren.has(childKey))continue;
      seenChildren.add(childKey);
      const tree=probeS036Tree('kqk',state,strong,originalToken,
        {maxNodes,maxPairs});
      r.continuationsProbed++;
      r.sourceUnsupported+=tree.unsupported;
      r.sourceCaptured+=tree.captured;
      r.sourceNonmate+=tree.nonmateTerminal;
      r.sourceRepeats+=tree.structuralRepeats;
      if(tree.closedAllReplies&&auth.authenticated)r.mateClosedRoots++;
      if(tree.cappedNodes||tree.cappedPairs){
        r.resourceCapped++;
        if(!r.firstResourceCap)r.firstResourceCap={...witness,
          firstProblem:tree.firstProblem,verdict:tree.verdict};
      }
      const hard=problemKind(tree);
      if(hard&&!r.firstActualGap)r.firstActualGap={...witness,reason:hard,
        firstProblem:tree.firstProblem,verdict:tree.verdict};
      if(r.examples.length<maxExamples)r.examples.push({
        ...witness,theoremAuthenticated:auth.authenticated,
        theorem:auth.theorem??null,theoremObligation:auth.authenticated?null:auth.reason,
        verdict:tree.verdict,nodes:tree.nodes,defenderReplies:tree.defenderReplies,
        sourceMoves:tree.sourceMoves,mates:tree.mates,
        firstProblem:tree.firstProblem
      });
    }
  }
  return r;
}

/** Identify the FIRST observed central/restoration handoff, but refuse
 * to assign a fabricated rank to it. S035 PREP local descent is NOT a
 * frozen cross-phase composition theorem.
 */
export function auditS037KRKBridge({
  maxRoots=8,maxNodes=200,maxPairs=36
}={}){
  for(const [k,n] of Object.entries({maxRoots,maxNodes,maxPairs}))positive(n,k);
  const audit=auditS036KRK({maxRoots,maxNodes,maxPairs});
  const witness=audit.reports.find(x=>x.firstCrossPhaseWitness)
    ?.firstCrossPhaseWitness??null;
  const counterexample=audit.reports.find(x=>problemKind(x))??null;
  return {sampledRoots:audit.reports.length,
    nodes:audit.reports.reduce((a,x)=>a+x.nodes,0),
    defenderReplies:audit.reports.reduce((a,x)=>a+x.defenderReplies,0),
    sourceMoves:audit.reports.reduce((a,x)=>a+x.sourceMoves,0),
    firstRealPhaseHandoff:witness,
    firstSourceCounterexample:counterexample?{
      rootPhase:counterexample.rootPhase,root:counterexample.root,
      firstProblem:counterexample.firstProblem,kind:problemKind(counterexample)
    }:null,
    mateClosedRoots:audit.reports.filter(x=>x.closedAllReplies).length,
    resourceCappedRoots:audit.reports.filter(x=>
      x.cappedPairs||x.cappedNodes).length,
    globalRankTheoremLocated:false,globalTerminationCertified:false,
    preciseOutstandingObligation:'Identify an immutable frozen lemma ranking the exact (board, nested continuation token) transition through central/restoration for every legal weak reply; S035 proves PREP descent only.',
    reports:audit.reports.map(({rootPhase,frame,root,verdict,
      firstProblem,firstCrossPhaseWitness,crossPhaseEdges})=>({
        rootPhase,frame,root,verdict,firstProblem,
        firstCrossPhaseWitness,crossPhaseEdges}))
  };
}

/** No caching algorithm is imported into gameplay. Run the existing
 * deterministic S021 falsification harness TWICE on precisely identical
 * seeded roots/depth/budgets and compare closed-only cache strategies.
 * A node-cap result is inconclusive, not a mating certificate.
 */
export function compareS037KQKCaches({
  attempts=400,perFamily=1,maxNodes=300,maxRounds=32
}={}){
  for(const [k,n] of Object.entries({attempts,perFamily,maxNodes,maxRounds}))
    positive(n,k);
  const script=resolve(dirname(fileURLToPath(import.meta.url)),
    'kqk21-adversarial.mjs');
  function run(mode){
    return JSON.parse(execFileSync(process.execPath,[script,
      '--attempts='+attempts,'--per-family='+perFamily,
      '--nodes='+maxNodes,'--rounds='+maxRounds,'--cache='+mode],
    {encoding:'utf8',maxBuffer:32*1024*1024}));
  }
  const exact=run('exact'),monotone=run('monotone');
  // S021 reports every sampled root's full material/turn/family identity.
  // Compare the ACTUAL sampled roots, not just matching seed and totals.
  const sameSampling=exact.seed===monotone.seed&&
    exact.legalCandidates===monotone.legalCandidates&&
    exact.roots===monotone.roots&&
    exact.attempts===monotone.attempts&&
    exact.perFamily===monotone.perFamily&&
    JSON.stringify(exact.sampledRootKeys)===
      JSON.stringify(monotone.sampledRootKeys);
  // Only an EXACT closed result disappearing under monotone may suggest
  // unsound regressions; inconclusive caps may legitimately improve.
  const exactFamilyClosed=Object.fromEntries(Object.entries(exact.families)
    .map(([k,v])=>[k,v.allRepliesMate]));
  const monotoneFamilyClosed=Object.fromEntries(Object.entries(monotone.families)
    .map(([k,v])=>[k,v.allRepliesMate]));
  const lostClosed=Object.keys(exactFamilyClosed).filter(k=>
    (monotoneFamilyClosed[k]??0)<exactFamilyClosed[k]);
  return {seed:exact.seed,sameSampling,attempts,perFamily,maxNodes,maxRounds,
    exact:{roots:exact.roots,closed:exact.allRepliesMate,
      falsified:exact.falsified,inconclusive:exact.inconclusive,
      visitedNodes:exact.visitedNodes,
      legalDefenderRepliesVisited:exact.legalDefenderRepliesVisited,
      closedSubtreesReused:exact.closedSubtreesReused,
      crossDepthClosedReuses:exact.crossDepthClosedReuses},
    monotone:{roots:monotone.roots,closed:monotone.allRepliesMate,
      falsified:monotone.falsified,inconclusive:monotone.inconclusive,
      visitedNodes:monotone.visitedNodes,
      legalDefenderRepliesVisited:monotone.legalDefenderRepliesVisited,
      closedSubtreesReused:monotone.closedSubtreesReused,
      crossDepthClosedReuses:monotone.crossDepthClosedReuses},
    lostExactClosedFamilies:lostClosed,
    // This is a comparison of a fixed seeded dataset, not universal mating.
    universalMatingCertified:false,fideHistoryCertified:false,
    note:'S021 only memoizes fully all-replies-closed subtrees; fixed-seed sampling matches but finite root closure cannot prove global termination.'};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const option=(name,otherwise)=>{
    const arg=process.argv.find(a=>a.startsWith('--'+name+'='));
    return arg?Number(arg.slice(name.length+3)):otherwise;
  };
  const maxNodes=option('nodes',200),maxPairs=option('pairs',36);
  const report={
    kqk:auditS037Prepared({maxLegalRoots:option('legal',1500),
      maxPrepared:option('prepared',8),maxNodes,maxPairs}),
    krk:auditS037KRKBridge({maxRoots:option('krk-roots',8),
      maxNodes,maxPairs})
  };
  if(!process.argv.includes('--no-cache'))
    report.cacheComparison=compareS037KQKCaches({
      attempts:option('attempts',400),perFamily:option('per-family',1),
      maxNodes:option('cache-nodes',300),
      maxRounds:option('rounds',32)});
  console.log(JSON.stringify(report,null,2));
  if(process.argv.includes('--strict')&&(
    report.kqk.preparedRoots===0||report.krk.sampledRoots===0||
    report.cacheComparison&&!report.cacheComparison.sameSampling||
    report.cacheComparison?.lostExactClosedFamilies.length))
    process.exitCode=1;
}
