/** Independent, deterministic adversarial move selector.
 * IMPORTANT: The rook scorer is an EXPERIMENTAL heuristic, not proof extraction.
 * Geometry only; no tablebases, position files, chess engine or network requests.
 */
import { legalMoves, applyMove, inCheck, findKing, distance, coords, opposite, outcome } from './chess.js';
import { chooseProofPattern } from './proof-policy.js';

function extraPiece(board){return board.find(p=>p && p[1]!=='K')||null;}
function edgeDistance(square){const [x,y]=coords(square);return Math.min(x,7-x,y,7-y);}
function rookEvaluation(board,turn){
  const rook=extraPiece(board);
  if(!rook||rook[1]!=='R')return 0; // Capturing the rook draws; never score as a win.
  const strong=rook[0], weak=opposite(strong), sk=findKing(board,strong),wk=findKing(board,weak);
  const end=outcome(board,turn);
  if(end.kind==='mate')return end.winner===strong?100000:-100000;
  if(end.kind==='stalemate'||end.kind==='75-move'||end.kind==='fivefold')return -12000;
  const d=distance(sk,wk);
  const rs=board.indexOf(rook), protectedRook=distance(sk,rs)===1;
  const captureRisk=distance(wk,rs)===1&&!protectedRook;
  const [rx,ry]=coords(rs),[kx,ky]=coords(wk);
  const rookCuts = rx===kx||ry===ky;
  // Proof-inspired themes: safe rook, restrict the lone king, move the king close.
  // Numbers are NOT certified by the frozen theorem.
  return 230 - 14*d + 55*(3-edgeDistance(wk)) + (rookCuts?18:0)
    + (protectedRook?7:0) - (captureRisk?280:0)
    + (inCheck(board,weak)?12:0) - (legalMoves(board,weak).length<2?12:0);
}
function drawEvaluation(board,turn,computer){
  // All play remains a draw: choose awkward legal moves, prefer a free capture.
  const extra=extraPiece(board),ck=findKing(board,computer),hk=findKing(board,opposite(computer));
  const [x,y]=coords(ck);
  return (extra?.[0]===opposite(computer)?-6:6) + 2*(3-Math.abs(x-3.5))
    + 2*(3-Math.abs(y-3.5)) - distance(ck,hk)*0.1;
}
function score(board,turn,material,computer){
  if(material==='krk'){
    const rook=extraPiece(board);
    if(!rook)return 0;
    return rookEvaluation(board,turn)*(rook[0]===computer?1:-1);
  }
  return drawEvaluation(board,turn,computer);
}
function minimax(board,turn,material,computer,depth,alpha,beta){
  const moves=legalMoves(board,turn);
  if(!moves.length||depth===0)return score(board,turn,material,computer);
  // Negamax not used: scores are always expressed from the computer's perspective.
  const maximizing=turn===computer;
  let best=maximizing?-Infinity:Infinity;
  for(const m of moves){
    const next=applyMove(board,m);
    const val=minimax(next,opposite(turn),material,computer,depth-1,alpha,beta);
    if(maximizing){best=Math.max(best,val);alpha=Math.max(alpha,best);}
    else {best=Math.min(best,val);beta=Math.min(beta,best);}
    if(beta<=alpha)break;
  }
  return best;
}
export function chooseDecision(state,computerColor){
  const moves=legalMoves(state.board,state.turn);
  if(state.turn!==computerColor||!moves.length)return null;
  const proof=chooseProofPattern(state,computerColor,moves);
  if(proof)return proof;
  const rookGame=state.material==='krk' && extraPiece(state.board)?.[1]==='R';
  // Depth-two adversarial replies; no precomputed position evaluations.
  const depth=rookGame?2:1;
  let best=null,bestScore=-Infinity;
  for(const move of moves){
    const board=applyMove(state.board,move);
    let value=minimax(board,opposite(state.turn),state.material,computerColor,depth,-Infinity,Infinity);
    // Explicit tie-breaks: captures and mate are preferable; stalemate is not for the rook attacker.
    if(move.capture)value+=rookGame ? (move.capture[1]==='R'?500:0) : 30;
    if(rookGame && outcome(board,opposite(state.turn)).kind==='mate')value+=10000;
    if(value>bestScore){bestScore=value;best=move;}
  }
  return {move:best,origin:'experimental-heuristic',rule:'local minimax fallback',
    reason:'No locally implemented proof-construction branch covers this turn; independent geometric evaluation and lookahead choose a legal move. Not certified.'};
}
export function chooseMove(state,computerColor){return chooseDecision(state,computerColor)?.move || null;}
export function strategyLabel(material){return material==='krk'?'Proof-pattern moves where implemented; EXPERIMENTAL fallback elsewhere':'Any legal move (dead-position theorem)';}
