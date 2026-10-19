/** The playground's deliberately limited, independent chess rules implementation.
 * No engine, tablebase, remote lookup or dependency. Board indices: a1=0, h8=63.
 * Playable: K v K, K+B v K, K+N v K. KRK geometry remains for local rules tests only;
 * KRK play is explicitly blocked pending an owner-approved, completed upstream release.
 * No pawns/castling/en-passant.
 */
export const MATERIAL = Object.freeze({
  kk: { label: 'K vs K', extra: null, theorem: 'EC-T0003', outcome: 'Dead position', playable: true },
  kbk: { label: 'K+B vs K', extra: 'B', theorem: 'EC-T0004', outcome: 'Dead position', playable: true },
  knk: { label: 'K+N vs K', extra: 'N', theorem: 'EC-T0005', outcome: 'Dead position', playable: true },
  krk: { label: 'K+R vs K', extra: 'R', theorem: 'EC-T0019', outcome: 'Awaiting complete parent-release approval', playable: false },
});
const KNIGHT = [[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]];
const KING = [[1,1],[1,0],[1,-1],[0,1],[0,-1],[-1,1],[-1,0],[-1,-1]];
const ORTHO = [[1,0],[-1,0],[0,1],[0,-1]];
const DIAG = [[1,1],[1,-1],[-1,1],[-1,-1]];
export const opposite = color => color === 'w' ? 'b' : 'w';
export const coords = square => [square % 8, Math.floor(square / 8)];
export const squareAt = (x, y) => x >= 0 && x < 8 && y >= 0 && y < 8 ? y * 8 + x : -1;
export const squareName = square => `${'abcdefgh'[square % 8]}${1 + Math.floor(square / 8)}`;
export const distance = (a,b) => {const [x,y]=coords(a), [u,v]=coords(b);return Math.max(Math.abs(x-u),Math.abs(y-v));};
export const findKing = (board,color) => board.indexOf(`${color}K`);
export const makeBoard = () => Array(64).fill(null);

export function initialSetup(material='kk', stronger='w') {
  if (!MATERIAL[material]) throw new Error('Unknown material');
  const board=makeBoard();
  board[squareAt(4,0)]='wK'; board[squareAt(4,7)]='bK';
  if (MATERIAL[material].extra) {
    const square = stronger === 'w' ? squareAt(0,0) : squareAt(7,7);
    board[square]=`${stronger}${MATERIAL[material].extra}`;
  }
  return board;
}

function rayAttacks(board, from, target, dirs) {
  const [x,y]=coords(from);
  for (const [dx,dy] of dirs) {
    let nx=x+dx,ny=y+dy;
    while (squareAt(nx,ny)!==-1) {
      const sq=squareAt(nx,ny);
      if (sq===target) return true;
      if (board[sq]) break;
      nx+=dx; ny+=dy;
    }
  }
  return false;
}
export function attacks(board, color, target) {
  const [tx,ty]=coords(target);
  for(let s=0;s<64;s++){
    const p=board[s]; if(!p || p[0]!==color) continue;
    const [x,y]=coords(s),dx=tx-x,dy=ty-y;
    if(p[1]==='K' && Math.max(Math.abs(dx),Math.abs(dy))===1) return true;
    if(p[1]==='N' && (Math.abs(dx)===1 && Math.abs(dy)===2 || Math.abs(dx)===2 && Math.abs(dy)===1)) return true;
    if(p[1]==='B' && Math.abs(dx)===Math.abs(dy) && dx!==0 && rayAttacks(board,s,target,DIAG)) return true;
    if(p[1]==='R' && (dx===0 || dy===0) && (dx!==0 || dy!==0) && rayAttacks(board,s,target,ORTHO)) return true;
  }
  return false;
}
export function inCheck(board,color){
  const king=findKing(board,color);
  return king===-1 || attacks(board,opposite(color),king);
}
function destinations(board,from){
  const p=board[from];if(!p) return [];
  const [x,y]=coords(from), color=p[0],type=p[1];
  const squares=[];
  const push=(sq)=>{if(sq===-1)return false;const other=board[sq];if(other && (other[0]===color || other[1]==='K'))return false;squares.push(sq);return !other;};
  if(type==='K'||type==='N') {
    for(const [dx,dy] of (type==='K'?KING:KNIGHT)) push(squareAt(x+dx,y+dy));
  }else {
    const dirs=type==='R'?ORTHO:DIAG;
    for(const [dx,dy] of dirs){let nx=x+dx,ny=y+dy;while(squareAt(nx,ny)!==-1){const sq=squareAt(nx,ny);if(!push(sq))break;nx+=dx;ny+=dy;}}
  }
  return squares;
}
export function applyMove(board,move){const b=board.slice();b[move.to]=b[move.from];b[move.from]=null;return b;}
export function legalMoves(board,color){
  const moves=[];
  for(let from=0;from<64;from++){
    const piece=board[from]; if(!piece||piece[0]!==color)continue;
    for(const to of destinations(board,from)){
      const candidate={from,to,piece,capture:board[to]||null};
      if(!inCheck(applyMove(board,candidate),color)) moves.push(candidate);
    }
  }
  return moves;
}
export function validateSetup(board,material,turn){
  const data=MATERIAL[material]; if(!data)return 'Select a supported material class.';
  if(!Array.isArray(board)||board.length!==64)return 'Invalid board.';
  if(!['w','b'].includes(turn))return 'Choose the side to move.';
  if(board.some(p=>p!==null && !['wK','bK','wB','bB','wN','bN','wR','bR'].includes(p))) return 'Unsupported piece on board.';
  if(board.filter(p=>p==='wK').length!==1 || board.filter(p=>p==='bK').length!==1) return 'Place exactly one white king and one black king.';
  const extras=board.filter(p=>p && p[1]!=='K');
  if(data.extra ? extras.length!==1||extras[0][1]!==data.extra : extras.length!==0) return `Place exactly the pieces required for ${data.label}.`;
  if(distance(findKing(board,'w'),findKing(board,'b'))<2) return 'Kings may not touch or attack each other.';
  // After the last move, the side that is *not* to move cannot remain in check.
  if(inCheck(board,opposite(turn)))return 'Illegal: the player who just moved is still in check.';
  return null;
}
export function outcome(board,turn,history=[],halfmove=0){
  const moves=legalMoves(board,turn);
  if(!moves.length)return {kind:inCheck(board,turn)?'mate':'stalemate',winner:inCheck(board,turn)?opposite(turn):null};
  if(halfmove>=150)return {kind:'75-move'};
  const key=positionKey(board,turn);
  if(history.filter(k=>k===key).length>=5)return {kind:'fivefold'};
  return {kind:'ongoing'};
}
export function positionKey(board,turn){return `${board.map(p=>p||'--').join('')}:${turn}`;}
export function moveNotation(board,move,nextBoard,nextTurn){
  const piece=move.piece[1];const capture=Boolean(move.capture);
  const prefix=piece==='K'?'K':piece;
  const resulting=outcome(nextBoard,nextTurn);
  const suffix=resulting.kind==='mate'?'#':inCheck(nextBoard,nextTurn)?'+':'';
  return `${prefix}${capture?'x':''}${squareName(move.to)}${suffix}`;
}
export function play(state,move){
  const allowed=legalMoves(state.board,state.turn).find(m=>m.from===move.from&&m.to===move.to);
  if(!allowed)throw new Error('Illegal move');
  const board=applyMove(state.board,allowed),turn=opposite(state.turn);
  const history=state.history.concat(positionKey(board,turn));
  return {...state,board,turn,history,halfmove:allowed.capture?0:state.halfmove+1,
    log:state.log.concat(`${state.turn==='w'?'White':'Black'} ${moveNotation(state.board,allowed,board,turn)}`)};
}
export function newGame(board,turn,material){
  if(!MATERIAL[material]?.playable) throw new Error('This material class is not released for playground play. Wait for completed, frozen upstream results and owner approval.');
  const problem=validateSetup(board,material,turn);if(problem)throw new Error(problem);
  return {board:board.slice(),turn,material,halfmove:0,history:[positionKey(board,turn)],log:[]};
}
