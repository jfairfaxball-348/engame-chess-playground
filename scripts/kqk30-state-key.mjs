/**
 * S030 diagnostic-only KQK controller identity.
 *
 * Returning to the same board with a DIFFERENT source-continuation tag
 * is not a repeated deterministic controller state. Conversely, a token
 * rankBefore encodes the frozen BandEntry induction and cannot be dropped.
 * moveCount merely authenticates the intervening real move and increases
 * monotonically, so it is excluded for simplified-strategy loop triage.
 *
 * This key is deliberately NOT a FIDE history/clock equivalence and MUST
 * NOT be imported into the Maths move selector.
 */
import {positionKey} from '../src/chess.js';

function projection(v) {
  if(Array.isArray(v))return v.map(projection);
  if(v&&typeof v==='object')
    return Object.fromEntries(Object.entries(v)
      .filter(([key])=>key!=='moveCount')
      .sort(([a],[b])=>a.localeCompare(b))
      .map(([key,item])=>[key,projection(item)]));
  return v;
}

export function kqk30ControlShape(state,strong,token) {
  return positionKey(state.board,state.turn)+'|'+strong+'|'+
    JSON.stringify(projection(token));
}
