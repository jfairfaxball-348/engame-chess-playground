/** Maths-only opponent: frozen dead-position choices plus KRK geometric policy.
 * The second Engine Playground tab has its own engines and is not imported. */
import { MATERIAL, legalMoves } from './chess.js';
import { chooseKRKDecision } from './krk-play-policy.js';

export function chooseDecision(state, computerColor) {
  if (!MATERIAL[state.material]?.playable || state.turn !== computerColor) return null;
  if(state.material==='krk'){
    if(!state.board.includes(computerColor+'R'))return null;
    return chooseKRKDecision(state,computerColor);
  }
  const moves = legalMoves(state.board, state.turn);
  if (!moves.length) return null;
  return {
    move: moves[0],
    origin: 'dead-position-choice',
    rule: MATERIAL[state.material].theorem,
    reason: 'The frozen dead-position result makes every legal move drawn.'
  };
}
export function chooseMove(state, computerColor) {
  return chooseDecision(state, computerColor)?.move ?? null;
}
export function strategyLabel(material) {
  if(material==='krk')return 'Proof-sourced rook-and-king geometry (practical play, no ply certificate)';
  if (!MATERIAL[material]?.playable) return 'Unavailable';
  return 'Any legal move (frozen dead-position theorem)';
}
