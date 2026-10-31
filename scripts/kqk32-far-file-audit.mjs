/**
 * S032 — diagnostic-only audit of the four ordered branches of frozen
 * KQK.FarFileEntry.far_file_stage_bound (EC-T0050 @ c72365a8).
 *
 * The case predicate is checked in the ORIGINAL FarFilePreparation token
 * frame. The live selector is observed, never replaced by this audit.
 * An action sourced in another symmetry frame is reported as an unverified
 * proof-application obligation, NOT silently credited to this case.
 */
import {pathToFileURL} from 'node:url';
import {coords,legalMoves,makeBoard,newGame,opposite,outcome,
  squareAt,validateSetup} from '../src/chess.js';
import {kqkSourceChoice} from '../src/kqk-source-policy.js';
import {mathsPlayMove} from '../src/maths-play-policy.js';

export const KQK32_FRAMES=Object.freeze({
  id:([x,y])=>[x,y],
  reflectX:([x,y])=>[7-x,y],
  reflectY:([x,y])=>[x,7-y],
  rotate180:([x,y])=>[7-x,7-y],
  swap:([x,y])=>[y,x],
  anti:([x,y])=>[7-y,7-x],
  rotate90:([x,y])=>[7-y,x],
  rotate270:([x,y])=>[y,7-x]
});

/** Exact ordered Lean case split, not a chess move selector.
 * Null means the frozen theorem's premises are not met.
 */
export function kqk32FarFileCase(king,queen,weak){
  const [kx,ky]=king,[qx,qy]=queen,[wx,wy]=weak;
  if(qx>1||wx<3||wy<ky+1||
     Math.max(Math.abs(kx-wx),Math.abs(ky-wy))<2||
     qy===ky||qy===wy)return null;
  if(ky<qy&&qy<wy)return 'separating-rank';
  if(ky+2<=wy&&(qx!==kx||ky<qy))return 'direct-small-file';
  if(Math.abs(kx-wx)>=2&&Math.abs(qy-wy)>=2)
    return 'horizontal-far-wall';
  if(Math.abs(kx-wx)>=2&&qy===ky+2&&wy===ky+1)
    return 'tight-above';
  // The source proof derives horizontal separation and the tight
  // equalities from the preceding negated cases. Reaching here under
  // purported premises would be a classification/translation error.
  return 'unaccounted-for';
}

export function kqk32CaseFromState(state,strong,frame){
  const f=KQK32_FRAMES[frame];
  if(!f)return null;
  const k=state.board.indexOf(strong+'K'),
    q=state.board.indexOf(strong+'Q'),
    w=state.board.indexOf(opposite(strong)+'K');
  if(k<0||q<0||w<0)return null;
  return kqk32FarFileCase(f(coords(k)),f(coords(q)),f(coords(w)));
}

/** Replay ONE actual FarFilePreparation move and EVERY immediate legal
 * defender reply, preserving its authenticated original source token.
 * No fake token, fixed response or search-selected strong move.
 */
export function kqk32AuditPreparedRoot(root,strong){
  const first=kqkSourceChoice(root,strong);
  if(!first?.move||
      !first.sourcePhase?.includes('FarFilePreparation.far_file_preparation')||
      first.continuationPhase?.kind!=='far-file')
    return {eligible:false,firstSource:first?.sourcePhase??null};
  const token=first.continuationPhase;
  const after=mathsPlayMove(root,first.move);
  const weak=opposite(strong);
  const entries=[];
  for(const reply of legalMoves(after.board,weak)){
    const state=mathsPlayMove(after,reply);
    const sourceCase=kqk32CaseFromState(state,strong,token.frame);
    const chosen=kqkSourceChoice(state,strong,token);
    entries.push({
      case:sourceCase,
      priorToken:token,
      firstSource:first.sourcePhase,
      firstMove:[first.move.from,first.move.to],
      weakMove:[reply.from,reply.to],
      position:[state.board.indexOf(strong+'K'),
        state.board.indexOf(strong+'Q'),
        state.board.indexOf(weak+'K')],
      chosenSource:chosen?.sourcePhase??null,
      chosenFrame:chosen?.frame??null,
      chosenMove:chosen?.move?[chosen.move.from,chosen.move.to]:null,
      // A different framed theorem may be applicable, but that
      // independent justification has not been checked here.
      independentFrameObligation:chosen?.move!==undefined&&
        chosen.frame!==token.frame,
      missingSource:!chosen?.move
    });
  }
  return {eligible:true,originalFrame:token.frame,entries};
}

/** Source-trigger fixture from S025, with one genuine weak-to-move
 * predecessor. Transform both colours and all eight board frames.
 */
export function kqk32FixtureRoots(){
  const fixtures=[];
  for(const strong of ['w','b'])
    for(const [frame,transform] of Object.entries(KQK32_FRAMES)){
      const at=([x,y])=>squareAt(...transform([x,y]));
      const b=makeBoard(),weak=opposite(strong);
      b[at([0,4])]=strong+'K';
      b[at([6,6])]=strong+'Q';
      b[at([4,1])]=weak+'K';
      if(validateSetup(b,'kqk',weak)!==null)
        throw Error('invalid S025 source fixture');
      const weakRoot=newGame(b,weak,'kqk',{experimentalKQK:true});
      const move=legalMoves(weakRoot.board,weak).find(m=>
        m.from===at([4,1])&&m.to===at([4,2]));
      if(!move)throw Error('missing legal predecessor weak move');
      fixtures.push({strong,frame,root:mathsPlayMove(weakRoot,move)});
    }
  return fixtures;
}

export function auditKQK32FarFile(){
  const rows=[],counts={},unverified=[];
  let eligible=0,replyCount=0,missing=0,crossFrame=0;
  for(const {strong,frame,root} of kqk32FixtureRoots()){
    const a=kqk32AuditPreparedRoot(root,strong);
    if(!a.eligible)continue;
    eligible++;
    for(const entry of a.entries){
      replyCount++;
      counts[entry.case]=(counts[entry.case]||0)+1;
      if(entry.missingSource)missing++;
      if(entry.independentFrameObligation)crossFrame++;
      if(entry.missingSource||entry.independentFrameObligation||
          entry.case===null||entry.case==='unaccounted-for')
        unverified.push({strong,frame,...entry});
    }
    rows.push({strong,frame,originalFrame:a.originalFrame,
      cases:a.entries.map(x=>x.case)});
  }
  return {sourceSha:'c72365a8ba46f59114a2a77d9d38993f6a52df80',
    eligible,replyCount,counts,missing,crossFrame,
    unverified:unverified.slice(0,20),rows,
    fourCaseGlobalCorrespondenceCertified:false,
    fullKQKStrategyCertified:false,
    note:'Case counts are from genuine S025 FarFilePreparation roots only; other branches require separate real reachability witnesses.'};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)
  console.log(JSON.stringify(auditKQK32FarFile(),null,2));
