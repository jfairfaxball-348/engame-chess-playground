/**
 * KRK07 (unreleased): compose one complete CENTRAL UPPER-WALL height advance.
 *
 * Exact Lean proof dependencies:
 *  - KRKExecutable.readyUpperDestination_sound / KRKCentral.rank_two_pair:
 *      rook moves up one rank, ALL legal weak replies remain above the wall.
 *  - KRKCentral.restoration_bound: after ALL such replies, a finite sequence
 *      of source-derived king/rook pairs restores the FULL central wall.
 *  - KRKCentral.exit_step_bound: the corresponding existential mate bound.
 *
 * This is a *phase* controller. It is NOT a whole-game selector: the lower
 * band, central pursuit/exit recursion, setup and FIDE-safe global budget
 * are not provided. No engine, tablebase, minimax, search or fallback.
 */
import {
  coords,findKing,legalMoves,opposite,outcome,play,positionKey
} from './chess.js';
import {KRK_FRAMES,krkTransformSquare} from './krk-local-witness.js';
import {krkWallClimbChoice,krkWallClimbState,auditKRKWallClimbChoice}
  from './krk-wall-climb.js';
import {krkRestorationChainNext,auditKRKRestorationChain}
  from './krk-restoration-chain.js';

export const KRK_CENTRAL_UPPER_RULE =
  'EndgameChess.Rules.KRKExecutable.readyUpperDestination_sound';
export const KRK_CENTRAL_UPPER_RESTORATION =
  'EndgameChess.Rules.KRKCentral.restoration_bound';
export const KRK_CENTRAL_UPPER_PHASE =
  'rank-two + all-reply restoration to central wall one rank higher';

const isClaimable=s=>s.halfmove>=100||
  s.history.filter(k=>k===positionKey(s.board,s.turn)).length>=3;

/** A complete one-rank *phase* starts ONLY inside the exact READY upper wall. */
export function krkCentralUpperPhaseChoice(state,frame='id'){
  if(!KRK_FRAMES.includes(frame)||!Array.isArray(state?.history)||
    !Array.isArray(state?.log)||!Array.isArray(state?.board)||
    state.history.at(-1)!==positionKey(state.board,state.turn)||
    !Number.isInteger(state.halfmove)||state.halfmove<0||
    outcome(state.board,state.turn,state.history,state.halfmove).kind!=='ongoing'||
    isClaimable(state)||state.halfmove+8>=100)return null;
  const p=krkWallClimbState(state,frame);
  if(!p?.ready||p.weakRank<p.rookRank+2||p.rookFileMargin<2)return null;
  const witness=krkWallClimbChoice(state,frame);
  if(witness?.kind!=='step'||witness.ruleKey!=='rankTwo')return null;
  const rook=state.board.indexOf(state.turn+'R');
  const [,fromRank]=coords(krkTransformSquare(rook,frame));
  const [,toRank]=coords(krkTransformSquare(witness.move.to,frame));
  if(fromRank!==p.rookRank||toRank!==fromRank+1)return null;
  return Object.freeze({
    kind:'step',phase:'central-upper-advance',frame,move:witness.move,
    rule:KRK_CENTRAL_UPPER_RULE,restorationRule:KRK_CENTRAL_UPPER_RESTORATION,
    originalWallRank:fromRank,nextWallRank:toRank,
    sourceWitness:witness,remainingPhasePliesUpperBound:8,
    isCompleteWinningPolicy:false,maxMatePlies:null
  });
}

/** Route phase continuation (not a global selector) after a weak reply. */
export function krkCentralUpperRestorationNext(state,frame='id'){
  if(!Array.isArray(state?.history)||!Array.isArray(state?.board)||
    !Array.isArray(state?.log)||state.history.at(-1)!==
      positionKey(state.board,state.turn)||
    !Number.isInteger(state.halfmove)||state.halfmove>=100||
    isClaimable(state)||outcome(state.board,state.turn,state.history,state.halfmove).kind!=='ongoing')
    return null;
  return krkRestorationChainNext(state,frame);
}

/**
 * Universal falsification audit for an entire eight-ply rank-increment
 * phase, including all legal weak replies at EVERY restoration pair.
 * NEVER use reply enumeration to choose a move. A named Lean rule does so.
 */
export function auditKRKCentralUpperPhase(state,frame='id'){
  const fail=(reason,details={})=>({
    ok:false,reason,firstReplies:0,restorationReplies:0,
    centralLeaves:0,maxPhasePlies:0,
    isCompleteWinningPolicy:false,maxMatePlies:null,...details
  });
  const initial=krkCentralUpperPhaseChoice(state,frame);
  if(!initial)return fail('outside exact upper READY domain or FIDE claim window');
  const first=auditKRKWallClimbChoice(state,frame);
  if(!first.ok||first.ruleKey!=='rankTwo')
    return fail('upper rank source witness audit failed');
  const after=play(state,initial.move);
  if(outcome(after.board,after.turn,after.history,after.halfmove).kind!=='ongoing')
    return fail('unexpected terminal after rank advance');
  const replies=legalMoves(after.board,after.turn);
  if(!replies.length||replies.length!==first.replies)
    return fail('weak reply domain mismatch');

  let restorationReplies=0,centralLeaves=0,maxPhasePlies=0;
  for(const reply of replies){
    if(reply.capture||reply.piece!==opposite(state.turn)+'K')
      return fail('rank advance admitted an unexpected capture', {reply});
    const child=play(after,reply);
    if(isClaimable(child))return fail('defender draw claim during phase',{reply});
    const rook=child.board.indexOf(state.turn+'R');
    const [,rank]=coords(krkTransformSquare(rook,frame));
    if(rank!==initial.nextWallRank)
      return fail('rank advance lost strict wall height',{reply});
    const next=krkCentralUpperRestorationNext(child,frame);
    if(!next)return fail('restoration has no source-derived continuation',{reply});
    const audit=auditKRKRestorationChain(child,frame);
    if(!audit.ok)return fail('restoration all-reply audit failed',{
      reply,restorationFailure:audit.reason,restorationReplies,centralLeaves
    });
    if(!audit.centralLeaves||audit.maxPairs>3)
      return fail('restoration failed to reach central wall within three pairs',{reply});
    restorationReplies+=audit.examinedReplies;
    centralLeaves+=audit.centralLeaves;
    maxPhasePlies=Math.max(maxPhasePlies,2+2*audit.maxPairs);
  }
  if(maxPhasePlies>8||centralLeaves<replies.length)
    return fail('phase bound or leaf coverage violated');
  return Object.freeze({
    ok:true,phase:KRK_CENTRAL_UPPER_PHASE,
    originalWallRank:initial.originalWallRank,
    nextWallRank:initial.nextWallRank,
    firstReplies:replies.length,restorationReplies,centralLeaves,
    maxPhasePlies,terminal:'higher central wall (NOT mate)',
    isCompleteWinningPolicy:false,maxMatePlies:null
  });
}
