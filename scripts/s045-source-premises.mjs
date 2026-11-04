/**
 * S045: independent source-constructor authentication for the THREE exact
 * previously unchecked KQK/S044 families. Read-only, never a move selector.
 *
 * Frozen Lean: EC-T0050 c72365a8ba46f59114a2a77d9d38993f6a52df80
 *   Rules/KQK/TightEntry.lean: protected_file_entry.forward
 *   Rules/KQK/SameRankEntry.lean: backrank_entry.final and
 *      protected_backrank_entry.
 *
 * Each authenticated action has its own complete hypotheses and exact
 * source-defined chess move verified, plus every legal immediate reply.
 * MateWithin existence is NOT a universal JS-controller termination proof.
 */
import {applyMove,coords,inCheck,legalMoves,opposite,positionKey,
  validateSetup} from '../src/chess.js';
import {KQK32_FRAMES} from './kqk32-far-file-audit.mjs';

export const S045_FORWARD='KQK.TightEntry.protected_file_entry.forward_wall';
export const S045_BACK='KQK.SameRankEntry.backrank_entry.king_to_weak_file';
export const S045_QUEEN='KQK.SameRankEntry.protected_backrank_entry.queen_up';
export const S045_RULES=Object.freeze([S045_FORWARD,S045_BACK,S045_QUEEN]);

const failed=reason=>({status:'failed-premise',reason});
const unchecked=reason=>({status:'unchecked',reason});
const dist=(a,b)=>Math.max(Math.abs(a[0]-b[0]),Math.abs(a[1]-b[1]));
const equal=(a,b)=>a[0]===b[0]&&a[1]===b[1];
const parseKey=key=>{
  if(typeof key!=='string')return null;
  const [s,turn]=key.split(':');
  if(s?.length!==128||!['w','b'].includes(turn))return null;
  return {board:s.match(/.{2}/g).map(p=>p==='--'?null:p),turn};
};
function geometry(board,strong,frame){
  const f=KQK32_FRAMES[frame];
  if(!f)return null;
  const ki=board.indexOf(strong+'K'),qi=board.indexOf(strong+'Q'),
    wi=board.indexOf(opposite(strong)+'K');
  if(ki<0||qi<0||wi<0)return null;
  return {ki,qi,wi,k:f(coords(ki)),q:f(coords(qi)),w:f(coords(wi))};
}
/** Check a real two-move history, not just a token's claimed counters.
 * Match the archived post-strong position, exact legal weak reply,
 * immutable original frame and predecessor Lean constructor.
 */
function incoming(state,strong,frame,token,kind){
  if(!token)return unchecked('genuine source-issued incoming token required');
  if(token.frame!==frame)
    return unchecked('cross-frame source token bridge not independently proved');
  if(token.kind!==kind||token.strong!==strong||
     !Number.isSafeInteger(token.moveCount)||
     token.moveCount+1!==state.log.length||
     state.history.length!==state.log.length+1)
    return failed('incoming source token kind/strong/full ply-count mismatch');
  const weak=opposite(strong),prior=parseKey(state.history.at(-2));
  const origin=parseKey(state.history.at(-3));
  if(!prior||prior.turn!==weak||!origin||origin.turn!==strong||
     positionKey(state.board,state.turn)!==state.history.at(-1)||
     prior.board[token.king]!==strong+'K'||
     prior.board[token.queen]!==strong+'Q'||
     prior.board[token.weak]!==weak+'K'||
     state.board[token.king]!==strong+'K'||
     state.board[token.queen]!==strong+'Q')
    return failed('token does not match recorded predecessor boards');
  const wk=state.board.indexOf(weak+'K');
  const reply=legalMoves(prior.board,weak).find(m=>
    m.from===token.weak&&m.to===wk);
  if(!reply||positionKey(applyMove(prior.board,reply),strong)!==
     positionKey(state.board,strong))
    return failed('the logged weak transition is not an exact legal reply');
  const before=geometry(origin.board,strong,frame);
  const after=geometry(prior.board,strong,frame);
  if(!before||!after||!equal(before.q,after.q)||
     !equal(before.w,after.w)||
     origin.board.filter(Boolean).length!==3)
    return failed('predecessor construction does not preserve KQK geometry');
  // Also replay the actual preceding strong move in the ORIGINAL board:
  // a plausible token coordinate must not authenticate an illegal/fabricated
  // attacker transition preserved only as a handwritten history key.
  const sourceMove=legalMoves(origin.board,strong).find(m=>
    m.from===before.ki&&m.to===after.ki);
  if(validateSetup(origin.board,'kqk',strong)!==null||!sourceMove||
     positionKey(applyMove(origin.board,sourceMove),weak)!==
       positionKey(prior.board,weak))
    return failed('recorded previous strong source action is not a legal exact replay');
  const [kx,ky]=before.k,[qx,qy]=before.q,[wx,wy]=before.w;
  if(kind==='tight-file'){
    // TightEntry.tight_king_step: K(sk.file,wk.rank), then a weak reply.
    if(qx>1||wx<3||qy!==ky+2||wy!==ky+1||
       Math.abs(kx-wx)<2||!equal(after.k,[kx,wy]))
      return failed('logged TightEntry king-step source premises fail');
  }else{
    // SameRankEntry.backrank_entry last case: K(wk.file,0).
    if(ky!==0||qy!==0||wy<2||
       Math.abs(qx-wx)!==1||Math.abs(kx-wx)!==1||
       Math.abs(kx-qx)!==2||!equal(after.k,[wx,ky]))
      return failed('logged SameRankEntry backrank king-step premises fail');
  }
  return null;
}

export function authenticateS045Action(state,strong,choice,token=null){
  const phase=choice?.sourcePhase;
  if(!S045_RULES.includes(phase))
    return {status:'not-independently-checked',theorem:phase??null};
  if(!state||state.material!=='kqk'||state.turn!==strong||
     validateSetup(state.board,'kqk',strong)!==null)
    return failed('not a valid KQK strong-turn source position');
  const frame=choice.frame??token?.frame??null;
  if(!Object.hasOwn(KQK32_FRAMES,frame))
    return unchecked('source choice and token have no verified frame');
  if(token&&token.frame!==frame)
    return unchecked('source choice switched theorem frame without transport');
  if(phase===S045_FORWARD){
    const check=incoming(state,strong,frame,token,'tight-file');
    if(check)return check;
  }else if(token){
    // The direct protected Q branch needs no incoming token, but the
    // two-ply backrank continuation does and must be genuine.
    const check=incoming(state,strong,frame,token,'backrank-protected');
    if(check)return check;
  }
  const g=geometry(state.board,strong,frame),weak=opposite(strong);
  if(!g)return failed('missing framed source geometry');
  const [kx,ky]=g.k,[qx,qy]=g.q,[wx,wy]=g.w;
  if(inCheck(state.board,weak))
    return failed('weak king is in check at source strong-turn entry');
  let from,to;
  if(phase===S045_FORWARD){
    // TightEntry.protected_file_entry: in the forward branch the queen
    // moves exactly to (strongKing.file+1, queen.rank).
    if(qx>1||qx===kx+1||wx<2||qy!==ky+1||qy<2||
       wy>ky||ky>wy+1||Math.abs(kx-wx)<2||
       kx===5&&ky===1&&wx===7&&wy===0||kx+2>wx)
      return failed('protected_file_entry forward hypotheses fail');
    from=g.qi;to=[kx+1,qy];
    // The frozen proof calls a swap/reflectX framed wall theorem:
    // after Q-right, king.file < queen.file < weak.file, the queen
    // stands above the weak king, and transformed OpenBand holds.
    // Frozen TightEntry.lean protected_file_entry lines 114-129:
    // sk.file <= 4 uses wall_weak_ninety_two. The complementary sk.file=5
    // (hence weak.file=7) uses edge_wall_weak_open_bound and moves the
    // protected queen to framed FILE SIX, not file five.
    const ordinaryWall=kx<=4&&to[0]<=5;
    const edgeWall=kx===5&&wx===7&&to[0]===6;
    if(!(kx<to[0]&&to[0]<wx&&wy<qy&&
       (ordinaryWall||edgeWall)&&dist(g.k,to)<=1))
      return failed('forward wall/safe-queen framed source postcondition fails');
  }else if(phase===S045_BACK){
    // The final case after not-file-wall, not-offrank, not-adjacent.
    if(ky!==0||qy!==0||wy<2||qx===wx||
       Math.abs(qx-wx)!==1||Math.abs(kx-wx)!==1||
       Math.abs(kx-qx)!==2)
      return failed('backrank_entry final king-step hypotheses fail');
    from=g.ki;to=[wx,ky];
  }else{
    // protected_backrank_entry: Q(q.file,1) and low_rank_weak_bound.
    if(ky!==0||qy!==0||wy<2||Math.abs(kx-qx)!==1||
       qx===wx||dist(g.k,[qx,1])>1)
      return failed('protected_backrank_entry adjacent/safe hypotheses fail');
    from=g.qi;to=[qx,1];
  }
  const f=KQK32_FRAMES[frame];
  const action=legalMoves(state.board,strong).find(m=>
    m.from===choice.move?.from&&m.to===choice.move?.to);
  if(!action||action.from!==from||!equal(f(coords(action.to)),to))
    return failed('actual move is not the exact legal frozen Lean constructor');
  const after=applyMove(state.board,action),h=geometry(after,strong,frame);
  if(!h||!equal(phase===S045_BACK?h.k:h.q,to)||
     !equal(phase===S045_BACK?h.q:h.k,phase===S045_BACK?g.q:g.k)||
     !equal(h.w,g.w))
    return failed('source-selected action changed an unrelated piece');
  if(phase===S045_BACK){
    const out=choice.continuationPhase;
    if(!out||out.kind!=='backrank-protected'||out.frame!==frame||
       out.strong!==strong||out.king!==h.ki||out.queen!==h.qi||
       out.weak!==h.wi||out.moveCount!==state.log.length+1)
      return failed('actual two-ply backrank source continuation token missing');
  }
  const replies=legalMoves(after,weak);
  // Both two-ply source constructors use mateWithin_pair, requiring
  // an actual legal defender escape; protected queen is choose-based
  // and may terminate immediately at mate (but never stalemate).
  if(phase!==S045_QUEEN&&!replies.length)
    return failed('source pair constructor has no legal defender reply');
  if(phase===S045_QUEEN&&!replies.length&&!inCheck(after,weak))
    return failed('protected queen constructor leads to stalemate');
  for(const reply of replies){
    if(reply.capture===strong+'Q')
      return failed('source permits immediate legal queen capture');
    const child=applyMove(after,reply);
    const childG=geometry(child,strong,frame);
    if(!childG||validateSetup(child,'kqk',strong)!==null||
       inCheck(child,weak)||!equal(childG.k,h.k)||
       !equal(childG.q,h.q))
      return failed('weak reply breaks framed KQK legal/material invariant');
    if(phase===S045_BACK){
      // All-reply target of safe_reply for protected_backrank_entry.
      if(childG.w[1]<2||Math.abs(childG.k[0]-childG.q[0])!==1||
         childG.w[0]===childG.q[0])
        return failed('backrank all-reply protected-queen premises fail');
    }
  }
  return {status:'authenticated',theorem:phase,frame,
    frameOrigin:choice.frame?'choice':'source-issued-token',
    exactMove:action.from+'-'+action.to,legalWeakReplies:replies.length,
    scope:'frozen local constructor, genuine prior token where needed and all legal immediate replies',
    globalMateCertified:false,krkTerminationCertified:false};
}
