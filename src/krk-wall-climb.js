/**
 * KRK01: deterministic READY wall elevation, built solely from frozen
 * KRKCentral.rank_two_pair plus certified bounded preparation.
 *
 * This terminates in an exact lower-band handoff, NOT a complete winning
 * chess policy. No game-tree search, minimax, tables, engines, or fallback.
 *
 * Potential = 12 * (7 - rook.rank in explicit frozen frame) + prepRank.
 * Any chosen strong move followed by ANY legal weak reply strictly decreases
 * that potential, so no wall-climb loop is possible.
 */
import {applyMove,coords,findKing,legalMoves,opposite,outcome,positionKey,validateSetup} from './chess.js';
import {KRK_FRAMES,KRK_PARENT_SHA,krkTransformSquare} from './krk-local-witness.js';
import {krkPrepState,krkPrepChoice} from './krk-prep-controller.js';
import {krkConstructiveStep} from './krk-constructive-phases.js';

export const KRK_WALL_CLIMB_PHASE='KRKCentral.PrepPair + RankTwo + WallActions';

export function krkWallClimbState(state,frame='id'){
  const prep=krkPrepState(state,frame);
  if(!prep)return null;
  const strong=state.turn,weak=opposite(strong),b=state.board;
  const [,ry]=coords(krkTransformSquare(b.indexOf(strong+'R'),frame));
  const [,wy]=coords(krkTransformSquare(findKing(b,weak),frame));
  const height=7-ry,potential=12*height+prep.rank;
  return Object.freeze({...prep,rookRank:ry,weakRank:wy,height,
    potential,remainingPairUpperBound:potential,parent:KRK_PARENT_SHA});
}

export function krkWallClimbChoice(state,frame='id'){
  const p=krkWallClimbState(state,frame);
  if(!p)return null;
  if(p.rank>0){
    const c=krkPrepChoice(state,frame);
    return c?.kind==='step'?Object.freeze({
      kind:'step',move:c.move,ruleKey:c.ruleKey,witness:c.witness,frame,
      potentialBefore:p.potential,parent:KRK_PARENT_SHA,
      maxMatePlies:null,isCompleteWinningPolicy:false
    }):null;
  }
  if(p.weakRank===p.rookRank+1){
    return Object.freeze({
      kind:'handoff',phase:KRK_WALL_CLIMB_PHASE,frame,
      reason:'READY lower band — a protected cut, opposition or terminal mate phase is still required',
      potentialBefore:p.potential,parent:KRK_PARENT_SHA,
      maxMatePlies:null,isCompleteWinningPolicy:false
    });
  }
  // Certified rank_two_pair: rook rank goes up; after every weak reply,
  // new king is still ABOVE the elevated wall; preparation handles its margin.
  const w=krkConstructiveStep(state,'rankTwo',frame);
  if(!w)return null;
  return Object.freeze({kind:'step',move:w.move,ruleKey:'rankTwo',witness:w,
    frame,potentialBefore:p.potential,parent:KRK_PARENT_SHA,
    maxMatePlies:null,isCompleteWinningPolicy:false});
}

export function auditKRKWallClimbChoice(state,frame='id'){
  const c=krkWallClimbChoice(state,frame);
  if(!c)return {ok:false,replies:0};
  if(c.kind==='handoff')return {ok:true,replies:0,handoff:true};
  const after=applyMove(state.board,c.move),weak=opposite(state.turn);
  const replies=legalMoves(after,weak);
  if(!replies.length)return {ok:false,replies:0};
  let maxNext=-1;
  for(const move of replies){
    if(move.capture||move.piece!==weak+'K')return {ok:false,replies:replies.length};
    const b=applyMove(after,move);
    const next={...state,board:b,history:state.history.concat([
      positionKey(after,weak),positionKey(b,state.turn)
    ]),halfmove:state.halfmove+2};
    const p=krkWallClimbState(next,frame);
    if(!p||!(p.potential<c.potentialBefore))
      return {ok:false,replies:replies.length,ruleKey:c.ruleKey,
        potentialBefore:c.potentialBefore,nextPotential:p?.potential??null,failedMove:move};
    maxNext=Math.max(maxNext,p.potential);
  }
  return {ok:true,replies:replies.length,ruleKey:c.ruleKey,
    potentialBefore:c.potentialBefore,maxNextPotential:maxNext};
}
