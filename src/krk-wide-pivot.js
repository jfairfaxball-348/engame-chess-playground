/**
 * KRK02 constructive RIGHT wide READY pivot. This ports ONLY the right
 * subcase of the new KRKExecutable.WidePivot.pivotRightCut_sound.
 * A rook already on the guarded cut is a handoff, not a no-op. The existing
 * theorem's left subcase is obtained by symX; until an exact local selector
 * and trace are extracted for it, we fail closed rather than guessing.
 *
 * Not a total KRK policy; no gameplay import, search, tables or fallback.
 */
import {
  applyMove,coords,findKing,legalMoves,opposite,outcome,squareAt
} from './chess.js';
import {
  KRK_PARENT_SHA,krkTransformSquare
} from './krk-local-witness.js';
import {krkPrepState} from './krk-prep-controller.js';

export const KRK_WIDE_PIVOT_LEMMA =
  'EndgameChess.Rules.KRKExecutable.pivotRightCut_sound';
export const KRK_GUARDED_HANDOFF =
  'KRKCentral.Guarded.guarded_bound (existence only; executable continuation pending)';

export function krkWidePivotChoice(state,frame='id'){
  const info=krkPrepState(state,frame);
  if(!info||info.prepDistance!==0)return null;
  const strong=state.turn,weak=opposite(strong);
  const sk=findKing(state.board,strong),rook=state.board.indexOf(strong+'R'),
    wk=findKing(state.board,weak);
  if(sk<0||rook<0||wk<0)return null;
  const [sx,sy]=coords(krkTransformSquare(sk,frame));
  const [rx,ry]=coords(krkTransformSquare(rook,frame));
  const [wx,wy]=coords(krkTransformSquare(wk,frame));
  // The right-oriented wide proof requires central height, not a rook-file\n  // margin: a rook already on the guarded file remains a valid handoff.
  if(sy+1!==ry||wy!==ry+1||!(sx===3||sx===4)||wx<sx+2)return null;
  const target=krkTransformSquare(squareAt(sx+1,ry),frame);
  const original={phase:'READY wide right protected pivot',frame,
    parent:KRK_PARENT_SHA,rule:KRK_WIDE_PIVOT_LEMMA,
    isCompleteWinningPolicy:false,maxMatePlies:null,
    inputHalfmove:state.halfmove,inputHistoryLength:state.history.length,
    premises:'K one rank below rook, weak king one above rook; K file central; weak file >= K file+2'};
  if(rook===target){
    return Object.freeze({...original,kind:'handoff',
      reason:'Protected vertical cut already exists: guarded phase must execute next',
      continuation:KRK_GUARDED_HANDOFF});
  }
  const move=legalMoves(state.board,strong).find(m=>m.from===rook&&m.to===target);
  if(!move)return null;
  return Object.freeze({...original,kind:'step',move,
    continuation:'Every weak reply leaves its king above the rook and to the right of its protected rook file.'});
}

/** Local all-actual-reply check of the right-oriented protected cut. */
export function auditKRKWidePivot(state,frame='id'){
  const choice=krkWidePivotChoice(state,frame);
  if(!choice)return {ok:false,replies:0};
  if(choice.kind==='handoff')return {ok:true,handoff:true,replies:0};
  const strong=state.turn,weak=opposite(strong);
  const b=applyMove(state.board,choice.move),replies=legalMoves(b,weak);
  if(!replies.length)return {ok:false,replies:0};
  const [rx,ry]=coords(krkTransformSquare(choice.move.to,frame));
  for(const reply of replies){
    if(reply.capture||reply.piece!==weak+'K')
      return {ok:false,replies:replies.length,failedReply:reply};
    const after=applyMove(b,reply);
    const sk=findKing(after,strong),wk=findKing(after,weak);
    if(sk<0||wk<0)return {ok:false,replies:replies.length,failedReply:reply};
    const [sx,sy]=coords(krkTransformSquare(sk,frame));
    const [wx,wy]=coords(krkTransformSquare(wk,frame));
    if(sx+1!==rx||sy+1!==ry||wx<=rx||wy<=ry)
      return {ok:false,replies:replies.length,failedReply:reply};
  }
  return {ok:true,replies:replies.length,continuation:'guarded',maxMatePlies:null};
}
