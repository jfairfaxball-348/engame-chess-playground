/**
 * S033 — authenticate original-frame FarFileEntry and any independent
 * cross-frame theorem application on ACTUAL FarFilePreparation tokens.
 *
 * Diagnostic-only: never chooses moves for Maths, never equates a legal
 * move to a proved action. The theorem predicates are literal translations
 * of frozen EC-T0050 @ c72365a8... (FarFileEntry, SameRankEntry,
 * ClearLowWallEntry). This samples genuine source tokens, NOT all roots.
 */
import {pathToFileURL} from 'node:url';
import {applyMove,coords,inCheck,legalMoves,makeBoard,newGame,opposite,
  positionKey,squareAt,validateSetup} from '../src/chess.js';
import {kqkSourceChoice,KQK_PROOF_SOURCE_SHA} from '../src/kqk-source-policy.js';
import {mathsPlayMove} from '../src/maths-play-policy.js';
import {KQK32_FRAMES,kqk32CaseFromState,kqk32FixtureRoots}
  from './kqk32-far-file-audit.mjs';

const RULE='KQK.SameRankEntry.backrank_entry.clear_low_wall';
const THEOREM='KQK.SameRankEntry.backrank_entry / KQK.ClearLowWallEntry.clear_low_wall_entry';

/**
 * Backrank's first case at SameRankEntry.lean:
 *   sk.rank=qs.rank=0, 2<=wk.rank, 2<=absDiff qs.file wk.file,
 *   weak not in check, KQK, strong to move.
 * Its chosen Q(qs.file,1) is supplied by clear_low_wall_entry:
 *   gap>=2, king rank<=4, queen file != king file OR queen above,
 *   files>=2. Never waive these assumptions just because a move is legal.
 * Reframe through the pinned QueenSym map; check target IN THAT frame.
 */
export function authenticateKQK33Backrank(state,strong,choice){
  const fail=(reason)=>({authenticated:false,reason,theorem:THEOREM});
  if(!state||state.material!=='kqk'||state.turn!==strong)
    return fail('not a strong-turn KQK source state');
  if(choice?.sourcePhase!==RULE||!Object.hasOwn(KQK32_FRAMES,choice.frame))
    return fail('not a supported independently framed source theorem');
  const weak=opposite(strong),board=state.board;
  const sk=board.indexOf(strong+'K'),queen=board.indexOf(strong+'Q'),
    wk=board.indexOf(weak+'K');
  if(sk<0||queen<0||wk<0||inCheck(board,weak))
    return fail('not a legal non-checking KQK theorem input');
  const transform=KQK32_FRAMES[choice.frame];
  const [kx,ky]=transform(coords(sk)),[qx,qy]=transform(coords(queen)),
    [wx,wy]=transform(coords(wk));
  if(ky!==0||qy!==0||wy<2||Math.abs(qx-wx)<2)
    return fail('SameRankEntry.backrank_entry clear-case hypotheses fail');
  if(!(ky+2<=wy&&ky<=4&&(qx!==kx||ky<qy)&&Math.abs(qx-wx)>=2))
    return fail('ClearLowWallEntry.clear_low_wall_entry premises fail');
  const from=choice.move?.from,to=choice.move?.to;
  if(from!==queen||to===undefined)
    return fail('chosen action does not move the frozen queen');
  const [tx,ty]=transform(coords(to));
  if(tx!==qx||ty!==1)
    return fail('chosen square is not frozen Q(queen.file,1) in theorem frame');
  if(!legalMoves(board,strong).some(m=>m.from===from&&m.to===to))
    return fail('frozen chosen action is not legal');
  const post=applyMove(board,choice.move);
  if(legalMoves(post,weak).length===0)
    return fail('no required weak reply after frozen strong action');
  if(legalMoves(post,weak).some(m=>m.capture===strong+'Q'))
    return fail('frozen action exposes a queen capture');
  return {authenticated:true,theorem:THEOREM,frame:choice.frame,
    premises:{sameBackrank:true,weakAtLeastTwo:true,queenFileGapAtLeastTwo:true,
      clearLowWall:true,weakNotInCheck:true,queenSafe:true}};
}

/** Distinct from a synthetic position: start with real source-produced
 * token, replay every legal defender response, then inspect EXACT source
 * chosen by the current policy. A different theorem must stand on its OWN
 * verified premises; the original theorem is not its justification.
 */
export function auditKQK33SourceCorrespondence(){
  const cases={},byTheorem={},witnesses=[];
  let sourceRoots=0,replies=0,missing=0,crossFrame=0,
    independentAuthenticated=0,independentUnverified=0,sameFrame=0;
  for(const {strong,frame,root} of kqk32FixtureRoots()){
    const first=kqkSourceChoice(root,strong);
    if(first?.continuationPhase?.kind!=='far-file'||
       !first.sourcePhase?.includes('FarFilePreparation.far_file_preparation'))
      continue;
    sourceRoots++;
    const token=first.continuationPhase,after=mathsPlayMove(root,first.move);
    for(const reply of legalMoves(after.board,opposite(strong))){
      replies++;
      const state=mathsPlayMove(after,reply);
      const branch=kqk32CaseFromState(state,strong,token.frame);
      cases[String(branch)]=(cases[String(branch)]??0)+1;
      const choice=kqkSourceChoice(state,strong,token);
      if(!choice?.move)missing++;
      const switched=Boolean(choice?.move&&choice.frame!==token.frame);
      if(switched)crossFrame++;else if(choice?.move)sameFrame++;
      const checked=switched?
        authenticateKQK33Backrank(state,strong,choice):null;
      if(switched){
        if(checked.authenticated)independentAuthenticated++;
        else independentUnverified++;
        byTheorem[choice.sourcePhase??'missing']=
          (byTheorem[choice.sourcePhase??'missing']??0)+1;
      }
      if(!choice?.move||switched&&!checked?.authenticated||
         branch==='unaccounted-for'||branch===null)
        witnesses.push({strong,fixtureFrame:frame,originalFrame:token.frame,
          case:branch,at:positionKey(state.board,state.turn),
          weakMove:[reply.from,reply.to],source:choice?.sourcePhase??null,
          chosenFrame:choice?.frame??null,checked});
    }
  }
  return {sourceSha:KQK_PROOF_SOURCE_SHA,sourceRoots,replies,cases,
    missing,crossFrame,sameFrame,independentAuthenticated,
    independentUnverified,byTheorem,
    firstUnresolved:witnesses.slice(0,12),
    fourCasesReachedByGenuinePreparation:false,
    universalStrategyCertified:false,
    note:'Proof-premise authentication applies only to observed cross-frame backrank source actions, not the original-frame global all-defender strategy.'};
}

/** Static already-far-file theorem case roots. They are source-domain
 * fixtures only: they are NOT falsely minted FarFilePreparation tokens.
 * The selected root action is observed, with no claim of full continuation.
 */
export function auditKQK33AlreadyFarCases(){
  const examples=[
    {case:'separating-rank',k:[1,0],q:[0,2],w:[5,5]},
    {case:'direct-small-file',k:[1,0],q:[0,4],w:[5,3]},
    {case:'horizontal-far-wall',k:[1,1],q:[0,5],w:[4,2]},
    {case:'tight-above',k:[1,1],q:[0,3],w:[4,2]}
  ];
  const result={};
  for(const sample of examples){
    const record={legal:0,sourceMoves:0,missing:0,selectedRules:{}};
    for(const strong of ['w','b'])
      for(const [frame,transform] of Object.entries(KQK32_FRAMES)){
        const board=makeBoard(),weak=opposite(strong);
        const put=(pos,piece)=>{board[squareAt(...transform(pos))]=piece;};
        put(sample.k,strong+'K');put(sample.q,strong+'Q');put(sample.w,weak+'K');
        const problem=validateSetup(board,'kqk',strong);
        if(problem)throw Error('invalid static original-frame witness: '+problem);
        const state=newGame(board,strong,'kqk',{experimentalKQK:true});
        // A fixture transformed by frame F is read through F^-1.
        const inverse=frame==='rotate90'?'rotate270':
          frame==='rotate270'?'rotate90':frame;
        const branch=kqk32CaseFromState(state,strong,inverse);
        if(branch!==sample.case)throw Error('case transform lost original frame');
        record.legal++;
        const choice=kqkSourceChoice(state,strong);
        if(choice?.move){
          record.sourceMoves++;
          const rule=choice.sourcePhase??'untagged';
          record.selectedRules[rule]=(record.selectedRules[rule]??0)+1;
        }else record.missing++;
      }
    result[sample.case]=record;
  }
  return {cases:result,sourceSha:KQK_PROOF_SOURCE_SHA,
    authenticPreparatoryTokens:false,allDefenderClosure:false};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)
  console.log(JSON.stringify({realTokens:auditKQK33SourceCorrespondence(),
    alreadyFarCases:auditKQK33AlreadyFarCases()},null,2));
