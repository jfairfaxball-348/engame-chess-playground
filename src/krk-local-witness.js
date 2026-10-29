/**
 * KRK01: isolated, proof-derived ONE-STEP geometric witnesses.
 *
 * NOT A PLAYING POLICY. No composition, global forcing rank, history certificate
 * or 97/98-ply budget is provided. The practical Maths mode composes these\n * steps and distinguishes uncatalogued geometric setup from proved actions. Callers must
 * explicitly request a rule; this module intentionally has no auto-play entry.
 *
 * Read-only Lean source: engame-chess@e7de0930fc61caeb11795cf3c10fde11e4774a40
 */
import {
  applyMove, coords, distance, findKing, legalMoves, opposite,
  outcome, squareAt, validateSetup
} from './chess.js';

export const KRK_PARENT_SHA = 'e7de0930fc61caeb11795cf3c10fde11e4774a40';
export const KRK_GAMEPLAY_RELEASED = true;
export const KRK_FORMAL_COMPLETE_POLICY = false;
/**
 * Four involutive board isometries used in the frozen Lean setup proof.
 * `symId`, `symY`, `symSwap` and `symAnti` preserve king distance,
 * rook rays and move legality. No colour swap or board-history rewrite.
 */
export const KRK_FRAMES = Object.freeze(['id','flip-rank','swap-axis','anti-axis']);
export function krkTransformSquare(square, isometry='id') {
  if (!KRK_FRAMES.includes(isometry) || !Number.isInteger(square) ||
      square < 0 || square >= 64) return -1;
  const [x,y] = coords(square);
  if (isometry === 'flip-rank') return squareAt(x, 7-y);
  if (isometry === 'swap-axis') return squareAt(y, x);
  if (isometry === 'anti-axis') return squareAt(7-y, 7-x);
  return square;
}
export const KRK_WITNESS_RULES = Object.freeze({
  rescue: 'EndgameChess.Rules.krk_barrier_rook_rescue',
  wall: 'EndgameChess.Rules.krk_wall_rook_move',
  pursuit: 'EndgameChess.Rules.krk_pursuit_king_move'
});

const delta = (x, y) => Math.abs(x - y);
const farFile = x => x >= 4 ? 0 : 7;
const waitFile = (r, x) => x >= 4 ? (r === 0 ? 1 : 0) : (r === 7 ? 6 : 7);

/**
 * Unlike a theorem of ActualWin, a local geometric lemma is only applicable
 * after its concrete, exact-KRK, strong-turn hypotheses have been checked.
 */
function frame(state, isometry='id') {
  if (!KRK_FRAMES.includes(isometry)) return null;
  if (!state || state.material !== 'krk' || !Array.isArray(state.board) ||
      !Array.isArray(state.history) || !Number.isInteger(state.halfmove) ||
      state.halfmove < 0) return null;
  const board = state.board;
  const rook = board.find(p => p && p[1] === 'R');
  if (!rook) return null;
  const strong = rook[0];
  if (state.turn !== strong || validateSetup(board, 'krk', strong) !== null ||
      outcome(board, strong, state.history, state.halfmove).kind !== 'ongoing') return null;
  const sk = findKing(board, strong), rs = board.indexOf(rook);
  const wk = findKing(board, opposite(strong));
  const [sx, sy] = coords(krkTransformSquare(sk,isometry));
  const [rx, ry] = coords(krkTransformSquare(rs,isometry));
  const [wx, wy] = coords(krkTransformSquare(wk,isometry));
  return {board, strong, sk, rs, wk, sx, sy, rx, ry, wx, wy, isometry};
}

function result(state, f, rule, to, detail) {
  // All four mapped frames are involutions. Check the pulled-back move on the
  // ORIGINAL (history-bearing) board, never on a fabricated fresh board.
  const fromOriginal = krkTransformSquare(detail.from, f.isometry);
  const toOriginal = krkTransformSquare(to, f.isometry);
  const move = legalMoves(f.board, f.strong).find(
    m => m.from === fromOriginal && m.to === toOriginal
  );
  // Fail closed, even if a translation mistake makes a Lean-guaranteed move illegal.
  if (!move) return null;
  return Object.freeze({
    move, origin: 'local-lean-geometric-witness', isometry: f.isometry,
    rule: KRK_WITNESS_RULES[rule], ruleKey: rule, parent: KRK_PARENT_SHA,
    premises: detail.premises, postcondition: detail.postcondition,
    reason: detail.reason, maxMatePlies: null,
    isCompleteWinningPolicy: false,
    inputHalfmove: state.halfmove, inputHistoryLength: state.history.length
  });
}

/**
 * Choose exactly one *requested* constructive witness, not a move from an
 * unspecified or heuristic fallback policy. All three rules require
 * sk.rank < rook.rank < wk.rank IN THE EXPLICIT LEAN FRAME.
 * The user must name a frame; we do not select a global mating policy.
 */
export function krkLocalWitness(state, rule, isometry='id') {
  const f = frame(state, isometry);
  if (!f || f.sy >= f.ry || f.ry >= f.wy) return null;
  if (rule === 'rescue') {
    if (distance(f.rs, f.wk) >= 2) return null;
    const nx = farFile(f.wx);
    return result(state, f, rule, squareAt(nx, f.ry), {
      from: krkTransformSquare(f.rs, f.isometry),
      premises: 'sk.rank < rook.rank < wk.rank; d∞(rook, wk) < 2',
      postcondition: 'Far-file rook, d∞(rook, wk) >= 2; all weak replies retain a distant rank barrier.',
      reason: 'The frozen rook-rescue lemma moves the threatened rook to the opposite far file. This is a one-step safety certificate, not a global mate policy.'
    });
  }
  if (rule === 'wall') {
    const nx = waitFile(f.rx, f.wx);
    if (nx === f.rx || delta(nx, f.wx) < 3) return null;
    return result(state, f, rule, squareAt(nx, f.ry), {
      from: krkTransformSquare(f.rs, f.isometry),
      premises: 'sk.rank < rook.rank < wk.rank; same-rank distinct rook target >=3 files from weak king',
      postcondition: 'Every weak reply keeps the king above the wall and >=2 files from the new rook.',
      reason: 'The frozen wall-tempo lemma gives a legal rook move with all-reply confinement; it does not claim that repeated tempos force mate.'
    });
  }
  if (rule === 'pursuit') {
    if (f.sy + 1 !== f.ry || f.wy !== f.ry + 1 ||
        delta(f.rx, f.wx) < 3 || delta(f.sx, f.wx) < 2) return null;
    const nx = f.wx > f.sx ? f.sx + 1 : f.sx - 1;
    return result(state, f, rule, squareAt(nx, f.sy), {
      from: krkTransformSquare(f.sk, f.isometry),
      premises: 'sk.rank+1=rook.rank; wk.rank=rook.rank+1; file distance(sk,wk)>=2; file distance(rook,wk)>=3',
      postcondition: 'King advances one file; all weak replies preserve rook margin >=2 or exit the lower band.',
      reason: 'The frozen pursuit lemma moves the strong king one file toward the weak king and certifies the restricted reply shape.'
    });
  }
  return null;
}

/**
 * Supplementary independent diagnostic for the *local* all-reply conclusions.
 * Enumerating replies is NOT the mathematical proof of the Lean lemmas and
 * cannot certify a winning game or bound. No minimax, engine, table or search.
 */
export function auditKRKLocalWitness(state, witness) {
  const f = frame(state, witness?.isometry);
  if (!f || !witness || witness.isCompleteWinningPolicy ||
      witness.parent !== KRK_PARENT_SHA ||
      !Object.values(KRK_WITNESS_RULES).includes(witness.rule)) return {ok:false, replies:0};
  const expected = krkLocalWitness(state, witness.ruleKey, witness.isometry);
  if (!expected || expected.move.from !== witness.move.from ||
      expected.move.to !== witness.move.to) return {ok:false, replies:0};
  const next = applyMove(f.board, witness.move), weak = opposite(f.strong);
  const replies = legalMoves(next, weak);
  if (!replies.length) return {ok:false, replies:0};
  const [oldWx, oldWy] = coords(krkTransformSquare(f.wk, f.isometry));
  const allGood = replies.every(m => {
    if (m.capture || m.piece !== weak + 'K') return false;
    const b = applyMove(next, m), rs = b.indexOf(f.strong + 'R');
    const sk = findKing(b, f.strong), wk = findKing(b, weak);
    if (sk < 0 || rs < 0 || wk < 0) return false;
    const [sx, sy] = coords(krkTransformSquare(sk, f.isometry));
    const [rx, ry] = coords(krkTransformSquare(rs, f.isometry));
    const [wx, wy] = coords(krkTransformSquare(wk, f.isometry));
    if (distance(rs, wk) < 2 || delta(wx, oldWx) > 1 || delta(wy, oldWy) > 1) return false;
    if (witness.ruleKey === 'rescue') {
      return sy < ry && ry < wy && delta(rx, wx) >= 2;
    }
    if (witness.ruleKey === 'wall') {
      return sy < ry && ry < wy && delta(rx, wx) >= 2;
    }
    return sy + 1 === ry && delta(rx, wx) >= 2 &&
      (wy >= ry + 2 || (wy === ry + 1 && delta(wx, oldWx) === 1));
  });
  return {ok:allGood, replies:replies.length};
}
