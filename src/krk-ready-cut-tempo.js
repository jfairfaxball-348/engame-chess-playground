/**
 * KRK02: the *narrow lower-band rook-tempo step only*, translated from the
 * non-frozen KRKExecutable.ReadyCutTempo.lowerBandTempo_sound proof.
 *
 * This is NOT a KRK game policy. The next upper-exit/alignment/pivot phases
 * have not been extracted or linked; no overall mate bound is provided.
 * Never call this from chooseDecision or treat it as a fallback move oracle.
 */
import {applyMove,coords,findKing,legalMoves,opposite} from './chess.js';
import {KRK_PARENT_SHA,krkLocalWitness,krkTransformSquare} from './krk-local-witness.js';
import {krkPrepState} from './krk-prep-controller.js';

const diff=(a,b)=>Math.abs(a-b);

function geometry(state,frame){
  const prep=krkPrepState(state,frame);
  if(!prep||prep.rank!==0)return null;
  const b=state.board,strong=state.turn,weak=opposite(strong);
  const king=findKing(b,strong),rook=b.indexOf(strong+'R'),other=findKing(b,weak);
  if(king<0||rook<0||other<0)return null;
  const [sx,sy]=coords(krkTransformSquare(king,frame));
  const [rx,ry]=coords(krkTransformSquare(rook,frame));
  const [wx,wy]=coords(krkTransformSquare(other,frame));
  if(sy+1!==ry||wy!==ry+1||!(sx===3||sx===4)||
     diff(rx,wx)<2||diff(sx,wx)!==1)return null;
  return {prep,strong,weak,sx,sy,rx,ry,wx,wy};
}

export const KRK_READY_TEMPO_LEMMA =
  'EndgameChess.Rules.KRKExecutable.lowerBandTempo_sound';

export function krkReadyCutTempoChoice(state,frame='id'){
  const g=geometry(state,frame);
  if(!g)return null;
  const w=krkLocalWitness(state,'wall',frame);
  if(!w)return null;
  return Object.freeze({
    kind:'step',phase:'READY narrow lower band → protected rook tempo',
    frame,rule:KRK_READY_TEMPO_LEMMA,move:w.move,witness:w,
    premises:'READY; lone king exactly one rank above rook; king file gap 1; rook file margin >=2',
    continuation:'Every legal reply enters upper exit, king alignment or wide protected pivot.',
    parent:KRK_PARENT_SHA,isCompleteWinningPolicy:false,maxMatePlies:null,
    inputHalfmove:state.halfmove,inputHistoryLength:state.history.length
  });
}

/** Diagnostics cover ALL actual weak replies, without choosing any game move. */
export function auditKRKReadyCutTempo(state,frame='id'){
  const g=geometry(state,frame),choice=krkReadyCutTempoChoice(state,frame);
  if(!g||!choice)return {ok:false,replies:0};
  const after=applyMove(state.board,choice.move);
  const replies=legalMoves(after,g.weak);
  if(replies.length===0)return {ok:false,replies:0};
  const phases={upperExit:0,alignedExit:0,widePivot:0};
  const [newRx,newRy]=coords(krkTransformSquare(choice.move.to,frame));
  for(const reply of replies){
    if(reply.capture||reply.piece!==g.weak+'K')
      return {ok:false,replies:replies.length,failedReply:reply};
    const next=applyMove(after,reply);
    const [skx,sky]=coords(krkTransformSquare(findKing(next,g.strong),frame));
    const [wkx,wky]=coords(krkTransformSquare(findKing(next,g.weak),frame));
    if(skx!==g.sx||sky!==g.sy||newRy!==g.ry||
       !(newRy<wky)||diff(newRx,wkx)<2)
      return {ok:false,replies:replies.length,failedReply:reply};
    if(wky>=newRy+2)phases.upperExit++;
    else if(skx===wkx)phases.alignedExit++;
    else if(diff(skx,wkx)>=2)phases.widePivot++;
    else return {ok:false,replies:replies.length,failedReply:reply};
  }
  return {ok:true,replies:replies.length,phases,
    isCompleteWinningPolicy:false,maxMatePlies:null};
}
