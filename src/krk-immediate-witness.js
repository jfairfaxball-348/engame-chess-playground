/**
 * KRK01: exact, constructive, mate-in-one witness; not a global KRK policy.
 *
 * Frozen proof interface:
 *   KRKImmediate.rankTarget / fileTarget / MateNow / immediate_iff
 *   KRKMateGeometry.Horizontal and kernel_mate_iff
 * Read-only parent: engame-chess@e7de0930fc61caeb11795cf3c10fde11e4774a40
 * Frozen supporting bundle: EC-T0049@4275e227ce88f966c1d663117a3081b55179fc35
 *
 * The Lean equivalence is for a legal strong-turn, nonchecking KRK root with
 * king separation >=2. No engine, per-position data or game-tree search.
 */
import {
  applyMove, coords, distance, findKing, legalMoves, opposite,
  outcome, squareAt, validateSetup
} from './chess.js';
import { KRK_PARENT_SHA } from './krk-local-witness.js';

export const KRK_IMMEDIATE_RULE = 'EndgameChess.Rules.KRKImmediate.immediate_iff';

/**
 * Direct translation of KRKMateGeometry.Horizontal sk dst wk.
 * Inputs are [file,rank] pairs, with a1=(0,0).
 */
export function krkHorizontalMateGeometry(sk, dst, wk) {
  const [sx,sy]=sk,[rx,ry]=dst,[wx,wy]=wk;
  if(ry!==wy || !((wy===0 && sy===2)||(wy===7 && sy===5)) ||
    Math.abs(rx-wx)<2) return false;
  if(wx===0)return sx<=1;
  if(wx===7)return sx>=6;
  return sx===wx;
}

/** MateNow's two target squares are explicit, not enumerated from legal moves. */
export function krkMateNowTargets(board, strong) {
  if(!Array.isArray(board) || !['w','b'].includes(strong))return [];
  if(validateSetup(board,'krk',strong)!==null)return [];
  const rook=board.indexOf(strong+'R');
  const sk=findKing(board,strong),wk=findKing(board,opposite(strong));
  if(rook<0 || sk<0 || wk<0 || distance(sk,wk)<2)return [];
  const king=coords(sk),r=coords(rook),weak=coords(wk);
  const rankTarget=squareAt(r[0],weak[1]);
  const fileTarget=squareAt(weak[0],r[1]);
  const choices=[];
  if(krkHorizontalMateGeometry(king,coords(rankTarget),weak))
    choices.push({target:rankTarget,case:'horizontal'});
  const swap=([x,y])=>[y,x];
  if(krkHorizontalMateGeometry(swap(king),swap(coords(fileTarget)),swap(weak)))
    choices.push({target:fileTarget,case:'vertical'});
  return choices;
}

/**
 * Selects a direct geometric checkmate ONLY if the certified terminal
 * predicate holds. This does not choose among general nonterminal moves.
 * Input carries the actual clock/history unchanged.
 */
export function krkImmediateMateWitness(state){
  if(!state || state.material!=='krk' || !Array.isArray(state.history) ||
    !Number.isInteger(state.halfmove) || state.halfmove<0 ||
    !Array.isArray(state.board))return null;
  const b=state.board,rook=b.find(p=>p&&p[1]==='R');
  if(!rook || state.turn!==rook[0])return null;
  const strong=rook[0];
  if(validateSetup(b,'krk',strong)!==null ||
    outcome(b,strong,state.history,state.halfmove).kind!=='ongoing')return null;
  const rs=b.indexOf(rook);
  const moves=legalMoves(b,strong);
  for(const x of krkMateNowTargets(b,strong)){
    // Legal rook-ray clearance = frozen RookSees premise. A rook move is the
    // only possible source of mate from a nonchecking strong-turn root.
    const move=moves.find(m=>m.from===rs && m.to===x.target);
    if(!move)continue;
    const next=applyMove(b,move);
    if(outcome(next,opposite(strong)).kind!=='mate')continue; // independent fail-closed check
    return Object.freeze({
      move, origin:'lean-immediate-mate',
      rule:KRK_IMMEDIATE_RULE, support:'EndgameChess.Rules.KRKMateGeometry.kernel_mate_iff',
      parent:KRK_PARENT_SHA, frozenBundle:'EC-T0049',
      case:x.case, premises:'Exact KRK, strong to move, opponent not currently in check, king separation >=2; MateNow rook target and ray clearance',
      reason:'The frozen immediate_iff criterion gives this rook destination; the resulting legal board is checkmate.',
      maxMatePlies:1, isCompleteWinningPolicy:false,
      inputHalfmove:state.halfmove,inputHistoryLength:state.history.length
    });
  }
  return null;
}
