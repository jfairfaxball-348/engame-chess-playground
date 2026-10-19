/**
 * Chess Playground's ONLY currently released adversarial policy:
 * K vs K / K+B vs K / K+N vs K are upstream-proved dead positions.
 * Any legal move is sufficient in demonstration mode. NO heuristics,
 * external engines, minimax, precomputed positions, or upstream runtime access.
 *
 * IMPORTANT: KRK is intentionally NOT PLAYABLE. Do not restore a partial
 * proof-pattern policy until a completed upstream strategy has been formally
 * verified, frozen, reviewed, and expressly authorised for release by owner.
 */
import { MATERIAL, legalMoves } from './chess.js';

export function chooseDecision(state, computerColor) {
  if (!MATERIAL[state.material]?.playable || state.turn !== computerColor) return null;
  const moves = legalMoves(state.board, state.turn);
  if (!moves.length) return null;
  return {
    move: moves[0],
    origin: 'dead-position-choice',
    rule: MATERIAL[state.material].theorem,
    reason: 'The source theorem establishes a dead position. Any legal move has the same drawn outcome. Continued board movement is for exploration only.'
  };
}

export function chooseMove(state, computerColor) {
  return chooseDecision(state, computerColor)?.move ?? null;
}

export function strategyLabel(material) {
  if (!MATERIAL[material]?.playable) return 'Unavailable — waiting for completed, approved proof in endgame-chess';
  return 'Any legal move (frozen dead-position theorem)';
}
