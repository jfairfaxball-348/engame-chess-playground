/**
 * Maths-only experimental KRK play adapter.
 *
 * Every attacking move comes from the source-tagged, constructive Lean
 * translation. No Stockfish, other arena worker, minimax, tablebase or
 * arbitrarily chosen legal move may replace a missing KRK continuation.
 *
 * THIS IS PLAYABLE-BETA, NOT A PROOF OF GLOBAL MATE TERMINATION. A missing
 * source phase is reported to the user rather than silently substituted.
 */
import {play,opposite} from './chess.js';
import {chooseDecision} from './engine.js';
import {krkTaggedStrongChoice} from './krk-tagged-strategy.js';
import {kqkSourceChoice} from './kqk-source-policy.js';

export const KRK_EXPERIMENTAL_PLAYABLE=true;
export const KQK_EXPERIMENTAL_PLAYABLE=true;
export const KQK_EXPERIMENTAL_DESCRIPTION=
  'Experimental KQK · frozen EC-T0050 outcome; partial source-derived edge/band/entry move policy (some positions unavailable); full-game selector not certified';
export const KRK_EXPERIMENTAL_DESCRIPTION=
  'Experimental KRK · source-derived opponent; complete-game proof and FIDE clock/history certification pending';

/** Capture of the only rook yields the existing proved KK draw class. */
export function mathsPlayMove(state,move){
  const next=play(state,move);
  if((state.material==='krk'||state.material==='kqk')&&
      !next.board.includes(state.material==='krk'?'wR':'wQ')&&
      !next.board.includes(state.material==='krk'?'bR':'bQ'))
    return {...next,material:'kk'};
  return next;
}

/** The user always plays the lone king in KRK; the opponent has the rook.
 * Carry the source's exact continuation token across every actual weak move.
 */
export function chooseMathsOpponent(state,computerColor,token=null){
  if(!state||state.turn!==computerColor)return null;
  if(state.material!=='krk'&&state.material!=='kqk'){
    const decision=chooseDecision(state,computerColor);
    return decision?{...decision,continuationToken:null}:null;
  }
  if(state.material==='kqk'){
    if(!KQK_EXPERIMENTAL_PLAYABLE)return null;
    const choice=kqkSourceChoice(state,computerColor,token);
    return choice?.move?{
      move:choice.move,rule:choice.rule,sourcePhase:choice.sourcePhase,
      origin:'experimental-proof-derived-kqk',
      reason:'KQK frozen constructive geometric source phase; global JavaScript controller incomplete',
      continuationToken:choice.continuationPhase??null,
      mathematicallyCertifiedSelector:false,fideClockHistoryCertified:false
    }:null;
  }
  if(!KRK_EXPERIMENTAL_PLAYABLE||
      !state.board.includes(computerColor+'R')||
      state.board.includes(opposite(computerColor)+'R'))return null;
  const choice=krkTaggedStrongChoice(state,token);
  if(!choice?.move)return null;
  return {
    move:choice.move,
    rule:choice.rule,sourcePhase:choice.sourcePhase,
    origin:'experimental-proof-derived-krk',
    reason:'Constructive source-tagged KRK rule; full-game certification pending',
    continuationToken:choice.continuationPhase,
    mathematicallyCertifiedSelector:false,
    fideClockHistoryCertified:false
  };
}
