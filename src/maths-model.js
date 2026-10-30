/** Mathematics-only classification and independent experimental KRK access.
 * A proved game outcome does NOT prove the experimental JS policy complete.
 * No engine, search or per-position tables participate in move choice.
 */
import {makeBoard,validateSetup,legalMoves,outcome,distance,findKing,attacks,opposite} from './chess.js';
export const INVENTORY=Object.freeze(['R','N','B','Q','K','B','N','R',...Array(8).fill('P')]);
export const SUPPORTED=Object.freeze(['K','B','N','R','Q']);
export const THEOREMS=Object.freeze({
 kk:{id:'EC-T0003',equation:'V(K + K) = D'},
 kbk:{id:'EC-T0004',equation:'V(K + B : K) = D'},
 knk:{id:'EC-T0005',equation:'V(K + N : K) = D'},
 krk:{id:'EC-T0048',equation:'W₅₀(p) ⇔ (t = σ) ∨ Mate(p) ∨ (SafeRook(p) ∧ LegalReply(p))'},
 kqk:{id:'EC-T0050',equation:'W₅₀(p) ⇔ (t = σ) ∨ Mate(p) ∨ (SafeQueen(p) ∧ LegalReply(p))'}
});
export const blankBoard=()=>makeBoard();
export const count=(board,piece)=>board.filter(p=>p===piece).length;
export const extras=board=>board.filter(p=>p&&p[1]!=='K');
export function materialOf(board){
 const xs=extras(board);
 if(!xs.length)return 'kk';
 if(xs.length!==1)return null;
 return {B:'kbk',N:'knk',R:'krk',Q:'kqk'}[xs[0][1]]??null;
}
export function available(board,piece){
 if(!piece||!['w','b'].includes(piece[0])||!SUPPORTED.includes(piece[1]))return false;
 if(piece[1]==='K')return !board.includes(piece);
 return extras(board).length===0;
}
export function put(board,piece,to){
 if(!Number.isInteger(to)||to<0||to>63||!available(board,piece)||board[to])return null;
 const next=board.slice();next[to]=piece;return next;
}
export function relocate(board,from,to){
 if(!Number.isInteger(from)||from<0||from>63||!board[from])return null;
 if(!Number.isInteger(to)||to< -1||to>63||(to!==-1&&(to===from||board[to])))return null;
 const next=board.slice(),piece=next[from];next[from]=null;if(to!==-1)next[to]=piece;return next;
}
export function setupVerdict(board,turn){
 const material=materialOf(board);
 if(!material||count(board,'wK')!==1||count(board,'bK')!==1){
   return {kind:'incomplete',title:'Arrange a position',equation:'',canStart:false,material};
 }
 const reason=validateSetup(board,material,turn);
 if(reason)return {kind:'invalid',title:'Illegal position',equation:'',reason,canStart:false,material};
 const theorem=THEOREMS[material];
 if(!['krk','kqk'].includes(material))return {kind:'draw',title:'Guaranteed draw',equation:theorem.equation,source:theorem.id,canStart:true,material,human:extras(board).length?opposite(extras(board)[0][0]):turn};
 const extra=extras(board)[0],strong=extra[0],weak=opposite(strong);
 const weakKing=findKing(board,weak),extraSquare=board.indexOf(extra);
 // Frozen SafeRook/SafeQueen: distant from the weak king OR guarded by the strong king.
 // A king guards an adjacent square even when occupied by its own extra piece.
 const safeRook=distance(extraSquare,weakKing)>=2||distance(extraSquare,findKing(board,strong))===1;
 const terminal=outcome(board,turn);
 const mated=terminal.kind==='mate'&&terminal.winner===strong;
 const legal=legalMoves(board,turn).length>0;
 const win=(turn===strong&&legal)||mated||(turn===weak&&safeRook&&legal);
 return {kind:win?'win':'draw',title:win?('Winning for '+(strong==='w'?'White':'Black')):'Guaranteed draw',
  equation:theorem.equation,source:theorem.id,canStart:true,material,human:weak,
  experimental:true,strategyPending:false,safeRook,
  ...(material==='kqk'?{safeQueen:safeRook}:{}),terminal:terminal.kind};
}
