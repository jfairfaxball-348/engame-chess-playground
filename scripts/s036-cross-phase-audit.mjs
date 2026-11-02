/**
 * S036 — bounded, cross-phase, ALL-legal-defender continuation probes.
 *
 * Audit only. Attacker decisions are obtained EXCLUSIVELY from the existing
 * frozen-source JS policies. The traversal never supplies a candidate move to
 * the live policy. Keep each emitted continuation token unchanged through
 * the actual weak reply. A capped or repeated structural state is NOT mate.
 */
import {pathToFileURL} from 'node:url';
import {legalMoves,makeBoard,newGame,opposite,outcome,play,
  positionKey,squareAt,validateSetup} from '../src/chess.js';
import {mathsPlayMove} from '../src/maths-play-policy.js';
import {kqkSourceChoice} from '../src/kqk-source-policy.js';
import {krkTaggedStrongChoice} from '../src/krk-tagged-strategy.js';
import {kqk30ControlShape} from './kqk30-state-key.mjs';
import {krk14ControlStateKey} from './krk14-mate-tree.mjs';
import {kqk32FixtureRoots,kqk32CaseFromState,KQK32_FRAMES}
  from './kqk32-far-file-audit.mjs';
import {authenticateKQK35LowWall} from './s035-source-bridges.mjs';
import {authenticateKQK33Backrank}
  from './kqk33-source-correspondence.mjs';
import {krk15StratifiedRoots} from './krk15-stratified-mate-audit.mjs';

const validCap=(n,label)=>{
  if(!Number.isSafeInteger(n)||n<1||n>100000)
    throw new RangeError(label+' must be an integer 1..100000');
};
const moveKey=m=>m.from+'-'+m.to;
const shape=(mode,s,strong,token)=>mode==='krk'
  ?positionKey(s.board,s.turn)+'|'+krk14ControlStateKey(token)
  :kqk30ControlShape(s,strong,token);
const source=(mode,s,strong,token)=>mode==='krk'
  ?krkTaggedStrongChoice(s,token):kqkSourceChoice(s,strong,token);
const advance=(mode,s,m)=>mode==='krk'?play(s,m):mathsPlayMove(s,m);
const phase=choice=>{
  if(!choice)return 'unsupported';
  const p=choice.sourcePhase??'unnamed';
  const rule=choice.rule??p;
  return /restor/i.test(rule)?'restoration':p;
};
const isGlobalBridge=(a,b)=>a&&b&&
  (/central|restoration/.test(a)||/central|restoration/.test(b));

/** Every defender reply at each visited node; no defender reply heuristic.
 * Caps are verdicts, not wins. Structural recurrences are potential loops,
 * not FIDE-identical states (history/clock are intentionally distinguished).
 */
export function probeS036Tree(mode,root,strong,firstToken=null,{
  maxNodes=200,maxPairs=36,maxExamples=6
}={}){
  if(!['krk','kqk'].includes(mode))throw RangeError('unknown material');
  for(const [k,v] of Object.entries({maxNodes,maxPairs,maxExamples}))
    validCap(v,k);
  const r={mode,root:positionKey(root.board,root.turn),strong,
    nodes:0,defenderReplies:0,sourceMoves:0,mates:0,
    cappedNodes:0,cappedPairs:0,unsupported:0,
    captured:0,nonmateTerminal:0,structuralRepeats:0,
    crossPhaseEdges:{},firstCrossPhaseWitness:null,
    firstRestorationHandoff:null,firstProblem:null,
    closedAllReplies:false,completeGlobalMateProof:false,
    fideHistoryCertified:false};
  const active=new Set();
  const issue=(kind,s,trace,details={})=>{
    if(!r.firstProblem)r.firstProblem={kind,
      at:positionKey(s.board,s.turn),trace:trace.slice(-24),...details};
  };
  function visit(s,token,pairs,previous,trace){
    if(pairs>=maxPairs){
      r.cappedPairs++;issue('pair-cap',s,trace,{pairs});
      return false;
    }
    if(r.nodes>=maxNodes){
      r.cappedNodes++;issue('node-cap',s,trace,{pairs});
      return false;
    }
    const key=shape(mode,s,strong,token);
    if(active.has(key)){
      r.structuralRepeats++;
      issue('repeated board and controller shape (history may differ)',
        s,trace,{pairs,token});
      return false;
    }
    r.nodes++;
    const before=outcome(s.board,s.turn); // simplified, clock-free diagnostic
    if(before.kind==='mate'&&before.winner===strong){r.mates++;return true;}
    if(before.kind!=='ongoing'){
      r.nonmateTerminal++;issue('nonmate-before-source:'+before.kind,s,trace);
      return false;
    }
    const choice=source(mode,s,strong,token);
    if(!choice?.move){
      r.unsupported++;issue('missing frozen-source continuation',s,trace,{token});
      return false;
    }
    r.sourceMoves++;
    const current=phase(choice);
    if(previous){
      const edge=previous+' -> '+current;
      r.crossPhaseEdges[edge]=(r.crossPhaseEdges[edge]??0)+1;
      if(isGlobalBridge(previous,current)&&!r.firstCrossPhaseWitness)
        r.firstCrossPhaseWitness={incomingPhase:previous,outgoingPhase:current,
          at:positionKey(s.board,s.turn),
          selectedSource:choice.rule??choice.sourcePhase,
          move:moveKey(choice.move),incomingToken:token,
          trace:trace.slice(-24),
          frozenGlobalRankTheoremAvailable:false};
      if(!r.firstRestorationHandoff&&
         (/restoration/.test(previous)||/restoration/.test(current)))
        r.firstRestorationHandoff={
          incomingPhase:previous,outgoingPhase:current,
          at:positionKey(s.board,s.turn),moveHistory:s.log,
          selectedSource:choice.rule??choice.sourcePhase,
          move:moveKey(choice.move),incomingToken:token,
          trace:trace.slice(-24),
          frozenGlobalRankTheoremAvailable:false};
    }
    const nextTrace=trace.concat('source:'+current+':'+moveKey(choice.move));
    const after=advance(mode,s,choice.move);
    const terminal=outcome(after.board,after.turn);
    if(terminal.kind==='mate'){
      if(terminal.winner===strong){r.mates++;return true;}
      r.nonmateTerminal++;issue('wrong-winner',after,nextTrace);
      return false;
    }
    if(terminal.kind!=='ongoing'){
      r.nonmateTerminal++;issue('nonmate-after-source:'+terminal.kind,after,nextTrace);
      return false;
    }
    const weak=opposite(strong);
    const replies=legalMoves(after.board,weak);
    if(!replies.length){
      r.nonmateTerminal++;issue('no weak replies without mate',after,nextTrace);
      return false;
    }
    active.add(key);
    let allMate=true;
    for(let i=0;i<replies.length;i++){
      const reply=replies[i];
      r.defenderReplies++;
      const child=advance(mode,after,reply);
      if(reply.capture||child.material==='kk'){
        r.captured++;
        issue('defender captured attacking piece',child,
          nextTrace.concat('defender:'+moveKey(reply)));
        allMate=false;continue;
      }
      const done=visit(child,choice.continuationPhase??null,
        pairs+1,current,nextTrace.concat('defender:'+moveKey(reply)));
      if(!done)allMate=false;
      // At a consumed budget, count EVERY skipped legal sibling as
      // explicitly unvisited work. Previously this returned resource-cap
      // without incrementing cappedNodes or preserving a firstProblem.
      // Reaching exactly maxNodes on the LAST sibling can still close.
      if(r.nodes>=maxNodes&&i+1<replies.length){
        r.cappedNodes++;
        issue('node-cap-with-unvisited-defender-siblings',child,
          nextTrace.concat('defender:'+moveKey(reply)),
          {pairs:pairs+1,unvisitedSiblings:replies.length-i-1});
        allMate=false;break;
      }
    }
    active.delete(key);
    return allMate;
  }
  r.closedAllReplies=visit(root,firstToken,0,null,[]);
  r.verdict=r.closedAllReplies?'mate-closed':
    (r.unsupported||r.captured||r.nonmateTerminal)?'counterexample':
    r.structuralRepeats?'potential-cycle':'resource-cap';
  return r;
}

/** Only select REAL FarFilePreparation-issued tokens. Authenticate the
 * immediate selected theorem before probing deeper; a switched frame does
 * not authenticate an unselected original-frame theorem.
 */
export function auditS036KQK({
  maxPrepared=4,maxTight=2,maxNodes=200,maxPairs=36
}={}){
  for(const [k,v] of Object.entries({maxPrepared,maxTight,maxNodes,maxPairs}))
    validCap(v,k);
  const reports=[],cases={},seen=new Set();
  for(const {root,strong} of kqk32FixtureRoots()){
    if(reports.filter(x=>x.origin==='prepared').length>=maxPrepared)break;
    const first=kqkSourceChoice(root,strong);
    if(first?.continuationPhase?.kind!=='far-file')continue;
    const after=mathsPlayMove(root,first.move);
    for(const reply of legalMoves(after.board,opposite(strong))){
      const child=mathsPlayMove(after,reply);
      const originalCase=kqk32CaseFromState(child,strong,
        first.continuationPhase.frame);
      const token=first.continuationPhase;
      const next=kqkSourceChoice(child,strong,token);
      const auth=next?.frame===token.frame
        ?authenticateKQK35LowWall(child,strong,next,token.frame)
        :authenticateKQK33Backrank(child,strong,next);
      if(!auth.authenticated)
        throw Error('S036 requires an authenticated first KQK source: '+
          (auth.reason??'missing'));
      const key=originalCase+':'+next.sourcePhase+':'+strong;
      if(seen.has(key))continue;
      seen.add(key);cases[originalCase]=(cases[originalCase]??0)+1;
      reports.push({origin:'prepared',originalCase,
        firstSource:first.sourcePhase,reply:moveKey(reply),
        authenticatedTheorem:auth.theorem,
        ...probeS036Tree('kqk',child,strong,token,{maxNodes,maxPairs})});
      if(reports.filter(x=>x.origin==='prepared').length>=maxPrepared)break;
    }
  }
  const sample={k:[1,1],q:[0,3],w:[4,2]};
  let tight=0;
  for(const strong of ['w','b']){
    for(const [frame,f] of Object.entries(KQK32_FRAMES)){
      if(tight>=maxTight)break;
      const board=makeBoard(),weak=opposite(strong);
      board[squareAt(...f(sample.k))]=strong+'K';
      board[squareAt(...f(sample.q))]=strong+'Q';
      board[squareAt(...f(sample.w))]=weak+'K';
      if(validateSetup(board,'kqk',strong)!==null)
        throw Error('S036 tight fixture invalid');
      const root=newGame(board,strong,'kqk',{experimentalKQK:true});
      const first=kqkSourceChoice(root,strong);
      if(!first?.move)throw Error('S036 tight root missing source');
      reports.push({origin:'already-far-tight',frame,firstSource:first.sourcePhase,
        ...probeS036Tree('kqk',root,strong,null,{maxNodes,maxPairs})});
      tight++;
    }
    if(tight>=maxTight)break;
  }
  return {scope:{maxPrepared,maxTight,maxNodes,maxPairs},
    sampledRoots:reports.length,genuinePreparationTokensOnly:true,
    originalCases:cases,reports,universalMatingCertified:false};
}

export function auditS036KRK({maxRoots=3,maxNodes=200,maxPairs=36}={}){
  for(const [k,v] of Object.entries({maxRoots,maxNodes,maxPairs}))
    validCap(v,k);
  const reports=[];
  for(const {phase:rootPhase,strong,frame,state} of krk15StratifiedRoots()){
    if(reports.length>=maxRoots)break;
    reports.push({rootPhase,frame,
      ...probeS036Tree('krk',state,strong,null,{maxNodes,maxPairs})});
  }
  return {scope:{maxRoots,maxNodes,maxPairs},reports,
    frozenGlobalRankTheoremAvailable:false,universalMatingCertified:false};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const opt=(flag,fallback)=>{
    const arg=process.argv.find(a=>a.startsWith('--'+flag+'='));
    return arg?Number(arg.slice(flag.length+3)):fallback;
  };
  const maxNodes=opt('nodes',200),maxPairs=opt('pairs',36);
  const kqk=auditS036KQK({maxNodes,maxPairs,
    maxPrepared:opt('prepared',4),maxTight:opt('tight',2)});
  const krk=auditS036KRK({maxNodes,maxPairs,
    maxRoots:opt('krk-roots',3)});
  const compress=reports=>reports.map(({firstProblem,firstCrossPhaseWitness,
    crossPhaseEdges,...rest})=>({...rest,firstProblem,firstCrossPhaseWitness,
    crossPhaseEdges}));
  console.log(JSON.stringify({kqk:{...kqk,reports:compress(kqk.reports)},
    krk:{...krk,reports:compress(krk.reports)}},null,2));
  // Missing source and structural cycles are REPORTED, not disguised as wins
  // or automatically treated as CI regressions of an incomplete controller.
  if(process.argv.includes('--strict')&&(!kqk.sampledRoots||!krk.reports.length))
    process.exitCode=1;
}
