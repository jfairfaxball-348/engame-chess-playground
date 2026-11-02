/**
 * S039: second-defender-reply and phase-certificate obligations.
 * Diagnostic only. A full root identity always includes the actual issued
 * preparation token and the exact move log. No move is chosen by this audit.
 */
import {pathToFileURL} from 'node:url';
import {legalMoves,opposite,outcome,positionKey} from '../src/chess.js';
import {kqkSourceChoice,KQK_PROOF_SOURCE_SHA}
  from '../src/kqk-source-policy.js';
import {mathsPlayMove} from '../src/maths-play-policy.js';
import {kqk38WideLegalRoots} from './s038-orbit-closure.mjs';
import {probeS036Tree} from './s036-cross-phase-audit.mjs';
import {authenticateKQK35LowWall,authenticateKQK35TightKing}
  from './s035-source-bridges.mjs';
import {authenticateKQK33Backrank}
  from './kqk33-source-correspondence.mjs';
import {auditS037KRKBridge} from './s037-source-gap.mjs';

const LOW='KQK.EntryGeometry.clear_low_wall_entry.queen_wall';
const BACK='KQK.SameRankEntry.backrank_entry.clear_low_wall';
const TIGHT='KQK.TightEntry.tight_king_step.king_approach';
const moveId=m=>m?m.from+'-'+m.to:null;
const cap=(n,k,max=100000)=>{
  if(!Number.isSafeInteger(n)||n<1||n>max)
    throw RangeError(k+' must be an integer 1..'+max);
};
function proofCheck(state,strong,choice){
  if(!choice?.move)return {status:'missing'};
  let a=null;
  if(choice.sourcePhase===LOW)
    a=authenticateKQK35LowWall(state,strong,choice,choice.frame);
  else if(choice.sourcePhase===BACK)
    a=authenticateKQK33Backrank(state,strong,choice);
  else if(choice.sourcePhase===TIGHT)
    a=authenticateKQK35TightKing(state,strong,choice);
  if(!a)return {status:'not-independently-checked',
    theorem:choice.sourcePhase??null};
  return {status:a.authenticated?'authenticated':'failed-premise',
    theorem:a.theorem??choice.sourcePhase,
    reason:a.authenticated?null:a.reason??'unknown failed premise'};
}
const counts=()=>({mateClosed:0,unsupported:0,capture:0,nonmate:0,
  potentialCycle:0,resourceCap:0});
function classify(tree){
  if(tree.closedAllReplies)return 'mateClosed';
  if(tree.unsupported)return 'unsupported';
  if(tree.captured)return 'capture';
  if(tree.nonmateTerminal)return 'nonmate';
  if(tree.structuralRepeats)return 'potentialCycle';
  if(tree.cappedNodes||tree.cappedPairs)return 'resourceCap';
  throw Error('unaccounted source subtree (must not count as mate)');
}
/**
 * Every legal first defender reply, followed by every legal second
 * defender reply after the exact first source-selected attacker action.
 * Checks that an actually selected frozen theorem has independently
 * checkable premises; lack of a local checker is NOT a disproved theorem.
 */
export function auditS039SourcePairs({
  maxTuples=1600,maxPrepared=10,maxNodes=320,maxPairs=56,maxKrkRoots=4
}={}){
  for(const [k,n] of Object.entries({maxTuples,maxPrepared,maxNodes,
    maxPairs,maxKrkRoots}))cap(n,k,k==='maxTuples'?73728:100000);
  const budgets=[
    {nodes:Math.max(1,Math.floor(maxNodes/2)),
      pairs:Math.max(1,Math.floor(maxPairs/2))},
    {nodes:maxNodes,pairs:maxPairs}];
  const r={sourceSha:KQK_PROOF_SOURCE_SHA,
    scope:{maxTuples,maxPrepared,budgets,maxKrkRoots},
    checkedRoots:0,genuinePreparedRoots:0,firstWeakReplies:0,
    secondWeakReplies:0,firstSourceMoves:0,thirdSourceMoves:0,
    firstSourceAuthenticated:0,firstSourceFailedPremise:0,
    firstSourceUnchecked:0,thirdSourceAuthenticated:0,
    thirdSourceFailedPremise:0,thirdSourceUnchecked:0,
    thirdRules:{},secondReplyTerminals:{},
    firstActualGap:null,firstUnverifiedTheorem:null,
    firstUncheckedLaterTheorem:null,firstPotentialCycle:null,
    firstResourceCap:null,firstKRKCrossPhase:null,
    firstKRKRestoration:null,
    krkGlobalPhaseCompositionCertified:false,
    globalMateCertified:false,fideHistoryCertified:false,
    outcomes:budgets.map(b=>({...b,...counts()})),
    roots:[]};
  const seen=new Set();
  for(const {root,strong,frame,seed} of kqk38WideLegalRoots(maxTuples)){
    if(r.genuinePreparedRoots>=maxPrepared)break;
    const rootKey=positionKey(root.board,root.turn);
    if(seen.has(rootKey))continue;
    seen.add(rootKey);r.checkedRoots++;
    const prep=kqkSourceChoice(root,strong);
    if(prep?.continuationPhase?.kind!=='far-file'||
       !prep.sourcePhase?.includes('FarFilePreparation.far_file_preparation'))
      continue;
    r.genuinePreparedRoots++;
    const token=prep.continuationPhase;
    const initial=mathsPlayMove(root,prep.move);
    const entry={root:rootKey,strong,frame,seed,token,
      firstAction:moveId(prep.move),firstReplies:[]};
    for(const weak1 of legalMoves(initial.board,opposite(strong))){
      r.firstWeakReplies++;
      const s1=mathsPlayMove(initial,weak1);
      const a1=kqkSourceChoice(s1,strong,token);
      const checked=proofCheck(s1,strong,a1);
      const first={state:positionKey(s1.board,s1.turn),
        moveHistory:s1.log,weakReply:moveId(weak1),
        selectedRule:a1?.sourcePhase??null,selectedFrame:a1?.frame??null,
        selectedAction:moveId(a1?.move),selectedTheorem:checked,
        secondReplies:[],budgets:[]};
      if(!a1?.move){
        if(!r.firstActualGap)r.firstActualGap={stage:'first',
          root:rootKey,token,...first,reason:'no frozen-source action'};
      }else{
        r.firstSourceMoves++;
        if(checked.status==='authenticated')r.firstSourceAuthenticated++;
        else if(checked.status==='failed-premise'){
          r.firstSourceFailedPremise++;
          if(!r.firstUnverifiedTheorem)
            r.firstUnverifiedTheorem={stage:'first',root:rootKey,token,
              ...first,reason:checked.reason};
        }else r.firstSourceUnchecked++;
        const after=mathsPlayMove(s1,a1.move);
        const terminal=outcome(after.board,after.turn);
        if(terminal.kind!=='ongoing'){
          r.secondReplyTerminals[terminal.kind]=
            (r.secondReplyTerminals[terminal.kind]??0)+1;
        }else{
          for(const weak2 of legalMoves(after.board,opposite(strong))){
            r.secondWeakReplies++;
            const s2=mathsPlayMove(after,weak2);
            const id={state:positionKey(s2.board,s2.turn),
              moveHistory:s2.log,weakReply:moveId(weak2)};
            if(s2.material==='kk'||weak2.capture){
              r.secondReplyTerminals.capture=
                (r.secondReplyTerminals.capture??0)+1;
              if(!r.firstActualGap)r.firstActualGap={stage:'second',
                root:rootKey,token,firstWeakReply:moveId(weak1),...id,
                reason:'defender captured the attacking queen'};
              first.secondReplies.push({...id,result:'capture'});
              continue;
            }
            const status=outcome(s2.board,s2.turn);
            if(status.kind!=='ongoing'){
              r.secondReplyTerminals[status.kind]=
                (r.secondReplyTerminals[status.kind]??0)+1;
              if(!r.firstActualGap)r.firstActualGap={stage:'second',
                root:rootKey,token,firstWeakReply:moveId(weak1),...id,
                reason:'nonmate terminal '+status.kind};
              first.secondReplies.push({...id,result:status.kind});
              continue;
            }
            const a2=kqkSourceChoice(s2,strong,a1.continuationPhase??null);
            const checked2=proofCheck(s2,strong,a2);
            if(a2?.move){
              r.thirdSourceMoves++;
              const rule=a2.sourcePhase??'unnamed';
              r.thirdRules[rule]=(r.thirdRules[rule]??0)+1;
              if(checked2.status==='authenticated')
                r.thirdSourceAuthenticated++;
              else if(checked2.status==='failed-premise'){
                r.thirdSourceFailedPremise++;
                if(!r.firstUnverifiedTheorem)
                  r.firstUnverifiedTheorem={stage:'third',
                    root:rootKey,token,firstWeakReply:moveId(weak1),
                    ...id,selectedRule:rule,selectedFrame:a2.frame,
                    selectedAction:moveId(a2.move),
                    reason:checked2.reason};
              }else{
                r.thirdSourceUnchecked++;
                if(!r.firstUncheckedLaterTheorem)
                  r.firstUncheckedLaterTheorem={stage:'third',
                    root:rootKey,token,firstWeakReply:moveId(weak1),
                    ...id,selectedRule:rule,selectedFrame:a2.frame,
                    selectedAction:moveId(a2.move),
                    reason:'no independently implemented full-premise checker'};
              }
            }else if(!r.firstActualGap)
              r.firstActualGap={stage:'third',root:rootKey,token,
                firstWeakReply:moveId(weak1),...id,
                continuationToken:a1.continuationPhase??null,
                reason:'source controller supplies no third attacker action'};
            first.secondReplies.push({...id,
              result:a2?.move?'source':'missing-source',
              selectedRule:a2?.sourcePhase??null,
              selectedFrame:a2?.frame??null,
              selectedAction:moveId(a2?.move),
              selectedTheorem:checked2,
              continuationToken:a1.continuationPhase??null});
          }
        }
      }
      for(let j=0;j<budgets.length;j++){
        const b=budgets[j];
        const t=probeS036Tree('kqk',s1,strong,token,
          {maxNodes:b.nodes,maxPairs:b.pairs});
        const category=classify(t);
        r.outcomes[j][category]++;
        const issue={root:rootKey,token,
          firstWeakReply:moveId(weak1),state:first.state,
          moveHistory:s1.log,budget:b,firstProblem:t.firstProblem,
          selectedAction:moveId(a1?.move),selectedRule:a1?.sourcePhase??null,
          selectedFrame:a1?.frame??null};
        if((t.unsupported||t.captured||t.nonmateTerminal)&&
           !r.firstActualGap)r.firstActualGap={...issue,reason:category};
        if(t.structuralRepeats&&!r.firstPotentialCycle)
          r.firstPotentialCycle={...issue,reason:'potential structural cycle'};
        if((t.cappedNodes||t.cappedPairs)&&!r.firstResourceCap)
          r.firstResourceCap={...issue,reason:'resource cap, not policy failure'};
        first.budgets.push({budget:b,verdict:t.verdict,
          nodes:t.nodes,mates:t.mates,cappedNodes:t.cappedNodes,
          cappedPairs:t.cappedPairs,firstProblem:t.firstProblem});
      }
      entry.firstReplies.push(first);
    }
    r.roots.push(entry);
  }
  const krk=auditS037KRKBridge({maxRoots:maxKrkRoots,
    maxNodes:Math.min(maxNodes,320),maxPairs:Math.min(maxPairs,56)});
  r.firstKRKCrossPhase=krk.firstRealPhaseHandoff;
  r.firstKRKRestoration=krk.firstRealRestorationHandoff;
  r.krkSourceCounterexample=krk.firstSourceCounterexample;
  r.krkResourceCappedRoots=krk.resourceCappedRoots;
  r.firstNewObligation=r.firstActualGap??r.firstUnverifiedTheorem??
    r.firstUncheckedLaterTheorem??r.firstPotentialCycle??r.firstResourceCap;
  return r;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const option=(k,d)=>{
    const value=process.argv.find(a=>a.startsWith('--'+k+'='));
    return value?Number(value.slice(k.length+3)):d;
  };
  const r=auditS039SourcePairs({
    maxTuples:option('tuples',1600),maxPrepared:option('prepared',10),
    maxNodes:option('nodes',320),maxPairs:option('pairs',56),
    maxKrkRoots:option('krk-roots',4)});
  console.log(JSON.stringify(process.argv.includes('--full')?r:{
    ...r,roots:r.roots.map(({root,strong,frame,token,firstAction,
      firstReplies})=>({root,strong,frame,token,firstAction,
      firstReplyCount:firstReplies.length,
      secondReplyCount:firstReplies.reduce((n,x)=>n+x.secondReplies.length,0)}))
  },null,2));
  if(process.argv.includes('--strict')&&
     (!r.genuinePreparedRoots||!r.firstWeakReplies||
      !r.secondWeakReplies||!r.firstKRKCrossPhase||
      r.firstSourceFailedPremise))
    process.exitCode=1;
}
