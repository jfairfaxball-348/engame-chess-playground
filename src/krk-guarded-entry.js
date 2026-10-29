/**
 * One exact guarded king-step, extracted from
 * KRKExecutable.GuardedEntry.guardedEntry_sound.
 *
 * It does not implement the axis-swapped column wall or terminal mate.
 * The source theorem certifies the region after all legal weak responses,
 * not that this implementation is a complete strategy. No game-loop use.
 */
import {applyMove,coords,findKing,legalMoves,opposite,squareAt}
  from './chess.js';
import {KRK_FRAMES,KRK_PARENT_SHA,krkTransformSquare}
  from './krk-local-witness.js';

export const KRK_GUARDED_LEMMA='EndgameChess.Rules.KRKExecutable.guardedEntry_sound';
export const KRK_GUARDED_LEFT_LEMMA='EndgameChess.Rules.KRKExecutable.guardedEntryLeft_sound';

export function krkGuardedEntryChoice(state,frame='id'){
  if(!KRK_FRAMES.includes(frame)||state?.material!=='krk'||
     !Array.isArray(state.board)||!Array.isArray(state.history)||
     !Number.isInteger(state.halfmove)||state.halfmove<0)return null;
  const strong=state.turn,weak=opposite(strong);
  const rook=state.board.indexOf(strong+'R');
  const sk=findKing(state.board,strong),wk=findKing(state.board,weak);
  if(rook<0||sk<0||wk<0)return null;
  const [sx,sy]=coords(krkTransformSquare(sk,frame));
  const [rx,ry]=coords(krkTransformSquare(rook,frame));
  const [wx,wy]=coords(krkTransformSquare(wk,frame));
  const right=sx+1===rx&&wx>rx&&rx>=3&&rx<=5;
  const left=rx+1===sx&&wx<rx&&rx>=2&&rx<=4;
  if(sy+1!==ry||wy<=ry||(!right&&!left))return null;
  const dest=krkTransformSquare(squareAt(sx,ry),frame);
  const m=legalMoves(state.board,strong).find(m=>m.from===sk&&m.to===dest);
  if(!m)return null;
  return Object.freeze({kind:'step',move:m,frame,
    phase:'GUARDED entry → axis-swapped column-wall handoff',
    rule:right?KRK_GUARDED_LEMMA:KRK_GUARDED_LEFT_LEMMA,parent:KRK_PARENT_SHA,
    premises:'K diagonal below the rook; weak king strictly above and on the opposite side of rook',
    continuation:'Every legal defender reply stays strictly above the rook and beyond the protected rook file.',
    isCompleteWinningPolicy:false,maxMatePlies:null,
    inputHalfmove:state.halfmove,inputHistoryLength:state.history.length});
}

export function auditKRKGuardedEntry(state,frame='id'){
  const c=krkGuardedEntryChoice(state,frame);
  if(!c)return {ok:false,replies:0};
  const after=applyMove(state.board,c.move),weak=opposite(state.turn);
  const replies=legalMoves(after,weak);
  if(replies.length===0)return {ok:false,replies:0};
  const rook=after.indexOf(state.turn+'R');
  const [rx,ry]=coords(krkTransformSquare(rook,frame));
  const [sx]=coords(krkTransformSquare(findKing(after,state.turn),frame));
  const right=sx<rx;
  for(const reply of replies){
    if(reply.capture||reply.piece!==weak+'K')
      return {ok:false,replies:replies.length,failedReply:reply};
    const nxt=applyMove(after,reply),wk=findKing(nxt,weak);
    const [wx,wy]=coords(krkTransformSquare(wk,frame));
    if((right?wx<=rx:wx>=rx)||wy<=ry)
      return {ok:false,replies:replies.length,failedReply:reply};
  }
  return {ok:true,replies:replies.length,continuation:'column-wall',
    maxMatePlies:null};
}
