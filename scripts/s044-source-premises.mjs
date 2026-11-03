/**
 * S044: independent replay of two frozen local KQK constructions:
 * FarFilePreparation.far_file_preparation and BandRaise.king_cross /
 * its non-corner queen_rise continuation.
 *
 * Pinned Lean EC-T0050 @ c72365a8ba46f59114a2a77d9d38993f6a52df80.
 * Read-only diagnostic: NEVER a chess move selector, mate proof or
 * certificate for changing source frames or for FIDE history.
 */
import {applyMove,coords,inCheck,legalMoves,opposite,validateSetup}
  from '../src/chess.js';
import {KQK32_FRAMES} from './kqk32-far-file-audit.mjs';

export const S044_FAR='KQK.FarFilePreparation.far_file_preparation.escape_preserving';
export const S044_CROSS='KQK.BandRaise.king_cross';
export const S044_RISE='KQK.BandRaise.prepared_raise_bound.queen_rise';
export const S044_RULES=Object.freeze([S044_FAR,S044_CROSS,S044_RISE]);

const fail=reason=>({status:'failed-premise',reason});
const unknown=reason=>({status:'unchecked',reason});
const same=(a,b)=>a[0]===b[0]&&a[1]===b[1];
const dist=(a,b)=>Math.max(Math.abs(a[0]-b[0]),Math.abs(a[1]-b[1]));
const rank=(k,q)=>2*(7-k[0])+2*(7-q[0])+4*(5-q[1]);
function geometry(board,strong,frame){
  const f=KQK32_FRAMES[frame];
  if(!f)return null;
  const sk=board.indexOf(strong+'K'),queen=board.indexOf(strong+'Q');
  const wk=board.indexOf(opposite(strong)+'K');
  if(sk<0||queen<0||wk<0)return null;
  return {sk,queen,wk,k:f(coords(sk)),q:f(coords(queen)),
    w:f(coords(wk))};
}
const prepared=(k,q,w)=>
  k[1]<q[1]&&q[1]<w[1]&&q[0]<w[0]&&q[1]<=5&&
  k[1]+1===q[1]&&q[0]<=k[0]&&k[0]<=w[0];

/** Reconstruct actual source-issued incoming token identity. This cannot
 * prove a different symmetry-frame transport. */
function tokenIdentity(state,strong,token,frame){
  if(token===null)return null;
  if(token.frame!==frame)
    return unknown('cross-frame token bridge has not been verified');
  if(token.strong!==strong||!Number.isSafeInteger(token.moveCount)||
     state.log.length!==token.moveCount+1||
     state.board[token.king]!==strong+'K'||
     state.board[token.queen]!==strong+'Q')
    return fail('source token king/queen/strong/history identity mismatch');
  const wk=state.board.indexOf(opposite(strong)+'K');
  if(wk===token.weak||!Number.isInteger(token.weak)||
     token.weak<0||token.weak>=64||
     dist(coords(wk),coords(token.weak))!==1)
    return fail('source token does not span exactly one legal weak reply');
  return null;
}
export function authenticateS044Action(state,strong,choice,token=null){
  const phase=choice?.sourcePhase;
  if(!S044_RULES.includes(phase))
    return {status:'not-independently-checked',theorem:phase??null};
  if(!state||state.material!=='kqk'||state.turn!==strong||
     validateSetup(state.board,'kqk',strong)!==null)
    return fail('not a valid KQK strong-turn theorem position');
  const frame=choice.frame??token?.frame??null;
  if(!Object.hasOwn(KQK32_FRAMES,frame))
    return unknown('no genuine source frame for this theorem instance');
  const tokenResult=tokenIdentity(state,strong,token,frame);
  if(tokenResult)return tokenResult;
  const g=geometry(state.board,strong,frame);
  if(!g)return fail('missing original framed KQK geometry');
  const [kx,ky]=g.k,[qx,qy]=g.q,[wx,wy]=g.w;
  const weak=opposite(strong);
  if(inCheck(state.board,weak))
    return fail('the weak king is already in check on the strong turn');

  let from,to;
  if(phase===S044_FAR){
    // FarFilePreparation.lean lines 11-20: gap, right, offKing,
    // offWeak, notFar. Its proof picks an explicit escape file.
    if(ky+2>wy||wx<4||qy===ky||qy===wy||qx<2)
      return fail('far_file_preparation geometric hypotheses fail');
    const escape=wx===7?6:wx+1;
    const f=escape===Math.abs(qy-wy)?1:0;
    from=g.queen;to=[f,qy];
  }else if(phase===S044_CROSS){
    // BandRaise.lean king_cross: Prepared + close + gap + far + low.
    if(!prepared(g.k,g.q,g.w)||wx>kx+1||qx+1!==wx||
       qy+2>wy||qy>4)
      return fail('king_cross Prepared/close/gap/far/low premises fail');
    from=g.sk;to=[wx,qy];
  }else{
    // The non-corner branch of prepared_raise_bound follows the *real*
    // band-raise token. The exceptional corner has its own theorem path.
    if(token===null||token.kind!=='band-raise')
      return unknown('queen_rise requires actual king_cross reply token');
    const oldWeak=KQK32_FRAMES[frame](coords(token.weak));
    if(ky!==qy||kx!==qx+1||oldWeak[0]!==kx||qy>4||
       wx<kx||wy<qy+2)
      return fail('queen_rise king_cross reply invariant fails');
    if(qy===4&&kx===7)
      return unknown('exceptional corner uses knight_box_bound, not queen_rise');
    from=g.queen;to=[qx,qy+1];
  }

  const actual=legalMoves(state.board,strong).find(m=>
    m.from===choice.move?.from&&m.to===choice.move?.to);
  if(!actual||actual.from!==from||
     !same(KQK32_FRAMES[frame](coords(actual.to)),to))
    return fail('source-selected move is not the exact legal Lean constructor');
  const board=applyMove(state.board,actual);
  const after=geometry(board,strong,frame);
  if(!after||!same(phase===S044_CROSS?after.k:after.q,to)||
     (phase!==S044_CROSS&&!same(after.k,g.k))||
     (phase===S044_CROSS&&!same(after.q,g.q))||
     !same(after.w,g.w))
    return fail('piece preservation after frozen constructor fails');
  const replies=legalMoves(board,weak);
  if(!replies.length)
    return fail('pair theorem requires an existing legal weak escape');

  for(const reply of replies){
    if(reply.capture===strong+'Q')
      return fail('legal weak reply captures the queen');
    const child=applyMove(board,reply);
    const h=geometry(child,strong,frame);
    if(!h||validateSetup(child,'kqk',strong)!==null||
       !same(h.k,after.k)||!same(h.q,after.q)||
       inCheck(child,weak))
      return fail('defender reply breaks frozen IsKQK/nonchecking invariant');
    if(phase===S044_FAR){
      // All-reply result on FarFilePreparation.lean lines 18-20.
      if(h.w[0]<3||h.w[1]<ky+1||dist(h.k,h.w)<2||h.q[1]===h.w[1])
        return fail('far-file all-reply right/upper/distance/off-rank fails');
    }else if(phase===S044_CROSS){
      // All-reply result of BandRaise.king_cross, lines 8-15.
      if(h.w[0]<wx||h.w[1]<qy+2)
        return fail('king_cross all-reply right/above invariants fail');
    }else{
      // Queen-rise branch invokes the smaller-potential Prepared recursion.
      const oldK=[qx,qy-1];
      if(!prepared(h.k,h.q,h.w)||
         rank(h.k,h.q)+4>rank(oldK,g.q))
        return fail('queen_rise all-reply Prepared/potential decrease fails');
    }
  }
  return {status:'authenticated',theorem:phase,frame,
    frameOrigin:choice.frame?'choice':'source-issued-token',
    exactMove:actual.from+'-'+actual.to,legalWeakReplies:replies.length,
    scope:'only frozen local premises, exact source action and every immediate reply',
    globalMateCertified:false};
}
