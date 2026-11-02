/**
 * S038 — widening the authentic FarFilePreparation legal-root orbits.
 *
 * Never used by the live selector: every attacker move comes from the
 * source-tagged controller, every defender move is actually legal, and every
 * continuation token is issued by the preceding move.
 */
import {pathToFileURL} from 'node:url';
import {legalMoves,makeBoard,newGame,opposite,positionKey,squareAt,
  validateSetup} from '../src/chess.js';
import {kqkSourceChoice,KQK_PROOF_SOURCE_SHA}
  from '../src/kqk-source-policy.js';
import {mathsPlayMove} from '../src/maths-play-policy.js';
import {KQK32_FRAMES,kqk32CaseFromState}
  from './kqk32-far-file-audit.mjs';
import {authenticateKQK35LowWall} from './s035-source-bridges.mjs';
import {authenticateKQK33Backrank}
  from './kqk33-source-correspondence.mjs';
import {probeS036Tree} from './s036-cross-phase-audit.mjs';
import {auditS037KRKBridge} from './s037-source-gap.mjs';

const TOTAL=6*8*6*8*4*8; // full canonical preparatory-coordinate box
const FRAMES=Object.entries(KQK32_FRAMES);
const cap=(v,k,max=100000)=>{
  if(!Number.isSafeInteger(v)||v<1||v>max)
    throw new RangeError(k+' must be in 1..'+max);
};
const uci=m=>m.from+'-'+m.to;

/** A coprime permutation of ALL 73,728 canonical coordinate tuples.
 * Unlike the S034 lexicographic prefix, it varies king/queen/weak ranks
 * and files immediately. Source admissibility is checked on the actual
 * legal root; the tuple alone never fabricates a proof or token.
 * Two rotating board isometries and both colours span real root orbits.
 */
export function* kqk38WideLegalRoots(maxTuples=2400){
  cap(maxTuples,'maxTuples',TOTAL);
  for(let i=0;i<maxTuples;i++){
    let j=(i*31337+19001)%TOTAL;
    const wy=j%8;j=Math.floor(j/8);
    const wx=4+j%4;j=Math.floor(j/4);
    const qy=j%8;j=Math.floor(j/8);
    const qx=2+j%6;j=Math.floor(j/6);
    const kx=j%8;j=Math.floor(j/8);
    const ky=j%6;
    if(wy<ky+2||qy===ky||qy===wy)continue;
    const seed={k:[kx,ky],q:[qx,qy],w:[wx,wy]};
    for(const fidx of [i%FRAMES.length,(i+3)%FRAMES.length]){
      const [frame,transform]=FRAMES[fidx];
      for(const strong of ['w','b']){
        const weak=opposite(strong),board=makeBoard();
        const k=squareAt(...transform(seed.k));
        const q=squareAt(...transform(seed.q));
        const w=squareAt(...transform(seed.w));
        if(new Set([k,q,w]).size!==3)continue;
        board[k]=strong+'K';board[q]=strong+'Q';board[w]=weak+'K';
        if(validateSetup(board,'kqk',strong)!==null)continue;
        yield {frame,strong,seed,root:newGame(board,strong,'kqk',
          {experimentalKQK:true})};
      }
    }
  }
}

export function auditS038Widened({
  maxTuples=2400,maxPrepared=12,maxNodes=120,maxPairs=24
}={}){
  for(const [k,v] of Object.entries({maxTuples,maxPrepared,maxNodes,maxPairs}))
    cap(v,k,k==='maxTuples'?TOTAL:100000);
  const budgets=[{nodes:Math.max(1,Math.floor(maxNodes/2)),
    pairs:Math.max(1,Math.floor(maxPairs/2))},
  {nodes:maxNodes,pairs:maxPairs}];
  const report={sourceSha:KQK_PROOF_SOURCE_SHA,
    sampling:{maxTuples,maxPrepared,budgets,canonicalTupleUniverse:TOTAL,
      scheme:'coprime tuple permutation, two rotating symmetries, both colours'},
    legalCandidates:0,sourcePrepared:0,firstReplies:0,
    originalCases:{},selectedSourceRules:{},
    matchedOriginalFrame:0,authenticatedSwitchedFrame:0,
    missingSource:0,unverifiedTheorem:0,
    firstActualGap:null,firstUnverifiedTheorem:null,
    firstResourceCap:null,firstPotentialCycle:null,firstNewObligation:null,
    roots:[],outcomes:budgets.map(b=>({...b,mateClosed:0,
      unsupported:0,capture:0,nonmate:0,repeat:0,resourceCap:0})),
    genuineTokensOnly:true,universalMatingCertified:false,
    globalPhaseRankCertified:false,fideHistoryCertified:false};
  const seen=new Set();
  for(const {root,strong,frame,seed} of kqk38WideLegalRoots(maxTuples)){
    if(report.sourcePrepared>=maxPrepared)break;
    const key=positionKey(root.board,root.turn);
    if(seen.has(key))continue;
    seen.add(key);report.legalCandidates++;
    const first=kqkSourceChoice(root,strong);
    if(first?.continuationPhase?.kind!=='far-file'||
       !first.sourcePhase?.includes('FarFilePreparation.far_file_preparation'))
      continue;
    const token=first.continuationPhase;
    report.sourcePrepared++;
    const after=mathsPlayMove(root,first.move);
    const rootRecord={root:key,frame,strong,seed,
      firstMove:uci(first.move),originalFrame:token.frame,token,
      replies:[]};
    for(const reply of legalMoves(after.board,opposite(strong))){
      report.firstReplies++;
      const state=mathsPlayMove(after,reply);
      const selected=kqkSourceChoice(state,strong,token);
      const originalCase=kqk32CaseFromState(state,strong,token.frame);
      report.originalCases[String(originalCase)]=
        (report.originalCases[String(originalCase)]??0)+1;
      const w={at:positionKey(state.board,state.turn),
        king:state.board.indexOf(strong+'K'),
        queen:state.board.indexOf(strong+'Q'),
        weakKing:state.board.indexOf(opposite(strong)+'K'),
        originalCase,weakReply:uci(reply),moveHistory:state.log,
        chosenFrame:selected?.frame??null,
        chosenRule:selected?.sourcePhase??null,
        chosenMove:selected?.move?uci(selected.move):null};
      if(!selected?.move){
        report.missingSource++;
        if(!report.firstActualGap)report.firstActualGap={root:key,
          token,...w,reason:'no source action after genuine legal defender reply'};
      } else {
        report.selectedSourceRules[selected.sourcePhase]=
          (report.selectedSourceRules[selected.sourcePhase]??0)+1;
        // A theorem invoked in a changed frame must be checked against
        // the changed-frame proof, not the original FarFileEntry split.
        const sameFrame=selected.frame===token.frame;
        const a=sameFrame
          ?authenticateKQK35LowWall(state,strong,selected,token.frame)
          :authenticateKQK33Backrank(state,strong,selected);
        if(a.authenticated){
          if(sameFrame)report.matchedOriginalFrame++;
          else report.authenticatedSwitchedFrame++;
        } else {
          report.unverifiedTheorem++;
          if(!report.firstUnverifiedTheorem)
            report.firstUnverifiedTheorem={root:key,token,...w,
              reason:a.reason??'no independently authenticated theorem'};
        }
      }
      for(let i=0;i<budgets.length;i++){
        const b=budgets[i],o=report.outcomes[i];
        const t=probeS036Tree('kqk',state,strong,token,
          {maxNodes:b.nodes,maxPairs:b.pairs});
        const kind=t.closedAllReplies?'mateClosed':
          t.unsupported?'unsupported':
          t.captured?'capture':
          t.nonmateTerminal?'nonmate':
          t.structuralRepeats?'repeat':'resourceCap';
        o[kind]++;
        if(!t.closedAllReplies&&
           (t.unsupported||t.captured||t.nonmateTerminal)&&
           !report.firstActualGap)
          report.firstActualGap={root:key,token,...w,reason:kind,
            firstProblem:t.firstProblem,depthBudget:b};
        if(t.structuralRepeats&&!report.firstPotentialCycle)
          report.firstPotentialCycle={root:key,token,...w,
            firstProblem:t.firstProblem,depthBudget:b};
        if((t.cappedNodes||t.cappedPairs)&&!report.firstResourceCap)
          report.firstResourceCap={root:key,token,...w,
            firstProblem:t.firstProblem,depthBudget:b};
        if(!t.closedAllReplies&&
           !t.cappedNodes&&!t.cappedPairs&&!t.unsupported&&
           !t.captured&&!t.nonmateTerminal&&!t.structuralRepeats)
          throw Error('unaccounted-for nonclosed source subtree');
        w['budget'+i]={verdict:t.verdict,nodes:t.nodes,
          mates:t.mates,cappedNodes:t.cappedNodes,
          cappedPairs:t.cappedPairs,firstProblem:t.firstProblem};
      }
      rootRecord.replies.push(w);
    }
    report.roots.push(rootRecord);
  }
  // A cap is the FIRST NEXT OBLIGATION only if no hard source gap
  // or theorem authentication failure is observed.
  report.firstNewObligation=report.firstActualGap??
    report.firstUnverifiedTheorem??report.firstPotentialCycle??
    report.firstResourceCap;
  return report;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const arg=(k,d)=>{
    const raw=process.argv.find(x=>x.startsWith('--'+k+'='));
    return raw?Number(raw.slice(k.length+3)):d;
  };
  const kqk=auditS038Widened({maxTuples:arg('tuples',2400),
    maxPrepared:arg('prepared',12),maxNodes:arg('nodes',120),
    maxPairs:arg('pairs',24)});
  const krk=auditS037KRKBridge({maxRoots:arg('krk-roots',4),
    maxNodes:arg('nodes',120),maxPairs:arg('pairs',24)});
  console.log(JSON.stringify({kqk,krk:{
    firstRealPhaseHandoff:krk.firstRealPhaseHandoff,
    firstSourceCounterexample:krk.firstSourceCounterexample,
    resourceCappedRoots:krk.resourceCappedRoots,
    globalRankTheoremLocated:false,
    globalTerminationCertified:false}},null,2));
  if(process.argv.includes('--strict')&&
     (!kqk.sourcePrepared||!kqk.firstReplies||
       !krk.firstRealPhaseHandoff))
    process.exitCode=1;
}
