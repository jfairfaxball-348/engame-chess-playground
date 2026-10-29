/**
 * KRK05 restoration composition: strictly local and unreleased.
 *
 * This is a source-derived, deterministic FIRST-PAIR / CENTRE-PAIR
 * dispatcher for the geometric hypotheses of KRKCentral.restoration_bound.
 * The proof source is the upstream draft restoration PR #7, not merged main.
 *
 * The terminal result is a CENTRAL-WALL HANDOFF, never a mating policy.
 * In particular no choice is made inside CentralBound, and no global
 * play, runtime engines, search or tablebase are involved.
 */
import {
  coords,findKing,opposite,outcome,legalMoves,play,positionKey,validateSetup
} from './chess.js';
import {KRK_FRAMES,krkTransformSquare}
  from './krk-local-witness.js';
import {krkRestorationFirstChoice,auditKRKRestorationFirst}
  from './krk-restoration-first.js';
import {krkRestorationCentreChoice,auditKRKRestorationCentre}
  from './krk-restoration-centre.js';

export const KRK_RESTORATION_CHAIN_SCOPE =
  'restoration_bound local pairs to central-wall handoff; no mate selector';

function geometry(state,frame){
  if(!KRK_FRAMES.includes(frame)||state?.material!=='krk'||
      !Array.isArray(state.board)||!Array.isArray(state.history)||
      !Array.isArray(state.log)||!Number.isInteger(state.halfmove)||
      state.halfmove<0)return null;
  const board=state.board,rook=board.find(p=>p?.[1]==='R');
  if(!rook||state.turn!==rook[0]||
      validateSetup(board,'krk',state.turn)!==null||
      state.history.at(-1)!==positionKey(board,state.turn)||
      outcome(board,state.turn,state.history,state.halfmove).kind!=='ongoing')
    return null;
  const sk=findKing(board,state.turn),rs=board.indexOf(rook),
    wk=findKing(board,opposite(state.turn));
  const [sx,sy]=coords(krkTransformSquare(sk,frame));
  const [,ry]=coords(krkTransformSquare(rs,frame));
  const [,wy]=coords(krkTransformSquare(wk,frame));
  if(!(sy<ry&&ry<wy))return null;
  return {sx,sy,ry,wy};
}
function handoff(frame){
  return Object.freeze({
    kind:'handoff',phase:'central-wall',frame,move:null,
    upstream:'EndgameChess.Rules.KRKCentral.central_bound',
    reason:'Restoration ends here. No executable central-to-mate policy.',
    isCompleteWinningPolicy:false,maxMatePlies:null
  });
}
function step(choice,frame){
  if(choice?.kind!=='step'||!choice.move)return null;
  return Object.freeze({
    kind:'step',phase:choice.phase,rule:choice.rule,
    frame,move:choice.move,witness:choice,
    isCompleteWinningPolicy:false,maxMatePlies:null
  });
}

/**
 * Select ONLY an already-extracted restoration square. This function can
 * be used on any valid source-geometry state; it does not assert the state
 * arose from a specific earlier check or certify an entire chess game.
 */
export function krkRestorationChainNext(state,frame='id'){
  const g=geometry(state,frame);
  if(!g)return null;
  if(g.sy+2===g.ry && g.sx>=1 && g.sx<=6)
    return step(krkRestorationFirstChoice(state,frame),frame);
  if(g.sy+1!==g.ry)return null;
  if(g.sx===3||g.sx===4)return handoff(frame);
  if(g.sx===2||g.sx===5)
    return step(krkRestorationCentreChoice(state,frame),frame);
  return null;
}

function threefoldClaim(state){
  const key=positionKey(state.board,state.turn);
  return state.history.filter(k=>k===key).length>=3;
}

/**
 * Falsification audit over EVERY legal defender continuation to the
 * central-wall handoff, at most three pairs (six plies).
 *
 * It deliberately rejects claimable 50-move and threefold traces,
 * instead of mistaking an ongoing automatic-termination status for
 * evidence that a forcing 50-move-safe global strategy exists.
 */
export function auditKRKRestorationChain(state,frame='id'){
  const fail=(reason,extra={})=>({
    ok:false,reason,centralLeaves:0,examinedReplies:0,
    maxPairs:0,isCompleteWinningPolicy:false,maxMatePlies:null,...extra
  });
  if(!geometry(state,frame))return fail('outside restoration geometry or invalid history');
  // Conservative even when fewer than three pairs will be required.
  if(state.halfmove+6>=100)return fail('50-move claim window');
  if(threefoldClaim(state))return fail('threefold claim already available');

  let centralLeaves=0,examinedReplies=0,maxPairs=0;
  function visit(s,pairs){
    if(s.halfmove>=100||threefoldClaim(s))
      return 'claimable draw before central wall';
    const next=krkRestorationChainNext(s,frame);
    if(!next)return 'restoration extraction unavailable';
    if(next.kind==='handoff'){
      centralLeaves++;
      maxPairs=Math.max(maxPairs,pairs);
      return null;
    }
    if(pairs>=3)return 'restoration pair bound exceeded';
    const witnessAudit=next.phase==='restoration-centre-align'?
      auditKRKRestorationCentre(s,frame):auditKRKRestorationFirst(s,frame);
    if(!witnessAudit.ok)return 'source-specific all-reply audit failed';
    const after=play(s,next.move);
    if(outcome(after.board,after.turn,after.history,after.halfmove).kind!=='ongoing')
      return 'early terminal instead of certified weak continuation';
    const replies=legalMoves(after.board,after.turn);
    if(!replies.length||replies.length!==witnessAudit.replies)
      return 'weak reply domain mismatch';
    for(const reply of replies){
      examinedReplies++;
      if(reply.capture||reply.piece!==opposite(s.turn)+'K')
        return 'unexpected defending capture or piece';
      const child=play(after,reply);
      if(outcome(child.board,child.turn,child.history,child.halfmove).kind!=='ongoing')
        return 'terminal after defending move';
      const problem=visit(child,pairs+1);
      if(problem)return problem;
    }
    return null;
  }
  const problem=visit(state,0);
  if(problem)return fail(problem,{examinedReplies,maxPairs});
  return {ok:centralLeaves>0,centralLeaves,examinedReplies,maxPairs,
    isCompleteWinningPolicy:false,maxMatePlies:null,
    terminal:'central-wall handoff, not checkmate'};
}
