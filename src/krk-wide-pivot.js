/**
 * KRK02 constructive wide READY pivot. Both file directions have explicit
 * verified coordinates and every-defender-region lemmas in KRKExecutable.WidePivot.
 * A rook already on the guarded cut is a handoff, not a no-op.
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
export const KRK_LEFT_PIVOT_LEMMA =
  'EndgameChess.Rules.KRKExecutable.pivotLeftCut_sound';
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
    premises:'K one rank below rook, weak king one above rook; K file central; |K file-weak file| >=2'};
  if(rook===target){
    return Object.freeze({...original,kind:'handoff',
      reason:'Protected vertical cut already exists: guarded phase must execute next',
      continuation:KRK_GUARDED_HANDOFF});
  }
  const move=legalMoves(state.board,strong).find(m=>m.from===rook&&m.to===target);
  if(!move)return null;
  return Object.freeze({...original,kind:'step',move,
    continuation:'Every weak reply leaves its king above the rook and beyond the protected rook file.'});
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
  const [sxBefore]=coords(krkTransformSquare(findKing(state.board,strong),frame));
  const [wxBefore]=coords(krkTransformSquare(findKing(state.board,weak),frame));
  const right=wxBefore>sxBefore;
  for(const reply of replies){
    if(reply.capture||reply.piece!==weak+'K')
      return {ok:false,replies:replies.length,failedReply:reply};
    const after=applyMove(b,reply);
    const sk=findKing(after,strong),wk=findKing(after,weak);
    if(sk<0||wk<0)return {ok:false,replies:replies.length,failedReply:reply};
    const [sx,sy]=coords(krkTransformSquare(sk,frame));
    const [wx,wy]=coords(krkTransformSquare(wk,frame));
    if(sx+(right?1:-1)!==rx||sy+1!==ry||
       (right?wx<=rx:wx>=rx)||wy<=ry)
      return {ok:false,replies:replies.length,failedReply:reply};
  }
  return {ok:true,replies:replies.length,continuation:'guarded',maxMatePlies:null};
}
