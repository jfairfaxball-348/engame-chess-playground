/**
 * KRK05 (unreleased): the second centre-alignment pair in the exact
 * KRKCentral.restoration_bound proof. Source review:
 * https://github.com/jfairfaxball-348/engame-chess/pull/6
 *
 * Restricted to king file 2 or 5, strict rank wall and rook file gap >=2.
 * Not a source-certified total winning policy.
 */
import {
  coords,findKing,legalMoves,opposite,outcome,play,squareAt,validateSetup
} from './chess.js';
import {KRK_FRAMES,krkTransformSquare} from './krk-local-witness.js';

export const KRK_RESTORATION_CENTRE_RULE=
  'EndgameChess.Rules.KRKExecutable.restorationCentre_sound';

function framed(s,frame){
  if(!KRK_FRAMES.includes(frame)||s?.material!=='krk'||
    !Array.isArray(s.board)||!Array.isArray(s.history)||
    !Number.isInteger(s.halfmove)||s.halfmove<0)return null;
  const b=s.board,rook=b.find(p=>p?.[1]==='R');
  if(!rook||s.turn!==rook[0]||validateSetup(b,'krk',s.turn)!==null||
    outcome(b,s.turn,s.history,s.halfmove).kind!=='ongoing')return null;
  const sk=findKing(b,s.turn),rs=b.indexOf(rook),wk=findKing(b,opposite(s.turn));
  if(sk<0||rs<0||wk<0)return null;
  const [sx,sy]=coords(krkTransformSquare(sk,frame));
  const [rx,ry]=coords(krkTransformSquare(rs,frame));
  const [wx,wy]=coords(krkTransformSquare(wk,frame));
  if(![2,5].includes(sx)||!(sy<ry&&ry<wy)||Math.abs(rx-wx)<2)return null;
  return {sk,rs,wk,sx,sy,rx,ry,wx,wy,frame};
}
export function krkRestorationCentreChoice(state,frame='id'){
  const p=framed(state,frame);if(!p)return null;
  const target=krkTransformSquare(squareAt(p.sx===2?3:4,p.sy),frame);
  const move=legalMoves(state.board,state.turn).find(m=>m.from===p.sk&&m.to===target);
  if(!move)return null;
  return Object.freeze({
    kind:'step',phase:'restoration-centre-align',frame,
    move,rule:KRK_RESTORATION_CENTRE_RULE,
    proofReview:'https://github.com/jfairfaxball-348/engame-chess/pull/6',
    proofStatus:'upstream-draft-pending-merge',
    inputHalfmove:state.halfmove,inputHistoryLength:state.history.length,
    isCompleteWinningPolicy:false,maxMatePlies:null
  });
}
export function auditKRKRestorationCentre(state,frame='id'){
  const p=framed(state,frame),choice=krkRestorationCentreChoice(state,frame);
  if(!p||!choice)return {ok:false,replies:0};
  const after=play(state,choice.move),replies=legalMoves(after.board,after.turn);
  if(!replies.length)return {ok:false,replies:0};
  for(const reply of replies){
    if(reply.capture||reply.piece!==opposite(state.turn)+'K')
      return {ok:false,replies:replies.length,failedReply:reply};
    const b=play(after,reply).board,sk=findKing(b,state.turn),
      rs=b.indexOf(state.turn+'R'),wk=findKing(b,opposite(state.turn));
    const [sx,sy]=coords(krkTransformSquare(sk,frame));
    const [,ry]=coords(krkTransformSquare(rs,frame));
    const [,wy]=coords(krkTransformSquare(wk,frame));
    if(![3,4].includes(sx)||!(sy<ry&&ry<wy))
      return {ok:false,replies:replies.length,failedReply:reply};
  }
  return {ok:true,replies:replies.length,
    isCompleteWinningPolicy:false,maxMatePlies:null};
}
