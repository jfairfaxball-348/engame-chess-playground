/**
 * S042: fresh, already-far-file KQK roots independent of preparation.
 * Real legal boards, genuine source moves and issued continuation tokens.
 * Never use a synthetic FarFilePreparation token or an alternative selector.
 * Entire trees closed only when ALL defender children mate within the cap.
 */
import {pathToFileURL} from 'node:url';
import {legalMoves,makeBoard,newGame,opposite,outcome,positionKey,
  squareAt,validateSetup} from '../src/chess.js';
import {kqkSourceChoice,KQK_PROOF_SOURCE_SHA} from '../src/kqk-source-policy.js';
import {mathsPlayMove} from '../src/maths-play-policy.js';
import {kqk32CaseFromState,KQK32_FRAMES} from './kqk32-far-file-audit.mjs';
import {authenticateKQK35TightKing,authenticateKQK35LowWall}
  from './s035-source-bridges.mjs';
import {authenticateKQK33Backrank}
  from './kqk33-source-correspondence.mjs';
import {probeS036Tree} from './s036-cross-phase-audit.mjs';
import {authenticateS040LaterAction,S040_RULES}
  from './s040-source-premises.mjs';
import {authenticateS044Action,S044_RULES}
  from './s044-source-premises.mjs';

const CASES=['separating-rank','tight-above'];
const LOW='KQK.EntryGeometry.clear_low_wall_entry.queen_wall';
const TIGHT='KQK.TightEntry.tight_king_step.king_approach';
const BACK='KQK.SameRankEntry.backrank_entry.clear_low_wall';
const id=m=>m?m.from+'-'+m.to:null;
const valid=(n,name,max=100000)=>{
  if(!Number.isSafeInteger(n)||n<1||n>max)
    throw RangeError(name+' must be an integer 1..'+max);
};
const empty=()=>({mateClosed:0,resourceCap:0,potentialCycle:0,
  sourceGap:0,capture:0,nonmate:0});
const classify=t=>t.closedAllReplies?'mateClosed':
  t.unsupported?'sourceGap':t.captured?'capture':
  t.nonmateTerminal?'nonmate':
  t.structuralRepeats?'potentialCycle':'resourceCap';
function check(state,strong,choice,token=null){
  if(!choice?.move)return {status:'missing'};
  const p=choice.sourcePhase;
  if(S040_RULES.includes(p)){
    // On source continuation, the constructor may deliberately omit frame:
    // the exact frame is carried by the genuinely issued incoming token.
    // Recover it for verification ONLY; never mutate the runtime selector.
    const effectiveFrame=choice.frame??token?.frame??null;
    if(effectiveFrame===null)return {status:'unchecked',source:p,
      reason:'neither source choice nor incoming token carries a frame'};
    const frameOrigin=choice.frame===null?'source-issued-token':'choice';
    const framedChoice=choice.frame===effectiveFrame?choice:
      {...choice,frame:effectiveFrame};
    // Never credit an unverified cross-frame token as a theorem bridge.
    const crossFrame=token!==null&&token.frame!==effectiveFrame;
    const checked=authenticateS040LaterAction(state,strong,framedChoice,
      crossFrame?null:token);
    if(checked.status==='failed-premise')
      return {status:'failed-premise',theorem:p,reason:checked.reason};
    if(crossFrame)return {status:'unchecked',source:p,
      reason:'cross-frame continuation token not authenticated',
      localPremises:checked.status};
    if(checked.status==='authenticated')
      return {status:'authenticated',theorem:p,
        effectiveFrame,frameOrigin,
        legalWeakReplies:checked.legalWeakReplies};
    return {status:'unchecked',source:p,reason:checked.status};
  }
  if(S044_RULES.includes(p))
    return authenticateS044Action(state,strong,choice,token);
  const result=p===TIGHT
    ?authenticateKQK35TightKing(state,strong,choice)
    :p===LOW
    ?authenticateKQK35LowWall(state,strong,choice,choice.frame)
    :p===BACK
    ?authenticateKQK33Backrank(state,strong,choice)
    :null;
  if(!result)return {status:'unchecked',source:p};
  return result.authenticated
    ?{status:'authenticated',theorem:result.theorem}
    :{status:'failed-premise',theorem:p,reason:result.reason};
}
function* seeds(c){
  if(c==='tight-above'){
    // Includes the previously independently checked genuine S035 fixture.
    yield [[1,1],[0,3],[4,2]];
    for(let ky=0;ky<=3;ky++)for(let kx=0;kx<=3;kx++)
      for(let qx=0;qx<=1;qx++)for(let wx=4;wx<=7;wx++)
        yield [[kx,ky],[qx,ky+2],[wx,ky+1]];
  }else{
    for(let ky=0;ky<=3;ky++)for(let kx=0;kx<=3;kx++)
      for(let qx=0;qx<=1;qx++)
        for(let qy=ky+1;qy<=5;qy++)for(let wy=qy+1;wy<=7;wy++)
          for(let wx=4;wx<=7;wx++)
            yield [[kx,ky],[qx,qy],[wx,wy]];
  }
}
/** Finite, deterministic canonical construction plus exact board symmetries.
 * "Fresh" is literal: every root is strong-to-move, with ZERO input token.
 * The requested case is authenticated in its source-original frame, while a
 * controller-chosen DIFFERENT frame is tracked as a separate theorem instance.
 */
export function* kqk42FreshRoots({maxCandidates=4000}={}){
  valid(maxCandidates,'maxCandidates',100000);
  let examined=0;
  for(const originalCase of CASES){
    let local=0;
    for(const [sk,q,w] of seeds(originalCase)){
      if(local>=maxCandidates)break;
      local++;
      for(const frame of ['id','reflectX','reflectY','swap']){
        // Most transforms are self-inverse. Every chosen transform here is.
        const transform=KQK32_FRAMES[frame];
        for(const strong of ['w','b']){
          const board=makeBoard(),weak=opposite(strong);
          const positions=[sk,q,w].map(x=>squareAt(...transform(x)));
          if(new Set(positions).size!==3)continue;
          board[positions[0]]=strong+'K';
          board[positions[1]]=strong+'Q';
          board[positions[2]]=weak+'K';
          if(validateSetup(board,'kqk',strong)!==null)continue;
          const root=newGame(board,strong,'kqk',{experimentalKQK:true});
          if(kqk32CaseFromState(root,strong,frame)!==originalCase)
            throw Error('S042 original-frame family classification drift');
          examined++;
          yield {root,strong,frame,originalCase,seed:{sk,q,w},examined};
        }
      }
    }
  }
}
const noMate=status=>status.kind!=='ongoing'&&
  !(status.kind==='mate');
/** Every legal first and second defender reply from selected fresh roots.
 * A named but unchecked later theorem remains unchecked, not false/true.
 */
export function auditS042FreshFamilies({
  maxPerFamily=4,maxCandidates=4000,maxNodes=100,maxPairs=20,
  maxExamples=6,full=false
}={}){
  for(const [name,n] of Object.entries({maxPerFamily,maxCandidates,
    maxNodes,maxPairs,maxExamples}))
    valid(n,name,name==='maxCandidates'?100000:100000);
  const r={sourceSha:KQK_PROOF_SOURCE_SHA,
    scope:{maxPerFamily,maxCandidates,maxNodes,maxPairs},
    families:Object.fromEntries(CASES.map(c=>[c,{
      roots:0,firstReplies:0,secondReplies:0,
      selectedOriginalFrame:0,selectedOtherFrame:0,
      firstAuthenticated:0,firstUnchecked:0,firstFailedPremise:0,
      followAuthenticated:0,followUnchecked:0,followFailedPremise:0,
      thirdAuthenticated:0,thirdUnchecked:0,thirdFailedPremise:0,
      missingFirst:0,missingFollow:0,missingThird:0,
      captures:0,otherTerminals:0,sourceRules:{},uncheckedBySource:{},
      trees:empty()
    }])),
    firstIssues:{sourceGap:null,failedPremise:null,unchecked:null,
      capture:null,nonmate:null,cycle:null,cap:null},
    examples:[],preparedTokensInvented:false,
    globalKQKMateCertified:false,krkCrossPhaseCertified:false,
    fideHistoryCertified:false};
  const seen=new Set();
  // Genuine selected theorem, stage and reason: a missing local checker
  // must never be misreported as a disproved Lean premise.
  const noteUnchecked=(family,stage,choice,verdict)=>{
    const label=[stage,choice?.sourcePhase??'missing',
      verdict?.reason??'named theorem lacks complete checker'].join(' | ');
    family.uncheckedBySource[label]=(family.uncheckedBySource[label]??0)+1;
  };
  const issue=(kind,w)=>{
    if(!r.firstIssues[kind])r.firstIssues[kind]=w;
  };
  for(const entry of kqk42FreshRoots({maxCandidates})){
    const {root,strong,frame,originalCase,seed}=entry;
    const f=r.families[originalCase];
    if(f.roots>=maxPerFamily)continue;
    const key=positionKey(root.board,root.turn);
    if(seen.has(key))continue;
    seen.add(key);
    f.roots++;
    const choice=kqkSourceChoice(root,strong,null);
    const selected=check(root,strong,choice);
    const witness={root:key,originalCase,originalFrame:frame,
      strong,seed,inputToken:null,
      firstSource:choice?.sourcePhase??null,
      firstFrame:choice?.frame??null,firstMove:id(choice?.move),
      firstToken:choice?.continuationPhase??null,
      firstPremise:selected,defenderReplies:[],tree:null};
    if(choice?.move){
      f.sourceRules[choice.sourcePhase]=(f.sourceRules[choice.sourcePhase]??0)+1;
      if(choice.frame===frame)f.selectedOriginalFrame++;
      else f.selectedOtherFrame++;
      if(selected.status==='authenticated')f.firstAuthenticated++;
      if(selected.status==='unchecked'){
        f.firstUnchecked++;noteUnchecked(f,'first',choice,selected);
        issue('unchecked',witness);
      }
      if(selected.status==='failed-premise'){
        f.firstFailedPremise++;issue('failedPremise',witness);
      }
      const after=mathsPlayMove(root,choice.move);
      const firstTerminal=outcome(after.board,after.turn);
      if(firstTerminal.kind==='ongoing'){
        for(const reply of legalMoves(after.board,opposite(strong))){
          f.firstReplies++;
          const state=mathsPlayMove(after,reply);
          const history=state.log;
          const row={reply:id(reply),at:positionKey(state.board,state.turn),
            moveHistory:history,issuedToken:choice.continuationPhase??null};
          if(reply.capture){
            f.captures++;row.verdict='capture';
            issue('capture',{...witness,...row});
          }else{
            const status=outcome(state.board,state.turn);
            if(status.kind!=='ongoing'){
              row.verdict=status.kind;
              if(noMate(status)){
                f.otherTerminals++;issue('nonmate',{...witness,...row});
              }
            }else{
              const next=kqkSourceChoice(state,strong,
                choice.continuationPhase??null);
              const a=check(state,strong,next,choice.continuationPhase??null);
              row.nextSource=next?.sourcePhase??null;
              row.nextFrame=next?.frame??null;
              row.nextMove=id(next?.move);
              row.nextPremise=a;
              if(!next?.move){
                f.missingFollow++;issue('sourceGap',{...witness,...row});
              }else{
                if(a.status==='authenticated')f.followAuthenticated++;
                else if(a.status==='unchecked'){
                  f.followUnchecked++;noteUnchecked(f,'second',next,a);
                  issue('unchecked',{...witness,...row});
                }else if(a.status==='failed-premise'){
                  f.followFailedPremise++;issue('failedPremise',{...witness,...row});
                }
                const afterNext=mathsPlayMove(state,next.move);
                if(outcome(afterNext.board,afterNext.turn).kind==='ongoing'){
                  for(const weak2 of legalMoves(afterNext.board,opposite(strong))){
                    f.secondReplies++;
                    const state2=mathsPlayMove(afterNext,weak2);
                    const terminal=outcome(state2.board,state2.turn);
                    if(weak2.capture){
                      f.captures++;issue('capture',{...witness,...row,
                        secondReply:id(weak2),moveHistory:state2.log});
                    }else if(noMate(terminal)){
                      f.otherTerminals++;issue('nonmate',{...witness,...row,
                        secondReply:id(weak2),moveHistory:state2.log,
                        terminal:terminal.kind});
                    }else if(terminal.kind==='ongoing'){
                      const third=kqkSourceChoice(state2,strong,
                        next.continuationPhase??null);
                      if(!third?.move){
                        f.missingThird++;issue('sourceGap',{...witness,...row,
                          secondReply:id(weak2),moveHistory:state2.log,
                          thirdToken:next.continuationPhase??null});
                      }else{
                        const a3=check(state2,strong,third,
                          next.continuationPhase??null);
                        if(a3.status==='authenticated')f.thirdAuthenticated++;
                        else if(a3.status==='unchecked'){
                          f.thirdUnchecked++;noteUnchecked(f,'third',third,a3);
                          issue('unchecked',{...witness,...row,
                            secondReply:id(weak2),moveHistory:state2.log,
                            thirdToken:next.continuationPhase??null,
                            thirdSource:third.sourcePhase,thirdPremise:a3});
                        }else if(a3.status==='failed-premise'){
                          f.thirdFailedPremise++;issue('failedPremise',
                            {...witness,...row,secondReply:id(weak2),
                              moveHistory:state2.log,
                              thirdToken:next.continuationPhase??null,
                              thirdSource:third.sourcePhase,thirdPremise:a3});
                        }
                        if(full){
                          row.secondReplies??=[];
                          row.secondReplies.push({reply:id(weak2),
                            history:state2.log,thirdSource:third.sourcePhase,
                            thirdMove:id(third.move),
                            thirdToken:next.continuationPhase??null,
                            premise:a3});
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          if(full)witness.defenderReplies.push(row);
        }
      }else if(noMate(firstTerminal)){
        f.otherTerminals++;issue('nonmate',{...witness,
          terminal:firstTerminal.kind});
      }
    }else{
      f.missingFirst++;issue('sourceGap',witness);
    }
    const tree=probeS036Tree('kqk',root,strong,null,{maxNodes,maxPairs});
    const category=classify(tree);
    f.trees[category]++;
    if(tree.firstIssues?.unsupported)issue('sourceGap',
      {...witness,treeIssue:tree.firstIssues.unsupported});
    if(tree.firstIssues?.capture)issue('capture',
      {...witness,treeIssue:tree.firstIssues.capture});
    if(tree.firstIssues?.nonmate)issue('nonmate',
      {...witness,treeIssue:tree.firstIssues.nonmate});
    if(tree.firstIssues?.cycle)issue('cycle',
      {...witness,treeIssue:tree.firstIssues.cycle});
    if(tree.firstIssues?.cap)issue('cap',
      {...witness,treeIssue:tree.firstIssues.cap});
    witness.tree={verdict:tree.verdict,nodes:tree.nodes,
      mates:tree.mates,firstIssues:tree.firstIssues};
    if(full||r.examples.length<maxExamples)r.examples.push(witness);
    if(CASES.every(c=>r.families[c].roots>=maxPerFamily))break;
  }
  for(const c of CASES){
    const f=r.families[c];
    if(Object.values(f.trees).reduce((a,b)=>a+b,0)!==f.roots)
      throw Error('S042 incomplete first-root tree accounting');
  }
  return r;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const opt=(name,d)=>{
    const raw=process.argv.find(x=>x.startsWith('--'+name+'='));
    return raw?Number(raw.slice(name.length+3)):d;
  };
  const r=auditS042FreshFamilies({
    maxPerFamily:opt('per-family',4),
    maxCandidates:opt('candidates',4000),
    maxNodes:opt('nodes',100),maxPairs:opt('pairs',20),
    maxExamples:opt('examples',6),full:process.argv.includes('--full')});
  console.log(JSON.stringify(r,null,2));
  if(process.argv.includes('--strict')&&
     (CASES.some(c=>r.families[c].roots===0)||
      Object.values(r.families).some(f=>f.firstFailedPremise>0||
        f.followFailedPremise>0||f.thirdFailedPremise>0)))
    process.exitCode=1;
}
