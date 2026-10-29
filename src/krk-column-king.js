/**
 * Exact column-centering king move from KRKExecutable.ColumnKing.
 * Scope: interior strong-king file 1,2,5,6 under a strict rank wall and
 * a rook/weak-king margin >=3. All weak replies retain margin >=2.
 * This is a local phase, not a complete KRK game policy or mate horizon.
 */
import {applyMove,coords,findKing,legalMoves,opposite,squareAt}
  from './chess.js';
import {KRK_FRAMES,KRK_PARENT_SHA,krkTransformSquare}
  from './krk-local-witness.js';
import {krkPrepState} from './krk-prep-controller.js';
import {krkConstructiveStep} from './krk-constructive-phases.js';

export const KRK_COLUMN_KING_LEMMA='EndgameChess.Rules.KRKExecutable.columnKingStep_sound';

export function krkColumnKingChoice(state,frame='id'){
  const prep=krkPrepState(state,frame);
  if(!prep)return null;
  const strong=state.turn,weak=opposite(strong);
  const sk=findKing(state.board,strong),rook=state.board.indexOf(strong+'R'),
    wk=findKing(state.board,weak);
  if(sk<0||rook<0||wk<0)return null;
  const [sx,sy]=coords(krkTransformSquare(sk,frame));
  const [rx,ry]=coords(krkTransformSquare(rook,frame));
  const [wx,wy]=coords(krkTransformSquare(wk,frame));
  if(![1,2,5,6].includes(sx)||!(sy<ry&&ry<wy)||Math.abs(rx-wx)<3)return null;
  const candidate=krkConstructiveStep(state,'prep',frame);
  if(!candidate)return null;
  const expect=sx<3?sx+1:sx-1;
  if(candidate.move.from!==sk||
     candidate.move.to!==krkTransformSquare(squareAt(expect,sy),frame))return null;
  return Object.freeze({kind:'step',move:candidate.move,frame,witness:candidate,
    phase:'COLUMN interior centre-approach',
    rule:KRK_COLUMN_KING_LEMMA,parent:KRK_PARENT_SHA,
    premises:'K file in {1,2,5,6}; strict wall; rook/weak file gap >=3',
    continuation:'Every weak reply preserves rook wall and file gap >=2; king is one column nearer centre.',
    isCompleteWinningPolicy:false,maxMatePlies:null,
    inputHalfmove:state.halfmove,inputHistoryLength:state.history.length});
}

export function auditKRKColumnKing(state,frame='id'){
  const c=krkColumnKingChoice(state,frame);
  if(!c)return {ok:false,replies:0};
  const after=applyMove(state.board,c.move),weak=opposite(state.turn);
  const replies=legalMoves(after,weak);
  if(!replies.length)return {ok:false,replies:0};
  const [rx,ry]=coords(krkTransformSquare(after.indexOf(state.turn+'R'),frame));
  const [sx,sy]=coords(krkTransformSquare(findKing(after,state.turn),frame));
  for(const reply of replies){
    if(reply.capture||reply.piece!==weak+'K')return {ok:false,replies:replies.length,failedReply:reply};
    const b=applyMove(after,reply);
    const [wx,wy]=coords(krkTransformSquare(findKing(b,weak),frame));
    if(!(sy<ry&&ry<wy)||Math.abs(rx-wx)<2||sx<2||sx>5)
      return {ok:false,replies:replies.length,failedReply:reply};
  }
  return {ok:true,replies:replies.length,continuation:'centralising column',
    isCompleteWinningPolicy:false,maxMatePlies:null};
}
