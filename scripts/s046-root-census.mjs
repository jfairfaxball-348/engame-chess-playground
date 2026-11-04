/**
 * S046: legal KQK ROOT census for both colours and both sides to move.
 *
 * Diagnostic only. Source action is always selected by kqkSourceChoice,
 * with null at a fresh root and only the genuine token after its own move.
 * Every weak move, including an immediate queen capture, is accounted for.
 *
 * A --full --shard=N/M scan exhausts ALL 64^3 square assignments in its
 * shard, not just two special KQK source families. Combine M equal shards
 * for an exhaustive finite ROOT census. This cannot prove termination of
 * the infinite-depth source controller, nor authenticate unknown premises.
 */
import {pathToFileURL} from 'node:url';
import {coords,legalMoves,makeBoard,newGame,opposite,outcome,
  positionKey,squareAt,validateSetup} from '../src/chess.js';
import {kqkSourceChoice,KQK_PROOF_SOURCE_SHA}
  from '../src/kqk-source-policy.js';
import {mathsPlayMove} from '../src/maths-play-policy.js';
import {KQK32_FRAMES,kqk32CaseFromState}
  from './kqk32-far-file-audit.mjs';
import {authenticateS042SelectedAction}
  from './s042-fresh-families.mjs';

const TOTAL=64*64*64;
const FRAMES=Object.keys(KQK32_FRAMES);
const uci=m=>m?m.from+'-'+m.to:null;
const positive=(n,name,max=TOTAL)=>{
  if(!Number.isSafeInteger(n)||n<1||n>max)
    throw RangeError(name+' must be an integer 1..'+max);
};
function orbitSignature(k,q,w){
  let canonical=Infinity;
  const xyz=[k,q,w].map(coords);
  for(const frame of FRAMES){
    const points=xyz.map(v=>squareAt(...KQK32_FRAMES[frame](v)));
    canonical=Math.min(canonical,points[0]*4096+points[1]*64+points[2]);
  }
  return canonical;
}
function record(obj,key){obj[String(key)]=(obj[String(key)]??0)+1;}
function group(){
  return {candidateAssignments:0,legalRoots:0,distinctObservedD4Orbits:0,
    terminal:{mate:0,stalemate:0,other:0},ongoing:0,
    sourceSelected:0,missingFirstSource:0,illegalSourceMove:0,
    localPremises:{authenticated:0,unchecked:0,'failed-premise':0,missing:0},
    selectedRules:{},selectedFrames:{},farFileOriginalFrameCases:{},
    directWeakQueenCaptures:0,weakReplies:0,weakNonCaptureReplies:0,
    followingSourceSelected:0,followingSourceMissing:0,
    followingIllegalSourceMove:0,followingPremises:{
      authenticated:0,unchecked:0,'failed-premise':0,missing:0},
    afterFirstStrongWeakReplies:0,afterFirstStrongCaptures:0,
    afterFirstStrongSourceSelected:0,afterFirstStrongSourceMissing:0,
    terminalAfterStrong:{mate:0,stalemate:0,other:0},
    terminalAfterReply:{mate:0,stalemate:0,other:0}};
}
function outcomeKind(o,counts){
  if(o.kind==='mate')counts.mate++;
  else if(o.kind==='stalemate')counts.stalemate++;
  else counts.other++;
}
function inspectChoice(state,strong,token,choice,r,kind,issue){
  if(!choice?.move){
    if(kind==='first')r.missingFirstSource++;
    else if(kind==='follow')r.followingSourceMissing++;
    else r.afterFirstStrongSourceMissing++;
    issue('missing-source',{at:positionKey(state.board,state.turn),
      strong,source:choice?.sourcePhase??null,token});
    return false;
  }
  const legal=legalMoves(state.board,strong)
    .some(m=>m.from===choice.move.from&&m.to===choice.move.to);
  if(!legal){
    if(kind==='first')r.illegalSourceMove++;
    else r.followingIllegalSourceMove++;
    issue('illegal-source',{at:positionKey(state.board,state.turn),
      strong,source:choice.sourcePhase,move:uci(choice.move),token});
    return false;
  }
  const checked=authenticateS042SelectedAction(state,strong,choice,token);
  const destination=kind==='first'?r.localPremises:r.followingPremises;
  record(destination,checked.status);
  if(checked.status==='failed-premise')
    issue('failed-premise',{at:positionKey(state.board,state.turn),
      source:choice.sourcePhase,reason:checked.reason,token});
  if(checked.status==='unchecked')
    issue('unchecked-premise',{at:positionKey(state.board,state.turn),
      source:choice.sourcePhase,reason:checked.reason,token});
  if(kind==='first'){
    r.sourceSelected++;record(r.selectedRules,choice.sourcePhase??'unnamed');
    record(r.selectedFrames,choice.frame??'token-only');
  }else if(kind==='follow')r.followingSourceSelected++;
  else r.afterFirstStrongSourceSelected++;
  return true;
}
/** Each checked group covers distinct (king, queen, weak king) squares.
 * Full mode examines every one of the TOTAL combinations in a shard.
 * Partial mode walks a fixed full-cycle permutation, not lexicographic a1
 * clusters. Both colours and both sides have separate independent counts.
 */
export function auditS046KQKRoots({
  maxLegalPerGroup=32,full=false,shardIndex=0,shardCount=1,
  maxExamples=12,inspectReplies=true
}={}){
  positive(maxLegalPerGroup,'maxLegalPerGroup');
  positive(maxExamples,'maxExamples',100);
  positive(shardCount,'shardCount',256);
  if(!Number.isSafeInteger(shardIndex)||shardIndex<0||
      shardIndex>=shardCount)throw RangeError('shard index');
  const report={sourceSha:KQK_PROOF_SOURCE_SHA,
    scope:{full,shardIndex,shardCount,maxLegalPerGroup,inspectReplies,
      squareAssignmentsPerMaterialSide:TOTAL},
    groups:{},firstIssues:{},examples:[],
    allRootBoardsEnumerated:full&&shardCount===1,
    sourceIssuedTokensOnly:true,allDefenderTerminationCertified:false,
    universalKQKMatingCertified:false,fideHistoryCertified:false};
  const issue=(name,data)=>{
    if(!report.firstIssues[name])report.firstIssues[name]=data;
    if(report.examples.length<maxExamples)
      report.examples.push({kind:name,...data});
  };
  for(const strong of ['w','b'])for(const turn of [strong,opposite(strong)]){
    const key=strong+'-strong,'+turn+'-turn';
    const r=group(),seenOrbits=new Set();
    report.groups[key]=r;
    let i=0;
    for(;i<TOTAL;i++){
      if(i%shardCount!==shardIndex)continue;
      // 16807 is odd, hence a permutation modulo 2^18.
      // Full scans also use it; early stopping is spatially spread out.
      const idx=(Math.imul(i,16807)+0x93b1)&(TOTAL-1);
      const k=Math.floor(idx/4096),q=(idx>>>6)&63,w=idx&63;
      r.candidateAssignments++;
      if(k===q||k===w||q===w)continue;
      const board=makeBoard(),weak=opposite(strong);
      board[k]=strong+'K';board[q]=strong+'Q';board[w]=weak+'K';
      if(validateSetup(board,'kqk',turn)!==null)continue;
      r.legalRoots++;
      const orbit=orbitSignature(k,q,w);
      if(!seenOrbits.has(orbit)){
        seenOrbits.add(orbit);r.distinctObservedD4Orbits++;
      }
      const root=newGame(board,turn,'kqk',{experimentalKQK:true});
      const status=outcome(root.board,root.turn,root.history,root.halfmove);
      if(status.kind!=='ongoing'){
        outcomeKind(status,r.terminal);
        if(status.kind==='stalemate')
          issue('legal-terminal-stalemate',{root:positionKey(board,turn),
            strong,turn});
      }else{
        r.ongoing++;
        let hasFarFile=false;
        for(const frame of FRAMES){
          const c=kqk32CaseFromState(root,strong,frame);
          if(c!==null){
            hasFarFile=true;
            record(r.farFileOriginalFrameCases,c);
          }
        }
        if(!hasFarFile)record(r.farFileOriginalFrameCases,'no-far-file-premise');
        if(turn===strong){
          const first=kqkSourceChoice(root,strong,null);
          if(inspectChoice(root,strong,null,first,r,'first',issue)&&inspectReplies){
            const after=mathsPlayMove(root,first.move);
            const status2=outcome(after.board,after.turn,
              after.history,after.halfmove);
            if(status2.kind!=='ongoing')
              outcomeKind(status2,r.terminalAfterStrong);
            else for(const reply of legalMoves(after.board,weak)){
              r.afterFirstStrongWeakReplies++;
              const child=mathsPlayMove(after,reply);
              if(child.material==='kk'){
                r.afterFirstStrongCaptures++;
                issue('queen-captured-after-source',{
                  root:positionKey(board,turn),move:uci(first.move),
                  weakMove:uci(reply),source:first.sourcePhase,
                  token:first.continuationPhase??null});
                continue;
              }
              const result=outcome(child.board,child.turn,
                child.history,child.halfmove);
              if(result.kind!=='ongoing'){
                outcomeKind(result,r.terminalAfterReply);
                continue;
              }
              const token=first.continuationPhase??null;
              const next=kqkSourceChoice(child,strong,token);
              inspectChoice(child,strong,token,next,r,'afterStrong',issue);
            }
          }
        }else if(inspectReplies){
          for(const reply of legalMoves(root.board,weak)){
            r.weakReplies++;
            const child=mathsPlayMove(root,reply);
            if(child.material==='kk'){
              r.directWeakQueenCaptures++;
              issue('legal-weak-root-queen-capture',{
                root:positionKey(board,turn),strong,turn,
                queenSquare:q,weakSquare:w,capture:uci(reply),
                terminalMaterial:'kk'});
              continue;
            }
            r.weakNonCaptureReplies++;
            const result=outcome(child.board,child.turn,
              child.history,child.halfmove);
            if(result.kind!=='ongoing'){
              outcomeKind(result,r.terminalAfterReply);
              continue;
            }
            // Fresh source choice after ONE ACTUAL legal weak root move.
            const next=kqkSourceChoice(child,strong,null);
            inspectChoice(child,strong,null,next,r,'follow',issue);
          }
        }
      }
      if(!full&&r.legalRoots>=maxLegalPerGroup)break;
    }
    r.exhaustedShard=full||i===TOTAL;
    r.sampledLegalRootsOnly=!r.exhaustedShard;
  }
  return report;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const num=(name,otherwise)=>{
    const arg=process.argv.find(a=>a.startsWith('--'+name+'='));
    return arg?Number(arg.slice(name.length+3)):otherwise;
  };
  const shard=(process.argv.find(s=>s.startsWith('--shard='))??'--shard=0/1')
    .slice('--shard='.length).split('/').map(Number);
  if(shard.length!==2||shard.some(n=>!Number.isSafeInteger(n)))
    throw Error('--shard=N/M required');
  const r=auditS046KQKRoots({
    maxLegalPerGroup:num('per-group',32),maxExamples:num('examples',12),
    full:process.argv.includes('--full'),shardIndex:shard[0],
    shardCount:shard[1],inspectReplies:!process.argv.includes('--no-replies')
  });
  console.log(JSON.stringify(r,null,2));
  if(process.argv.includes('--strict')){
    if(Object.values(r.groups).some(g=>g.legalRoots===0||
      g.illegalSourceMove>0||g.followingIllegalSourceMove>0||
      g.localPremises['failed-premise']>0||
      g.followingPremises['failed-premise']>0))
      process.exitCode=1;
    if(r.sourceIssuedTokensOnly!==true||
       r.universalKQKMatingCertified!==false||
       r.allDefenderTerminationCertified!==false)
      process.exitCode=1;
  }
}
